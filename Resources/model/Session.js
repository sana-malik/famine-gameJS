var Session = Backbone.Model.extend({
	initialize: function() {
		var temp = {};

		this.set("fans",0);

		// locations
		$.each(locations, function(name, location) {
			temp[name] = {"status" : locationStatus.UNVISITED};
		});
		this.set("locationStats", temp);

		// resources
		temp = {};
		$.each(resources, function(name, resource) {
			temp[name] = {"status" : resourceStatus.LOCKED};
		});
		this.set("resourceStats", temp);

		// teams
		temp = {};
		$.each(teams, function(id, team) {
			temp[id] = {"status" : teamStatus.ALIVE};
		});
		this.set("teamStats", temp);

		// puzzles
		temp = {};
		$.each(puzzles, function(pname, puzzle) {
			temp[pname] = {
				"current_worth" : this.get("max_fans"),
				"status" : puzzleStatus.INACTIVE,
				"hintStats" : {},
				"log" : []
			};

			$.each(puzzle.get("hints"), function(hname, hint) {
				temp[pname]["hintStats"][hname] = {"status" : hintStatus.LOCKED, "remaining" : hint.get("start_time")*60};
			});
		});
		this.set("puzzleStats", temp);
	},

	getActivePuzzles : function() {
		var active = [];
		$.each(this.get("puzzleStats"), function(name, pStat) {
			if (pStat["status"] === puzzleStatus.ACTIVE) {
				active.push(name);
			}
		});
		return active;
	},

	// Activates all the puzzles associated with a start code.
	// This creates the "puzzleStatus" object for each puzzle.
	// Input: start_code - the start code.
	// Returns: number of puzzles activated (0 if none)
	activatePuzzles : function(start_code) {
		var count = 0;
		var that = this;
		
		var puzStats = $.extend(true, {}, this.get("puzzleStats"));
		$.each(puzzles, function(name, puzzle) {
			if (puzStats[name]["status"] == puzzleStatus.INACTIVE && puzzle.get("start_code") === start_code) {
				var timerID = PuzzleTimer(name);

				var date = (new Date()).getTime();
				var startTime = Math.round((new Date()).getTime() / 1000);
		
				var puzzObj = {
					"status" : puzzleStatus.ACTIVE,
					"sec_elapsed" : 0, // not used 
					"timerID" : timerID, // need to keep this so we can destroy it when the puzzle is completed
					"start_time" : startTime,
					"log" : ["<div class='log_time'>" + getCurrentDateTime() + ":</div><div class='log_content'>Puzzle Started</div>"]
				};
				$.extend(true, puzStats[name], puzzObj);
				count += 1;
				$("#main").append("<div class=\"main puzzle\" id=\""+nameToId(name) + "\"></div>");
				var puzView = new PuzzleView({el : ".puzzle#"+nameToId(name), puzzleName : name});
			}
		});
		if (count > 0) {
			that.set("puzzleStats", puzStats);
		}
		return count;
	}
});