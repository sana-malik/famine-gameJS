/* Session variables */
var teams = {};
var puzzles = {};

/**
 * Executes once the DOM is fully loaded. Essentially a "main" method
 */
$(document).ready(function() {
	$("#close_popup").click(hidePopup);

	populateTeams();
	populatePuzzles();
	showStartScreen();
});


function showStartScreen() {
	$("#main").empty();
	$("#main").append("Enter a start code: <input type=\"text\" id=\"start_input\">" +
  		"<button id=\"start_button\">Submit</button>");

	$("#start_button").click(function() {
		var entry = clean($("#start_input").val());
		if (entry in puzzles) {
			puzzles[entry].showPuzzle();
		}
		else {
			$("#main #wrong_message").remove();
			$("#main").append("<div id=\"wrong_message\">sorry! " + entry + " is not a valid code.</div>");
		}
	});
}

function populateTeams() {
	var json = jsonToString('Resources/data/teams.json');

	var teamObjs = Ti.JSON.parse(json);
	$.each(teamObjs, function(index, team) {
		teams[team.id] = new Team(team);
	});
	$.each(teams, function(id, team) {
		$("#bottombar").append(team.getIconHTML());
	});
	$("#bottombar .team_div").click(function() {
		var team = teams[$(this).attr("id")];
		showPopup(team.getHTMLSummary());
	});
}

function populatePuzzles() {
	var json = jsonToString('Resources/data/puzzles.json');

	var puzObjs = Ti.JSON.parse(json);
	$.each(puzObjs, function(index, puzzle) {
		puzzles[puzzle.start_code] = new Puzzle(puzzle);
	});
}