function displayTeams() {
	$.each(teams, function(id, team) {
		$("#bottombar").append(team.getIconHTML());
	});

	// bind click listener
	$("#bottombar .team_div").click(function() {
		var team = teams[$(this).attr("id")];
		showPopup(team.getHTMLSummary());
	});

	// greyout dead teams
	$.each(session.teamStats, function(id,tStat) {
		if (tStat["status"] == teamStatus.DEAD) {
			$("#" + id + "  > .status").show();
		}
	})
}