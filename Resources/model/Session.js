function Session(sessionObj) {
	this.fans = sessionObj.fans;
	this.locationStats = sessionObj.locationStats;
	this.puzzleStats = sessionObj.puzzleStats;
	this.teamStats = sessionObj.teamStats;
	this.resourceStats = sessionObj.resourceStats;
}

function Session() {
	this.fans = 0;	

	this.locationStats = {};
	this.locationStats[locOrder[0]] = locationStatus.VISITED;
	
	this.puzzleStats = {};
	this.teamStats = {};
	this.resourceStats = {};
}


Session.prototype.getActivePuzzles = function() {
	var active = [];
	$.each(this.puzzleStats, function(name, pStat) {
		if (pStat["status"] === puzzleStatus.ACTIVE) {
			active.push(name);
		}
	});
	return active;
}


// Activates all the puzzles associated with a start code.
// This creates the "puzzleStatus" object for each puzzle.
// Input: start_code - the start code.
// Returns: number of puzzles activated (0 if none)
Session.prototype.activatePuzzles = function(start_code) {
	var that = this;
	var count = 0;
	$.each(puzzles, function(name, puzzle) {
		if (!(name in that.puzzleStats) && puzzle["start_code"] === start_code) {
			var obj = {
				"name" : name, 
				"current_worth" : puzzle["max_fans"],
				"status" : puzzleStatus.ACTIVE,
				"time_crap" : "RIGHT NOW", // TO DO
				"hintStats" : {},
				"log" : ["RIGHT NOW: Started puzzle"]
			};

			that.puzzleStats[name] = obj;
			count += 1;
		}
	});
	return count;
}