var session;

/**
 * Executes once the DOM is fully loaded. Essentially a "main" method
 */
$(document).ready(function() {
	$("#close_popup").click(hidePopup);

	// Set up model
	session = new Session();

	// Set up view
	displayTeams();
	showStartScreen();
});