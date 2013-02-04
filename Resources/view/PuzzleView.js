function showPuzzleScreen(puzzle) {
	var date = new Date();
	
	$("#main").empty();
	$("#main").append(puzzle.getPuzzleHTML());


	$("#main").append("<div class=\"hints\" id=\""+ nameToId(puzzle.name)+"\"></div>");
	
	$.each(puzzle.hints, function(name, hint) {
		$(".hints#" + nameToId(puzzle.name)).append("<div class=\"hint\" id=\"" + nameToId(name) + "\"><span class=\"hint_name\">"+ name + ":</span> <span class=\"hint_text\"></span></div>");
		if (!(hint.name in session.puzzleStats[puzzle.name].hintStats)) {  // Does this do anything?
		}
	});

	// Answer section
	$("#main").append("Enter an answer: <input type=\"text\" id=\"answer_input\">" + 
			"<button id=\"answer_button\">Submit</button><button id=\"giveup_button\">I give up!</button>");
	$("#main").append("<div id=\"result\"></div>");

	$("#answer_button").click(function () {
		var entry = clean($("#answer_input").val());
		$("#result").remove();
		$("#main").append("<div id=\"result\">" + puzzle.checkAnswer(entry) + "</div>");
	});

	$("#main").append("<div id=\"log\"></div>");
	
	
	currentScreen = screenTypes.PUZZLE;

	// this is laziness for now, will implement something more permanent soon
	$("#main").append("<span id=\"back_to_main\">back to main</span>");
	$("#back_to_main").click(showStartScreen);
}