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
		var response = getCurrentDateTime() + ": ";
		if (stats[this.get("name")]["status"] === puzzleStatus.SOLVED) { // puzzle already solved!
			return;
		}
		else if (entry in this.get("answers")) {
			if (this.get("answers")[entry]["type"] === answerTypes.FINAL) { // answer is correct final answer
				// update status object
				stats[this.get("name")]["status"] = puzzleStatus.SOLVED;
				
				// puzzle results
				this.killTeams();
				//this.unlockResources();

				// remove timer

				// what to do about unopened hints?	
				
				// allot fans
				session.set("fans", session.get("fans") + stats[this.get("name")]["current_worth"]);

				session.set("puzzleStats",stats);
			}
			response += entry + " - " + this.get("answers")[entry]["response"];
		}
		else {
			response += entry + " is not the answer."
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