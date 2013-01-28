function Puzzle(puzzleObj) {
	this.name = puzzleObj.name;
	this.start_code = puzzleObj.start_code;

	this.max_fans = puzzleObj.max_fans,
	this.current_fans = puzzleObj.current_fans,

	this.status = puzzleObj.status;
	
	this.flavor_text = puzzleObj.flavor_text;

	var hints = [];
	$.each(puzzleObj.hints, function(index, hintObj) {
		hints.push(new Hint(hintObj));
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
		return this.answers[entry].response;
	}
	else {
		return "Sorry, " + entry + " is not the answer."
	}
}


Puzzle.prototype.showPuzzle = function() {
	var puz = this;
	$("#main").empty();
	$("#main").append("<span id=\"puzzle_title\">" + this.name + "</span>");
	$("#main").append("<span id=\"flavor_text\">" + this.flavor_text + "</span>");
	$("#main").append("Enter an answer: <input type=\"text\" id=\"answer_input\">" + 
			"<button id=\"answer_button\">Submit</button><button id=\"giveup_button\">I give up!</button>");
	$("#main").append("<div id=\"result\"></div>");

	$("#answer_button").click(function () {
		var entry = clean($("#answer_input").val());
		$("#result").remove();
		$("#main").append("<div id=\"result\">" + puz.checkAnswer(entry) + "</div>");
	});
}