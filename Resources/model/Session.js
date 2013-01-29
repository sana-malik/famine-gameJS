<<<<<<< HEAD
function Session() {
	this.teams = populateTeams();
	this.puzzles = populatePuzzles();

	populateSessionData();
=======
function Session(sessionObj) {
	this.fans = sessionObj.fans;
	this.locationStats = sessionObj.locationStats;
	this.puzzleStats = sessionObj.puzzleStats;
	this.teamStats = sessionObj.teamStats;
	this.resourceStats = sessionObj.resourceStats;
>>>>>>> 926582c17ad81b727a9396cdbfb01373102d001f
}

function Session() {
	this.fans = 0;	
	this.locationStats = {locOrder[0] : locationStatus.VISITED};
	this.puzzleStats = {};
	this.teamStats = {};
	this.resourceStats = {};
}

<<<<<<< HEAD
function populateSessionData() {
	var json = jsonToString(data_dir + 'session.json');
	var obj = Ti.JSON.parse(json);
	this.user = obj.user;
	this.fans = obj.fans;;
}

Session.prototype.getActivePuzzles = function() {
	var active = [];
	$.each(this.puzzles, function(id, puzzle) {
		if (puzzle.status == puzzleStatus.active) {
			active.push(puzzle);
		}
	});

	return active;
}

Session.prototype.addToActivePuzzles = function(puzzle) {
	puzzle.status = puzzleStatus.active;

	refreshActivePuzzles();
}
=======

>>>>>>> 926582c17ad81b727a9396cdbfb01373102d001f
