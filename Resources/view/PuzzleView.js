function showPuzzleScreen(puzzle) {
	$("#main").empty();
	$("#main").append(puzzle.getPuzzleHTML());


	$("#main").append("<div id=\"hints\"></div>");
	
	$.each(session.puzzleStats[puzzle.name].hintStats, function(name, status) {
		$("#hints").append("<div>"+name+"</div><div id=\"" + name + "\" class=\"hint_counter\"></div>");
		$('.hint_counter#'+name).countdown({
    		stepTime: 60,
   			format: 'mm:ss',
    		startTime: puzzle.hints[name].start_time+":00",
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