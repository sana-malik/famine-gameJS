function displayTeams() {
	$.each(session.teams, function(id, team) {
		$("#bottombar").append(team.getIconHTML());
	});

	// bind click listener
	$("#bottombar .team_div").click(function() {
		var team = session.teams[$(this).attr("id")];
		showPopup(team.getHTMLSummary());
	});
}