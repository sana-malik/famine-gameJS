function displayInfo() {
	$("#sidebar").empty();
	$("#sidebar").append( teams[tid].getActiveTeamHTML() );
}