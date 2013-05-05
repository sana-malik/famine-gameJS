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
					session.set("currentLocation", session.get("currentLocation")+1);
				}

				// update the stats
				session.set("puzzleStats",stats);

				// go back to main
				$('.main.active').removeClass('active');
				$('#main_screen').addClass('active');
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