function Session() {
	this.teams = populateTeams();
	this.puzzles = populatePuzzles();

	populateSessionData();
}


function populateTeams() {
	var json = jsonToString(data_dir + 'teams.json');

	var teams = {};
	var teamObjs = Ti.JSON.parse(json);
	$.each(teamObjs, function(index, team) {
		teams[team.id] = new Team(team);
	});

	return teams;
}

function populatePuzzles() {
	var json = jsonToString(data_dir + 'puzzles.json');

	var puzzles = {};
	var puzObjs = Ti.JSON.parse(json);
	$.each(puzObjs, function(index, puzzle) {
		puzzles[puzzle.start_code] = new Puzzle(puzzle);
	});

	return puzzles;
}

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