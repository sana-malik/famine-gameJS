function showStartScreen() {
	$("#main").empty();

	// List active puzzles
	var puzzles = session.getActivePuzzles();
	$("#main").append("<div id=\"active_puzzles\">Active Puzzles: </div>");


	// Start code box
	$("#main").append("Enter a start code: <input type=\"text\" id=\"start_input\">" +
  		"<button id=\"start_button\">Submit</button>");

	$("#start_button").click(function() {
		var entry = clean($("#start_input").val());
		if (entry in session.puzzles) {
			session.addToActivePuzzles(session.puzzles[entry]);
		}
		else {
			$("#main #wrong_message").remove();
			$("#main").append("<div id=\"wrong_message\">sorry! " + entry + " is not a valid code.</div>");
		}
	});
}

function refreshActivePuzzles() {
	$("#active_puzzles").empty();
	$("#active_puzzles").append("Active Puzzles: ");

	$.each(session.getActivePuzzles(), function(id, puzzle) {
		$("#active_puzzles").append(puzzle.name);
	})
}