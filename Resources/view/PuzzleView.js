function showPuzzleScreen(puzzle) {
	$("#main").empty();
	$("#main").append(puzzle.getPuzzleHTML());

	// Input button
	$("#main").append("Enter an answer: <input type=\"text\" id=\"answer_input\">" + 
			"<button id=\"answer_button\">Submit</button><button id=\"giveup_button\">I give up!</button>");
	$("#main").append("<div id=\"result\"></div>");

	$("#answer_button").click(function () {
		var entry = clean($("#answer_input").val());
		$("#result").remove();
		$("#main").append("<div id=\"result\">" + puzzle.checkAnswer(entry) + "</div>");
	});
	
	
	currentScreen = screenTypes.PUZZLE;
}