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
		var response = "<div class='log_time'>" + getCurrentDateTime() + ": </div><div class='log_content'>";
		if (stats[this.get("name")]["status"] === puzzleStatus.SOLVED) { // puzzle already solved!
			return;
		}
		else if (entry in this.get("answers")) {
			if (this.get("answers")[entry]["type"] === answerTypes.FINAL) { // answer is correct final answer
				// update status object
				stats[this.get("name")]["status"] = puzzleStatus.SOLVED;
				
				// hide answer box
				$("#"+nameToId(this.get("name")) + " .answer_box").hide();
				// puzzle results
				this.killTeams();
				//this.unlockResources();

				// remove timer
				clearInterval(stats[this.get("name")]["timerID"]);
				
				// set all hints to revealed
				$.each(stats[this.get("name")]["hintStats"], function(hname, hint) {
					hint["status"] = hintStatus.REVEALED;
				});

				// allot fans
				session.set("fans", session.get("fans") + stats[this.get("name")]["current_worth"]);

				// advance location
				if (this.get("advance_location")) {
					var currentLoc = session.get("currentLocation") + 1;
					var now = new Date();
					var nowStr = now.getMonth()+1 + "/" + now.getDate() + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes();
					while (locations[locOrder[currentLoc]].get("time_closed") < nowStr) {
						currentLoc++;
					}
					session.set("currentLocation", currentLoc);

					// if they are too early for the current location, display an alert
					if (nowStr < locations[locOrder[currentLoc]].get("time_open")) {
						alert("oops! you're so fast. go reward yourself with a burger until " + locations[locOrder[currentLoc]].get("time_open"))
					}
				}

				// go back to main or meta and change buttons if main
				if (this.get("meta") || session.getActivePuzzles().length === 0) {
					$('.main.active').removeClass('active');
					$('#main_screen').addClass('active');
					$('#start_code_box').show();
					$('#active_puzzle_button').hide();

					// change unfinished puzzles to ARCHIVED?? -- solvable but not active
					$.each(session.getActivePuzzles(), function(index, pname) {
						stats[pname]["status"] = puzzleStatus.ARCHIVED;
					});
				}
				else {
					// show the meta
				}


				// update the stats
				session.set("puzzleStats",stats);
			}
			else if (this.get("answers")[entry]["type"] === answerTypes.PARTIAL) { // answer is correct final answer
				// reveal skipped hints
				puzzle = this;
				hints_to_skip = puzzle.get("answers")[entry]["skipped_hints"];
				var time_to_advance = 0;

				$.each(hints_to_skip, function(index, hint_name)  {
					if ( stats[puzzle.get("name")]["hintStats"][hint_name]["status"] != hintStatus.REVEALED ) {
						stats[puzzle.get("name")]["hintStats"][hint_name]["status"] = hintStatus.SKIPPED;
						var time_remaining = stats[puzzle.get("name")]["hintStats"][hint_name]["remaining"];
						if (time_remaining > time_to_advance) {
							time_to_advance = time_remaining;
						}
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
			response += entry + " is not the answer.</div>"
		}
		this.log(response);
	},

	killTeams : function() {
		$.each(this.get("teams_killed"), function(index, id) {
			if (tid === id) {
				// this is current team! don't do anything! :)
			}
			else {
				teams[id].die();
			}
		});
	},

	unlockResources : function() {
		// todo	
	},


	// perhaps move this to Session.js
	log : function(entry) {
		var stats = $.extend(true, {}, session.get("puzzleStats"));
		stats[this.get("name")]["log"].push(entry);
		session.set("puzzleStats",stats);	
	}
});