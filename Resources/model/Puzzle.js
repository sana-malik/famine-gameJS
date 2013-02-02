function Puzzle(puzzleObj) {
	this.name = puzzleObj.name;
	this.start_code = puzzleObj.start_code;

	this.max_fans = puzzleObj.max_fans;
	this.flavor_text = puzzleObj.flavor_text;

	var hints = {};
	$.each(puzzleObj.hints, function(index, hintObj) {
		hints[hintObj.name] = new Hint(hintObj);
	});

	this.hints = hints;

	var answers = {};
	$.each(puzzleObj.answers, function(index, answerObj) {
		answers[answerObj.text] = new Answer(answerObj);
	});

	this.answers = answers;

	this.resources_unlocked = puzzleObj.resources_unlocked;
	this.teams_killed = puzzleObj.teams_killed;
}


Puzzle.prototype.checkAnswer = function(entry) {
	if (entry in this.answers) {
		if (this.answers[entry]["type"] == answerTypes.FINAL) {
			this.killTeams();
			this.unlockResources();
		}
		return this.answers[entry].response;
	}
	else {
		return "Sorry, " + entry + " is not the answer."
	}
}


Puzzle.prototype.getPuzzleHTML = function() {
	return "<span class=\"puzzle_title\">" + this.name + "</span><span class=\"flavor_text\">" + this.flavor_text + "</li>";
}

Puzzle.prototype.getHTMLLink = function() {
	return "<li class=\"puzzle_link\" id=\""+this.name+"\">" + this.name + "</li>";
}

Puzzle.prototype.killTeams = function() {
	$.each(this.teams_killed, function(index, id) {
		if (tid === id) {
			// this is current team! don't do anything! :)
		}
		else {
			teams[id].die();
		}
	});
}

Puzzle.prototype.unlockResources = function() {
	// todo	
}

Puzzle.prototype.activate = function() {
	var timerID = PuzzleTimer(this["name"]);

	var puzzObj = {
		"name" : this["name"], 
		"current_worth" : this["max_fans"],
		"status" : puzzleStatus.ACTIVE,
		"min_elapsed" : 0, 
		"timer_id" : timerID,
		"hintStats" : {},
		"log" : ["ABSOLUTE TIME RIGHT NOW: Started puzzle"]
		// add absolute start time
	};
	
	/*
	$.each(this["hints"], function(name, hint) {
		puzzObj.hintStats[name] = {
			"status" : hintStatus.LOCKED
		}
	});*/

	session.puzzleStats[this["name"]] = puzzObj;
}