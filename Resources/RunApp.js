	var session;
var puzzles;
var teams;
var locations;
var locOrder;
var resources;
var tid;
var currentScreen;

/**
 * Executes once the DOM is fully loaded. Essentially a "main" method
 */
$(document).ready(function() {
	//Create the menu object
    var menu = Ti.UI.createMenu();

    //Create menu items
    var debug = menu.addItem('Debug');
    debug.addItem('Save session', Debug.saveSession);
    debug.addItem('Clear session', Debug.clearSession);
    debug.addItem('Toggle Quick Timer', Debug.toggleDebugTiming)

    //Add menu to the current window
    Ti.UI.getCurrentWindow().setMenu(menu);

	// Set up model
	teams = populateTeams();
	locations = populateLocations(); 
	resources = populateResources();
	puzzles = populatePuzzles();

	session = initSession();
	
	// Set up view
	showTeamView();
	showUserView();
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
	var locObjs = Ti.JSON.parse(json);
	
	// Order of locations needs to be extracted first
	locOrder = locObjs.order;
	
	var locations = [];
	$.each(locObjs.locations, function(index, location) {
		locations[location.name] = new Location(location);
	});
}

function initSession() {
	var json = jsonToString(data_dir + 'session.json');

	if (json.length > 0) {
		var sessionObj = Ti.JSON.parse(json);
		return new Session(sessionObj);
	}
	else {
		return new Session(null);
	}	
}