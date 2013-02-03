function showPuzzleScreen(puzzle) {
	var date = new Date();
	
	$("#main").empty();
	$("#main").append(puzzle.getPuzzleHTML());


	$("#main").append("<div id=\"hints\"></div>");
	
	$.each(puzzle.hints, function(name, hint) {
		$("#hints").append("<table border=\"0\"><tr><td><div>"+name+": </div></td><td><div id=\"" + nameToId(name) + "\" class=\"hint_counter\"></div></td></tr></table>");
		if (!(hint.name in session.puzzleStats[puzzle.name].hintStats)) {
			var current_time = Math.round(date.getTime()/1000);
			var seconds_passed = (current_time-session.puzzleStats[puzzle.name]["start_time"]) * 1000/timeInterval;
			$(".hint_counter#"+nameToId(name)).countdown(hint.start_time*60-seconds_passed, function() {alert("display end!!!")});
		}
	});

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

	// this is laziness for now, will implement something more permanent soon
	$("#main").append("<span id=\"back_to_main\">back to main</span>");
	$("#back_to_main").click(showStartScreen);
}