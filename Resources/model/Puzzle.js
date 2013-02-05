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
	var response, that = this;
	if (entry in this.answers) {
		if (this.answers[entry]["type"] == answerTypes.FINAL) {
			// update status object + visually
			session.puzzleStats[that["name"]]["status"] = puzzleStatus.SOLVED;
			$("#answer_box").remove();

			// puzzle results
			that.killTeams();
			that.unlockResources();


			// allot fans
			session.fans += session.puzzleStats[that["name"]]["current_worth"];
			showUserView();
		}
		response = entry + " - " + that.answers[entry]["response"];
	}
	else {
		response = entry + " is not the answer."
	}
	that.log(response);
}


Puzzle.prototype.getPuzzleHTML = function() {
	return "<span class=\"puzzle_title\">" + this.name + "</span>" + 
		"<span class=\"flavor_text\">" + this.flavor_text + "</span>" +
		"Fans watching: <span id=\"fan_worth\">" + session.puzzleStats[this.name]["current_worth"] + "</span>";
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
	// start timer
	var timerID = PuzzleTimer(this["name"]);

	var date = (new Date()).getTime();
	var startTime = Math.round((new Date()).getTime() / 1000);
	
	var puzzObj = {
		"name" : this["name"], 
		"current_worth" : this["max_fans"],
		"status" : puzzleStatus.ACTIVE,
		"sec_elapsed" : 0, // not used 
		"timerID" : timerID, // need to keep this so we can destroy it when the puzzle is completed
		"start_time" : startTime,
		"hintStats" : {},
		"log" : [getCurrentDateTime() + ":  Puzzle Started"]
	};
	
	/*
	$.each(this["hints"], function(name, hint) {
		puzzObj.hintStats[name] = {
			"status" : hintStatus.LOCKED
		}
	});*/

	session.puzzleStats[this["name"]] = puzzObj;
}


/*** LOG THINGS ***/
Puzzle.prototype.log = function(entry) {
	session.puzzleStats[this.name]["log"].push(entry);
	$("#log").append(getCurrentDateTime() + ": " + entry);

}

Puzzle.prototype.getLogHTML = function() {
	var log = session.puzzleStats[this.name]["log"];
	var out = "";
	$.each(log, function(index, entry) {
		out += "<span class=\"log_entry\">" + entry + "</span>";
	});

	return out;
}