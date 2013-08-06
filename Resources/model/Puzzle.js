var Puzzle = Backbone.Model.extend({
	initialize: function(puzzleObj) {
		var that = this;
		var temp = {};
		$.each(puzzleObj["hints"], function(name, hObj) {
			temp[name] = new Hint(hObj);
		});

		this.set("hints",temp);
		this.notified = false;
	},

	checkAnswer : function(entry) {
		var stats = $.extend(true, {}, session.get("puzzleStats"));
		var response = "<div class='log_time'>" + getCurrentDateTimeString() + ": </div><div class='log_content'>";
		var give_up_code = "saveusthresh"
		var give_up = false

		if (entry === give_up_code) {
			give_up = confirm("Are you sure you want to give up on this puzzle? You will receive no fans if you choose to do so.")
		}

		if (stats[this.get("name")]["status"] === puzzleStatus.SOLVED || entry === "") { // puzzle already solved!
			return;
		}
		else if (give_up || entry in this.get("answers")) {
			if (give_up || this.get("answers")[entry]["type"] === answerTypes.FINAL) { // answer is correct final answer

				// update status object
				stats[this.get("name")]["status"] = puzzleStatus.SOLVED;

				// hide answer box
				$("#"+nameToId(this.get("name")) + " .answer_box").hide();
				
				// allot fans & log
				if (!give_up) {
					session.set("fans", session.get("fans") + stats[this.get("name")]["current_worth"]);
					logAction(logTypes.PUZZLE, "You solved <span id=\"" + this.get("name") + "\" class=\"puzzle_link clickable\">" + this.get("name") + "</span><table class=\"history-table\"><tr><td>Answer:</td><td>"+entry+"</td></tr><tr><td>Solve Time:</td><td>" + Math.round((getCurrentDateTime()-session.get("puzzleStats")[this.get("name")]["start_time"])/60000) + " minutes</td></tr><tr><td>Fans Gained:</td><td>" + stats[this.get("name")]["current_worth"] + "</td></tr></table>");
				}
				else
					logAction(logTypes.PUZZLE, "Thresh helped you with <span id=\"" + this.get("name") + "\" class=\"puzzle_link clickable\">" + this.get("name") + "</span><table class=\"history-table\"></table>");
	
				// puzzle results
				session.set("lastSolved", this.get("name"));
				this.killTeams();
				this.unlockResources();

				var accelerate_messages = false;
				var nextLoc = session.get("currentLocation") + 1;
				if( nextLoc < locOrder.length )
					accelerate_messages = locations[locOrder[nextLoc]].get("time_closed") < getCurrentDateTimeString(timeFormat.TWENTYFOUR);
				
				var latest_time = MessageController.startTimers(this.get("name"), accelerate_messages); 

				// remove timer
				clearInterval(stats[this.get("name")]["timerID"]);
				
				// set all hints to revealed
				$.each(stats[this.get("name")]["hintStats"], function(hname, hint) {
					hint["status"] = hintStatus.REVEALED;
				});

				stats = this.advanceLocation(stats, latest_time);

				// returning stats cause I don't know if javascript passes by reference here or not
				stats = this.returnToParentView(stats);

				// update the stats
				session.set("puzzleStats",stats);
				// if this is a mini, increment the meta counter so it knows to refresh the activity view
				session.set("renderMeta", session.get("renderMeta")+1);

				// If you've received no notification of success, get a popup
				if ( !this.notified )
					showPopup(this.get("answers")[entry]["response"]);
				

				// If server saving is not verbose, we need to at least save to the server when the answer is given
				if( !debugActive("verbose_server"))
					try { saveServerSession(session, tid); } catch (err) {}
			}
			else if (this.get("answers")[entry]["type"] === answerTypes.PARTIAL) { // answer is correct partial answer
				// reveal skipped hints
				puzzle = this;
				hints_to_skip = puzzle.get("answers")[entry]["skipped_hints"];
				var time_to_advance = 0;

				$.each(hints_to_skip, function(index, hint_name)  {
					if (hint_name in puzzle.get("hints")) {
						if ( stats[puzzle.get("name")]["hintStats"][hint_name]["status"] != hintStatus.REVEALED ) {
							stats[puzzle.get("name")]["hintStats"][hint_name]["status"] = hintStatus.SKIPPED;
							var time_remaining = stats[puzzle.get("name")]["hintStats"][hint_name]["remaining"];
							if (time_remaining > time_to_advance) {
								time_to_advance = time_remaining;
							}
						}
					}
					else {
						console.log("Attempted to skip hint that does not exist: " + hint_name)
					}
				});

				// advance timers for unskipped hints
				$.each(stats[this.get("name")]["hintStats"], function(hname, hint) {
					if ( !(hint["name"] in hints_to_skip) )
						hint["remaining"] -= time_to_advance;
				});

				// update the stats
				session.set("puzzleStats",stats);
			}
		
			response += "<strong>" + entry + "</strong> - " + this.get("answers")[entry]["response"];
		}
		else {
			response += "<strong>" + entry + "</strong> is not the answer.</div>"
		}
		this.log(response);

		saveSession();
	},

	returnToParentView : function(stats) {
		// go back to main or meta and change buttons if main
		if (this.get("meta") || session.getActivePuzzles().length === 1) {
			$('.main.active').removeClass('active');
			$('#main_screen').addClass('active');
			$('#start_code_box').show();
			$("#start_input").focus();
			$('#active_puzzle_button').hide();

			// change unfinished puzzles to ARCHIVED?? -- solvable but not active
			$.each(session.getActivePuzzles(), function(index, pname) {
				stats[pname]["status"] = puzzleStatus.ARCHIVED;
			});
		}
		else {
			var meta = getMetaName(this.get("start_code"));
			$('.main.active').removeClass('active');
			$('.main#'+nameToId(meta)).addClass('active');
		}

		return stats;
	},

	advanceLocation : function(stats, offset) {
		// advance location
		if (this.get("advance_location")) {
			var currentLoc = session.get("currentLocation") + 1;

			while (locations[locOrder[currentLoc]].get("time_closed") < getCurrentDateTimeString(timeFormat.TWENTYFOUR)) {
				// We need to skip over the puzzles appropriately as well, e.g. play cannon sounds for killed teams, show videos, etc.
				stats = this.skipLocation(currentLoc, stats, offset);
				currentLoc++;
			}
			session.set("currentLocation", currentLoc);

			var loc_desc = locations[locOrder[currentLoc]].get("flavor_text")
		 	var teams_killed = []
		 	 
		 	// Find all teams that get killed at next location
		 	$.each( locations[locOrder[currentLoc]].get("puzzles"), function(index, puzzle) {
		 		if (puzzle in puzzles) 
		 			teams_killed = teams_killed.concat(puzzles[puzzle].get("teams_killed"));
		 		else
		 			console.log("Tried to access a puzzle that doesn't exist: " + puzzle)
		 	});

		 	// If active team gets killed at next location, change location description
		 	if ( $.inArray(tid, teams_killed) != -1 && locations[locOrder[currentLoc]].get("self_flavor_text") != "")  
		 		loc_desc = locations[locOrder[currentLoc]].get("self_flavor_text")
		 	 
		 	// Update location text
		 	$("#main #main_screen .left-sidebar .content .location_description").html( loc_desc );

			// if they are too early for the current location, display an alert
			var time_open = new Date(locations[locOrder[currentLoc]].get("time_open"));

			if (getCurrentDateTimeString() < locations[locOrder[currentLoc]].get("time_open")) {
				showAlert("oops! you're so fast. go reward yourself with a burger until " + locations[locOrder[currentLoc]].get("time_open"))
			}
		}

		return stats;
	},

	skipLocation : function(loc_index, stats, offset) {
		offset = typeof offset !== 'undefined' ? offset : 0;

	 	$.each( locations[locOrder[loc_index]].get("puzzles"), function(index, puzzle_name) {
	 		if ( !(puzzle_name in puzzles) ) 
	 			console.log("Tried to access a puzzle that doesn't exist: " + puzzle)
	 		else {
	 			var puzzle = puzzles[puzzle_name]
				// update status object
				stats[puzzle.get("name")]["status"] = puzzleStatus.SOLVED;

				// hide answer box
				$("#"+nameToId(puzzle.get("name")) + " .answer_box").hide();
				
				logAction(logTypes.PUZZLE, "You were skipped over <span id=\"" + puzzle.get("name") + "\" class=\"puzzle_link clickable\">" + puzzle.get("name") + "</span><table class=\"history-table\"></table>");

				// puzzle results
				puzzle.killTeams(deathVolume.QUIET);
				puzzle.unlockResources();
				offset = offset + MessageController.startTimers(puzzle.get("name"), true, offset); 

				// remove timer
				clearInterval(stats[puzzle.get("name")]["timerID"]);
				
				// set all hints to revealed
				$.each(stats[puzzle.get("name")]["hintStats"], function(hname, hint) {
					hint["status"] = hintStatus.REVEALED;
				});

				if ( puzzle.notified ) 
					this.notified = true;
			}
		});
		return stats;
	},

	killTeams : function(deathVolume) {
		var kill = false;
		$.each(this.get("teams_killed"), function(index, id) {
			if (tid === id) {
				// this is current team! don't do anything! :)
			}
			else {
				teams[id].die(deathVolume);		
				kill = true;		
			}
		});

		if( kill )
			this.notified = true;
	},

	unlockResources : function() {
		var unlock = false;
		$.each(this.get("resources_unlocked"), function(index, name) {
			resources[name].unlock();
			logAction(logTypes.RESOURCE, "You unlocked " + name + "!");
			unlock = true;
		});

		if ( unlock )
			this.notified = true;
	},


	// perhaps move this to Session.js
	log : function(entry) {
		var stats = $.extend(true, {}, session.get("puzzleStats"));
		stats[this.get("name")]["log"].push(entry);
		session.set("puzzleStats",stats);	
	}
});
