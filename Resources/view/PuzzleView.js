function showPuzzleScreen(puzzle) {
	$("#main").empty();
	$("#main").append(puzzle.getPuzzleHTML());


	$("#main").append("<div id=\"hints\"></div>");
	
	$.each(puzzle.hints, function(name, hint) {
		$("#hints").append("<div>"+name+"</div><div id=\"" + nameToId(name) + "\" class=\"hint_counter\"></div>");
		$('.hint_counter#'+nameToId(name)).countdown({
    		stepTime: 60,
   			format: 'mm:ss',
    		startTime: hint["start_time"]-session.puzzleStats[puzzle.name]["min_elapsed"]+":00",
    		digitImages: 6,
    		digitWidth: 53,
    		digitHeight: 77,
    		timerEnd: function() { alert('end!!'); },
    		image: "images/gui/digits.png"
  		});
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
}