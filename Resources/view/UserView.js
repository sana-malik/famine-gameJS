function showUserView() {
	$("#sidebar").empty();
	$("#sidebar").append( session.getActiveTeamHTML() );
}