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

	checkAnswer : function(entry, miniSolve) {
		if (arguments.length == 1) { 
			miniSolve = false;
		}
		var stats = $.extend(true, {}, session.get("puzzleStats"));
		var response = "<div class='log_time'>" + getCurrentDateTimeString() + ": </div><div class='log_content'>";
		var give_up_code = "saveusthresh"
		var give_up = false

		if (entry === give_up_code) {
			if (!miniSolve)
				give_up = confirm("Are you sure you want to give up on this puzzle? You will receive no fans if you choose to do so.")
			else
				give_up = true;
		}

		var encryptedEntry = "";
		if (entry !== "")
			encryptedEntry = MD5(entry);

		if (stats[this.get("name")]["status"] === puzzleStatus.SOLVED || entry === "") { // puzzle already solved!
			return;
		}
		else if (give_up || entry in this.get("answers") || encryptedEntry in this.get("answers") || miniSolve) {
			var finala = (this.get("answers")[encryptedEntry] && this.get("answers")[encryptedEntry]["type"] === answerTypes.FINAL);
                        finala = finala || (this.get("answers")[entry] && this.get("answers")[entry]["type"] === answerTypes.FINAL);
                        var partial = (this.get("answers")[encryptedEntry] && this.get("answers")[encryptedEntry]["type"] === answerTypes.PARTIAL);
			partial = partial || (this.get("answers")[entry] && this.get("answers")[entry]["type"] === answerTypes.PARTIAL);
			if (give_up || miniSolve || finala) { // answer is correct final answer
				// Set solve text appropriately if this puzzle would kill your team
				var solve_text = this.get("solve_text");
				if (this.get("self_solve_text") != "" && $.inArray(tid, this.get("teams_killed")) != -1 )
					solve_text =  this.get("self_solve_text")

				// update status object
				stats[this.get("name")]["status"] = puzzleStatus.SOLVED;
				stats[this.get("name")]["end_time"] = getCurrentDateTime();

				// hide answer box
				$("#"+nameToId(this.get("name")) + " .answer_box").hide();
				
				// allot fans & log
				if (!give_up) {
					session.set("fans", session.get("fans") + stats[this.get("name")]["current_worth"]);
					logAction(logTypes.PUZZLE, "You solved <span id=\"" + this.get("name") + "\" class=\"puzzle_link clickable\">" + this.get("name") + "</span><table class=\"history-table\"><tr><td>Answer:</td><td>"+getAnswerToPuzzle(this.get("name"))+"</td></tr><tr><td>Solve Time:</td><td>" + Math.round((getCurrentDateTime()-session.get("puzzleStats")[this.get("name")]["start_time"])/60000) + " minutes</td></tr><tr><td>Fans Gained:</td><td>" + stats[this.get("name")]["current_worth"] + "</td></tr><tr></table>");
				}
				else
					logAction(logTypes.PUZZLE, "Thresh helped you with <span id=\"" + this.get("name") + "\" class=\"puzzle_link clickable\">" + this.get("name") + "</span><table class=\"history-table\"></table>");
				stats[this.get("name")]["current_fans"] = session.get("fans");
				
				// congrats message
				if (!miniSolve) {
					var title = "CORRECT!";
					if (give_up) title = "Saved by Thresh!";
					$('#popup_body').addClass('solve-popup');
					showPopup("<h1 id=\"popup_solve_text\">" + title + "</h1><hr /><p>" + solve_text + "</p>");
					
				}

				// puzzle results
				session.set("lastSolved", this.get("name"));
				logAction(logTypes.STORY, solve_text);

				this.killTeams();
				this.unlockResources();

				// sounds!
				if (!miniSolve && this.get("teams_killed").length === 0) {
					playSound("nokillanswer.wav", 5500);
				}

				var accelerate_messages = false;
				var nextLoc = session.get("currentLocation") + 1;
				if( nextLoc < locOrder.length )
					accelerate_messages = locations[locOrder[nextLoc]].get("time_closed") < getCurrentDateTimeString(timeFormat.TWENTYFOUR);
				
				MessageController.enqueue(this.get("name")); 

				// remove timer
				clearInterval(stats[this.get("name")]["timerID"]);
				
				// set all hints to revealed 
				$.each(stats[this.get("name")]["hintStats"], function(hname, hint) {
					hint["status"] = hintStatus.REVEALED;
				});


				if (!miniSolve) stats = this.advanceLocation(stats);

				// update the stats
				session.set("puzzleStats",stats);
			
				// if this is a meta, solve all the active subpuzzles
				if (!miniSolve && this.get("meta")) {
					var active = session.getActivePuzzles();
					$.each(active, function(index, pname) {
						if (!puzzles[pname].get("meta")) {
							puzzles[pname].checkAnswer(entry, true);
							// TODO: test the line below -- I'm not sure it's right
							puzzles[pname].checkAnswer(encryptedEntry, true);
						}
					});
				}

				// increment the meta counter so it knows to refresh the activity view
				if (!miniSolve) session.set("renderMeta", session.get("renderMeta")+1);

				// skin change after clock puzzle solved
				if (!miniSolve && this.get("name") === "The Clock") { // activate new skin
					session.set("rebellionTheme", true);
					$("head").append('<link rel="stylesheet" type="text/css" href="css/r.css">');
				}
				else if (!miniSolve && this.get("name") === "Tracker Jackers") {
					$("head").append('<link rel="stylesheet" type="text/css" href="css/tj.css">')
				}

				// If server saving is not verbose, we need to at least save to the server when the answer is given
				if( !debugActive("verbose_server"))
					try { saveServerSession(session, tid); } catch (err) {}

				if (!miniSolve) {
					toastr.clear();
					this.returnToParentView();
				}
			}
			else if (partial) { // answer is correct partial answer
				var timediff = 1;
				if ( debugActive() )
					timediff *= parameters["debug_parameters"]["time_multiplyer"];
				var elapsed = Math.floor(timediff*(getCurrentDateTime() - stats[this.get("name")]["start_time"])/60000);
				// reveal skipped hints
				var puzzle = this;
				if (puzzle.get("answers")[entry])
					hints_to_skip = puzzle.get("answers")[entry]["skipped_hints"];
				else
					hints_to_skip = puzzle.get("answers")[encryptedEntry]["skipped_hints"];
				var time_to_advance = elapsed;

				$.each(hints_to_skip, function(index, hint_name)  {
					if (hint_name in puzzle.get("hints")) {
						if (stats[puzzle.get("name")]["hintStats"][hint_name]["status"] != hintStatus.REVEALED) {
							stats[puzzle.get("name")]["hintStats"][hint_name]["status"] = hintStatus.SKIPPED;
							var time_remaining = stats[puzzle.get("name")]["hintStats"][hint_name]["end_time"];
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
				$.each(puzzle.get("hints"), function(hname, hint) {
					if (stats[puzzle.get("name")]["hintStats"][hname]["status"] === hintStatus.LOCKED) {
						stats[puzzle.get("name")]["hintStats"][hname]["start_time"] -= (time_to_advance - elapsed);
						stats[puzzle.get("name")]["hintStats"][hname]["end_time"] -= (time_to_advance - elapsed);
					}
				});

				// update the stats
				session.set("puzzleStats",stats);
			}

			if (!miniSolve) {
				if (this.get("answers")[encryptedEntry]) // TODO: test this also -- wasn't sure when it gets called
					response += "<strong>" + entry + "</strong> - " + this.get("answers")[encryptedEntry]["response"] + "</div>";
				else
					response += "<strong>" + entry + "</strong> - " + this.get("answers")[entry]["response"] + "</div>";
			}
			else if (give_up) response += "Thresh helped you with this puzzle.</div>"
			else response += "You have solved the puzzle!</div>";
		}
		else if (this.get("meta") && entry != give_up_code) { // if this is a meta, check if it's in the answers for an active mini
			var minis = session.getActivePuzzles();
			var that = this;
			var found = false;
			$.each(minis, function(index, name) {
				if ((entry in puzzles[name].get("answers") || encryptedEntry in puzzles[name].get("answers")) && that.get("name") != name) {
					response += "Enter <strong>" + entry + "</strong> into the answer box for the mini: " + name + ".</div>";
					found = true;
					return false;
				}
			});
			if (!found) response += "<strong>" + entry + "</strong> is not the answer.</div>";
		}
		else {
			response += "<strong>" + entry + "</strong> is not the answer.</div>"
		}
		this.log(response);

		saveSession();
	},

	returnToParentView : function() {
		// go back to main or meta and change buttons if main
		if (this.get("meta") || session.getActivePuzzles().length === 0) {
			$('.main.active').removeClass('active');
			$('#main_screen').addClass('active');
			$('#start_code_box').show();
			$("#start_input").focus();
			$('#active_puzzle_button').hide();
		}
		else {
			var meta = getMetaName(this.get("start_code"));
			$('.main.active').removeClass('active');
			if (meta === "All Puzzles") $("#multipuzzle").addClass('active');
			else $('.main#'+nameToId(meta)).addClass('active');
		}
	},

	advanceLocation : function(stats) {
		// advance location if this is a location advancer puzzle
		// also advance location if this is the last active puzzle in a non-meta chain
		if (this.get("advance_location") || (session.getActivePuzzles().length === 1 && puzzlesWithStartCode(this.get("start_code")) > 1)) {
			var currentLoc = session.get("currentLocation") + 1;

			var showSkipTitle = true;
			while (locations[locOrder[currentLoc]].get("time_closed") < getCurrentDateTimeString(timeFormat.TWENTYFOUR)) {
				// We need to skip over the puzzles appropriately as well, e.g. play cannon sounds for killed teams, show videos, etc.
				stats = this.skipLocation(currentLoc, stats, showSkipTitle);
				currentLoc++;
				showSkipTitle = false;
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
		 	var location_text = locations[locOrder[currentLoc]].get("flavor_text")

		 	if( debugActive("show_solutions") ) {
		 		loc_desc = loc_desc + "<br>"
				$.each( locations[locOrder[currentLoc]].get("puzzles"), function(index, puzzle) {
					var start_code = puzzles[puzzle].get("start_code")
					loc_desc = loc_desc + "<br>Start Code:\t" + start_code
				});
			}
		 	
		 	$("#main #main_screen .left-sidebar .content .location_description").html( loc_desc );

			// if they are too early for the current location, display an alert
			var time_open = new Date(locations[locOrder[currentLoc]].get("time_open"));

			if (!debugActive() && getCurrentDateTimeString(timeFormat.TWENTYFOUR) < locations[locOrder[currentLoc]].get("time_open")) {
				showPopup('<div class="too_fast">Please call the Gamemakers at (XXX) XXX-XXXX before proceeding to the next location.</div>')
			}
		}

		return stats;
	},

	skipLocation : function(loc_index, stats, displayTitle) {
		if (displayTitle && !session.get("rebellionTheme")) showPopup("While you were occupied, the following also happened in the arena: ");
	 	$.each( locations[locOrder[loc_index]].get("puzzles"), function(index, puzzle_name) {
	 		if ( !(puzzle_name in puzzles) ) 
	 			console.log("Tried to access a puzzle that doesn't exist: " + puzzle)
	 		else {
	 			var puzzle = puzzles[puzzle_name]
				// update status object
				stats[puzzle.get("name")]["status"] = puzzleStatus.SOLVED;

				// hide answer box
				$("#"+nameToId(puzzle.get("name")) + " .answer_box").hide();
				
				// Adds a log entry regarding the skipped puzzle.
				//logAction(logTypes.PUZZLE, "You were skipped over <span id=\"" + puzzle.get("name") + "\" class=\"puzzle_link clickable\">" + puzzle.get("name") + "</span><table class=\"history-table\"></table>");

				// puzzle results
				puzzle.killTeams(deathVolume.QUIET);
				puzzle.unlockResources();
				MessageController.enqueue(puzzle.get("name")); 

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
		var showpopup = true;
		$.each(this.get("teams_killed"), function(index, id) {
			if (tid === id) {
				// this is current team! don't do anything! :)
			}
			else {
				teams[id].die(deathVolume);		
				if (showpopup) showPopup("<div id=\"" + id + "\" class=\"video-alert popup_vid_link\"><img src=\"../images/gui/video_icon.png\"><p>Click to view video coverage of this gruesome death!</p></div>");

				deathVolume = true;	
				showpopup = false;
			}
		});
	},

	unlockResources : function() {
		var unlock = false;
		$.each(this.get("resources_unlocked"), function(index, name) {
			resources[name].unlock();
			logAction(logTypes.RESOURCE, "You acquired " + name + "!");
			unlock = true;
		});
	},


	// perhaps move this to Session.js
	log : function(entry) {
		var stats = $.extend(true, {}, session.get("puzzleStats"));
		stats[this.get("name")]["log"].push(entry);
		session.set("puzzleStats",stats);	
	}
});
