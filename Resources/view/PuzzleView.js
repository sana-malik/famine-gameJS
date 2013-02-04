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
	if (session.puzzleStats[puzzle["name"]]["status"] === puzzleStatus.ACTIVE) {
		$("#main").append("<div id=\"answer_box\">Enter an answer: <input type=\"text\" id=\"answer_input\">" + 
				"<button id=\"answer_button\">Submit</button><button id=\"giveup_button\">I give up!</button></div>");
		$("#answer_button").click(function () {
			var entry = clean($("#answer_input").val());
			puzzle.checkAnswer(entry);
		});
	}

	$("#main").append("<div id=\"log\">"+puzzle.getLogHTML()+"</div>");
	
	
	currentScreen = screenTypes.PUZZLE;

	// this is laziness for now, will implement something more permanent soon
	$("#main").append("<span id=\"back_to_main\">back to main</span>");
	$("#back_to_main").click(showStartScreen);
}