var Puzzle = Backbone.Model.extend({
	initialize: function(puzzleObj) {
		var that = this;
		var temp = {};
		$.each(puzzleObj["hints"], function(name, hObj) {
			temp[name] = new Hint(hObj);
		});

		this.set("hints",temp);
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
				
				// puzzle results
				session.set("lastSolved", this.get("name"));
				this.killTeams();
				this.unlockResources();

				// remove timer
				clearInterval(stats[this.get("name")]["timerID"]);
				
				// set all hints to revealed
				$.each(stats[this.get("name")]["hintStats"], function(hname, hint) {
					hint["status"] = hintStatus.REVEALED;
				});

				// allot fans & log
				if (!give_up) {
					session.set("fans", session.get("fans") + stats[this.get("name")]["current_worth"]);
					logAction(logTypes.PUZZLE, "You solved <span id=\"" + this.get("name") + "\" class=\"puzzle_link clickable\">" + this.get("name") + "</span> [answer: "+entry+"] for " + stats[this.get("name")]["current_worth"] + " fans in " + Math.round((getCurrentDateTime()-session.get("puzzleStats")[this.get("name")]["start_time"])/60000) + " minutes.");
				}

				// advance location
				if (this.get("advance_location")) {
					var currentLoc = session.get("currentLocation") + 1;
					var now = getCurrentDateTime();
					var nowStr = now.getMonth()+1 + "/" + now.getDate() + "/" + now.getFullYear() + " ";
					if (now.getHours() < 10)
						nowStr += "0";
					nowStr += now.getHours() + ":";
					if (now.getMinutes() < 10)
						nowStr += "0";
					nowStr += now.getMinutes();

					while (locations[locOrder[currentLoc]].get("time_closed") < nowStr) {
						currentLoc++;
						// We need to skip over the puzzles appropriately as well, e.g. play cannon sounds for killed teams, show videos, etc.
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
				 	if ( $.inArray(tid, teams_killed) != -1 )  
				 		loc_desc = locations[locOrder[currentLoc]].get("self_flavor_text")
				 	 
				 	// Update location text
				 	$("#main #main_screen .left-sidebar .content .location_description").html( loc_desc );

					// if they are too early for the current location, display an alert
					var time_open = new Date(locations[locOrder[currentLoc]].get("time_open"));

					if (nowStr < locations[locOrder[currentLoc]].get("time_open")) {
						showAlert("oops! you're so fast. go reward yourself with a burger until " + locations[locOrder[currentLoc]].get("time_open"))
					}
				}

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


				// update the stats
				session.set("puzzleStats",stats);
				// if this is a mini, increment the meta counter so it knows to refresh the activity view
				session.set("renderMeta", session.get("renderMeta")+1);

				// If server saving is not verbose, we need to at least save when the answer is given
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
		
			response += entry + " - " + this.get("answers")[entry]["response"];
		}
		else {
			response += "<strong>" + entry + "</strong> is not the answer.</div>"
		}
		this.log(response);

		// Save session
		if (!debugActive("ephemeral_session")) {
			
			// If verbose, save whenever an answer is entered.  This updates logs, partial answers, and final answers.
			if( debugActive("verbose_server"))
				try { saveServerSession(session, tid); } catch (err) {}
			
			saveLocalSession();
		}
	},

	killTeams : function() {
		$.each(this.get("teams_killed"), function(index, id) {
			if (tid === id) {
				// this is current team! don't do anything! :)
			}
			else {
				teams[id].die();
				logAction(logTypes.KILL, "You killed <span id=\"" + id + "\" class=\"vid_link clickable\">" + teams[id].get("name") + "</span>");				
			}
		});
	},

	unlockResources : function() {
		$.each(this.get("resources_unlocked"), function(index, name) {
			resources[name].unlock();
			logAction(logTypes.RESOURCE, "You unlocked " + name + "!!!!!");
		});
	},


	// perhaps move this to Session.js
	log : function(entry) {
		var stats = $.extend(true, {}, session.get("puzzleStats"));
		stats[this.get("name")]["log"].push(entry);
		session.set("puzzleStats",stats);	
	}
});
