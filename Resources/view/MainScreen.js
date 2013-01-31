function showStartScreen() {
	$("#main").empty();

	// List active puzzles
	$("#main").append("<b>Active Puzzles</b><ul id=\"active_puzzles\"></ul>");
	listActivePuzzles();

	// Start code box
	$("#main").append("Enter a start code: <input type=\"text\" id=\"start_input\">" +
  		"<button id=\"start_button\">Submit</button><div id=\"return_message\"></div>");

	$("#start_button").click(function() {
		var entry = clean($("#start_input").val());

		// activate puzzles in session
		var result = session.activatePuzzles(entry);

		if (result > 0) {
			// show in list!
			listActivePuzzles();
			$("#return_message").html("<font color=green>Success!</font>");
		}
		else {
			$("#return_message").html("<font color=red>sorry! " + entry + " is not a valid code.</font>");
		}
	});
	
	currentScreen = screenTypes.MAIN;
}

function listActivePuzzles() {
	$("#active_puzzles").empty();

	var active = session.getActivePuzzles();
	if (active.length === 0) {
		$("#active_puzzles").append("none!");
	}
	else {
		$.each(active, function(index, name) {
			$("#active_puzzles").append(puzzles[name].getHTMLLink());
		})
	}
	
	$(".puzzle_link").click(function() {
		var name = this.id;
		showPuzzleScreen(puzzles[name]);
	});
}