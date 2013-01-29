var session;
var puzzles;
var teams;
var locations;
var locOrder;
var resources;

var tid;

/**
 * Executes once the DOM is fully loaded. Essentially a "main" method
 */
$(document).ready(function() {
	$("#close_popup").click(hidePopup);

	// Set up model
	puzzles = populatePuzzles();
	teams = populateTeams();
	locations = populateLocations(); 
	resources = populateResources();

	session = initSession();
	
	// Set up view
	displayTeams();
	showStartScreen();
});


function populateTeams() {
	var json = jsonToString(data_dir + 'teams.json');

	var teams = {};
	var teamObjs = Ti.JSON.parse(json);
	
	tid = teamObjs.activeTeam;
	
	$.each(teamObjs.teams, function(index, team) {
		teams[team.id] = new Team(team);
	});

	return teams;
}

function populatePuzzles() {
	var json = jsonToString(data_dir + 'puzzles.json');

	var puzzles = {};
	var puzObjs = Ti.JSON.parse(json);
	$.each(puzObjs, function(index, puzzle) {
		puzzles[puzzle.name] = new Puzzle(puzzle);
	});

	return puzzles;
}

function populateResources() {
	var json = jsonToString(data_dir + 'resources.json');

	var resources = {};
	var resObjs = Ti.JSON.parse(json);
	$.each(resObjs, function(index, resource) {
		resources[resource.name] = new Resource(resource);
	});

	return resources;
}

function populateLocations() {
	var json = jsonToString(data_dir + 'locations.json')
	

	var locations = [];
	
	var locObjs = Ti.JSON.parse(json);
	
	// Order of locations needs to be extracted first
	locOrder = locObjs.order;

	$.each(locObjs.locations, function(index, location) {
		locations[location.name] = new Location(location);
	});
}

function loadSession() {
	var json = jsonToString(data_dir + 'locations.json')
	var sessionObj = Ti.JSON.parse(json);
	
	return new Session(sessionObj);
}

function initSession() {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),"session.json");
	if (file.exists()) {
		return loadSession();
	}
	else {
		return new Session();
	}	
}