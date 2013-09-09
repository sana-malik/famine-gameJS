var session;
var puzzles;
var teams;
var locations;
var locOrder;
var resources;
var tid;
var messages;

/**
 * Executes once the DOM is fully loaded. Essentially a "main" method
 */
$(document).ready(function() {
    var dateTest = new Date();
    if (dateTest.getTimezoneOffset() != 240) {
        alert("Please close the application and set\nyour computer to Eastern Daylight Time.");
        return;
    }
	//Create the menu object
    var menu = Ti.UI.createMenu();

    //Create menu items
    var debug = menu.addItem('Debug');
    debug.addItem('Save session', Debug.saveSession);
    debug.addItem('Clear session', Debug.clearSession);
    debug.addItem('Toggle Quick Timer', Debug.toggleDebugTiming)

    //Add menu to the current window
   // Ti.UI.getCurrentWindow().setMenu(menu);

   	// Load parameters
   	parameters = loadParameters();

	// Set up models
	teams = populateTeams();
	locations = populateLocations(); 
	resources = populateResources();
	puzzles = populatePuzzles();
	messages = populateMessages();

	session = initSession();

	// set up toast crap
	toastr.options = {
 		"debug": false,
  		"positionClass": "toast-top-right",
  		"onclick": null,
  		"fadeIn": 500,
  		"fadeOut": 500,
  		"timeOut": 0,
  		"extendedTimeOut": 0
  		/*"onFadeOut": function() {
			$("#toc > .current").removeClass("current");
			$("#toc > #tab_history").addClass("current");

			$("#main_container > .active.tab").removeClass("active");
			$("#history.tab").addClass("active");
  		}*/ // todo(sana): add this function as option override at call site
	}

	// initialize puzzles that already exist + their timers
	$.each(session.get("puzzleStats"), function(name, puzStat) {
		if (puzStat["status"] != puzzleStatus.INACTIVE) {
			// fix start and end strings to objects
			var start = puzStat["start_time"];
			puzStat["start_time"] = parseDateTimeString(start);

			if ("end_time" in puzStat) {
				var end = puzStat["end_time"];
				puzStat["end_time"] = parseDateTimeString(end);
			}

			// create timers for active puzzles
			if (puzStat["status"] == puzzleStatus.ACTIVE) {
				puzStat["timerID"] = PuzzleTimer(name);
			}

			// create div for the puzzle
			$("#main").append("<div class=\"main puzzle\" id=\""+nameToId(name) + "\"></div>");
			var puzView = new PuzzleView({el : ".puzzle#"+nameToId(name), puzzleName : name});
		}
	});

	// if rebellion theme is enabled, add it
	if (session.get("rebellionTheme")) {
		$("head").append('<link rel="stylesheet" type="text/css" href="css/rebellion.css">');
	}
	
	// Set up views
	var team = new TeamView({el : "#bottombar", model : session});
	var user = new UserView({el : "#sidebar", model : session});
	var main = new MainView({el : "#main > #main_screen", model: session});
	var history = new HistoryView({el : "#history", model: session});
	var multipuz = new MultiPuzzleView({el : "#main > #multipuzzle", model: session});


	// Set up tab functionality
	$('#tab_main').click(function() {
		$("#toc > .current").removeClass("current");
		$("#toc > #tab_main").addClass("current");

		$("#main_container > .tab.active").removeClass("active");
		$("#main.tab").addClass("active");
		$("#start_input").focus();
	});
	$('#tab_history').click(function() {
		$("#toc > .current").removeClass("current");
		$("#toc > #tab_history").addClass("current");

		$("#main_container > .active.tab").removeClass("active");
		$("#history.tab").addClass("active");
	});
	$('#tab_info').click(function() {
		$("#toc > .current").removeClass("current");
		$("#toc > #tab_info").addClass("current");

		$("#main_container > .active.tab").removeClass("active");
		$("#info.tab").addClass("active");
	});
	
	$("#popup_content").on("click", ".popup_vid_link", function(e) { 
		teams[$(e.currentTarget).attr("id")].showVideo();
	});
	
	// jquery tooltip
	$(function() {
    	$(document).tooltip({track: true});

  	});
  	$(function() {
    	$(document).tooltip({
    		track: true,
    	  	items: "[map], [title]",
    	  	content: function() {
    	  	  var element = $(this);
    	  	  if (element.is("[map]")) {
    	  	    var map_file = element.attr("map");
    	  	    return "<img class='map' src='/images/maps/" + map_file + "'>";
    	  	  }
    	  	  else if (element.is("[title]")) {
    	  	    return element.attr("title");
    	  	  }
    	  	}
    	});
  	});
});

// hide popup div when outside click
$(document).mouseup(function (e) {
	var popup = $("#popup_content");

	if (!popup.is(e.target) && popup.has(e.target).length == 0) hidePopup();
})

function loadParameters() {
	var json = jsonToString(data_dir + 'parameters.json');

	var params = Ti.JSON.parse(json);

	var start_time_data = params["debug_parameters"].start_time;
	var start_time = new Date(
			start_time_data.year, 
			start_time_data.month-1, 
			start_time_data.day, 
			start_time_data.hour, 
			start_time_data.minute
			);

	params.start_time = start_time;
	
	return params;
}

function populateTeams() {
	var json = jsonToString(data_dir + 'teams.json');

	var teams = {};
	var teamObjs = Ti.JSON.parse(json);
	
	tid = teamObjs.activeTeam;
	
	$.each(teamObjs.teams, function(id, team) {
		teams[id] = new Team(team);
	});

	document.title = "The Famine Game - " + teams[tid].get("name");

	return teams;
}

function populatePuzzles() {
	var json = jsonToString(data_dir + 'puzzles.json');

	var puzzles = {};
	var puzObjs = Ti.JSON.parse(json);

	$.each(puzObjs, function(name, puzzle) {
		puzzles[name] = new Puzzle(puzzle);
	});

	return puzzles;
}

function populateResources() {
	var json = jsonToString(data_dir + 'resources.json');

	var resources = {};
	var resObjs = Ti.JSON.parse(json);
	$.each(resObjs, function(name, resource) {
		resources[name] = new Resource(resource);
	});

	return resources;
}

function populateMessages() {
	var json = jsonToString(data_dir + 'messages.json');

	return Ti.JSON.parse(json);
}

function populateLocations() {
	var json = jsonToString(data_dir + 'locations.json')
	var locObjs = Ti.JSON.parse(json);
	
	// Order of locations needs to be extracted first
	locOrder = locObjs.order;
	
	var locations = {};
	$.each(locObjs.locations, function(name, location) {
		locations[name] = new Location(location);
	});

	return locations;
}

function initSession() {
	var json = jsonToString(data_dir + 'session.json');

	if (!debugActive("ephemeral_session") && json.length > 0) {
		var sessionObj = Ti.JSON.parse(json);
		return new Session(sessionObj);
	}
	else {
		return new Session("new");
	}	
}
