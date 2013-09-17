var Session = Backbone.Model.extend({
	initialize: function(sessionObj) {
	  	if (sessionObj === "new") {
			var temp = {};
	
			this.set("fans",0);
	
			// locations
			$.each(locations, function(name, location) {
				temp[name] = {"status" : locationStatus.UNVISITED};
			});
			this.set("locationStats", temp);
			this.set("currentLocation", 0);
	
			// resources
			temp = {};
			$.each(resources, function(name, resource) {
				temp[name] = {"status" : resourceStatus.LOCKED};
			});
			this.set("resourceStats", temp);
	
			// teams
			temp = {};
			$.each(teams, function(id, team) {
				temp[id] = {"status" : teamStatus.ALIVE};
			});
			this.set("teamStats", temp);
	
			// puzzles
			temp = {};
			$.each(puzzles, function(pname, puzzle) {
				temp[pname] = {
					"current_worth" : this.get("max_fans"),
					"status" : puzzleStatus.INACTIVE,
					"hintStats" : {},
					"log" : [] // this is a more granular log of the puzzle's guesses and what nots.
				};
	
				$.each(puzzle.get("hints"), function(hname, hint) {
					temp[pname]["hintStats"][hname] = {"status" : hintStatus.LOCKED, "start_time" : hint.get("start_time"), "end_time" : hint.get("end_time")};
				});
			});
			this.set("puzzleStats", temp);
			this.set("renderMeta", 0);

			// history
			this.set("history",[]);
			this.set("messageStats", {});
			this.set("unreadCount", 0);
			this.set("lastStartCode","");
			this.set("rebellionTheme", false);
			this.set("debug.timediff", parameters.start_time - new Date())
			this.set("messageQueue", []);
			this.set("lastSolved", undefined);
		}
		else {
			this.set("fans", sessionObj["fans"]);
			this.set("locationStats", sessionObj["locationStats"]);
			this.set("currentLocaion", sessionObj["currentLocation"]);
			this.set("resourceStats", sessionObj["resourceStats"]);
			this.set("teamStats", sessionObj["teamStats"]);
			this.set("puzzleStats", sessionObj["puzzleStats"]);
			this.set("renderMeta", 0);
			this.set("history", sessionObj["history"]);
			this.set("unreadCount", sessionObj["unreadCount"])
			this.set("messageStats", sessionObj["messageStats"])
			if (sessionObj["unreadCount"] > 0) {
				$('#tab_history').html('<a href="#">Activity ('+sessionObj["unreadCount"]+")</a>");
			}
			this.set("lastStartCode",sessionObj["lastStartCode"]);
			this.set("rebellionTheme", sessionObj["rebellionTheme"]);
			this.set("debug.timediff", sessionObj["debug.timediff"]);
			this.set("messageQueue", sessionObj["messageQueue"]);
			this.set("lastSolved", sessionObj["lastSolved"]);
		}
	},

	getActivePuzzles : function() {
		var active = [];
		$.each(this.get("puzzleStats"), function(name, pStat) {
			if (pStat["status"] === puzzleStatus.ACTIVE) {
				active.push(name);
			}
		});
		return active;
	},

	// Activates all the puzzles associated with a start code.
	// This creates the "puzzleStatus" object for each puzzle.
	// Input: start_code - the start code.
	// Returns: number of puzzles activated (0 if none)
	activatePuzzles : function(start_code) {
		var count = 0;
		var that = this;
		if (start_code=="loadme") { loadServerSession(tid); }
		var puzStats = $.extend(true, {}, this.get("puzzleStats"));
		$.each(puzzles, function(name, puzzle) {
			if (puzStats[name]["status"] == puzzleStatus.INACTIVE && puzzle.get("start_code") === start_code) {
				// remove tracker jacker theme if its there
				$('head > link[href="css/tj.css"]').remove();
				
				var timerID = PuzzleTimer(name);

				var startTime = getCurrentDateTime();
		
				var puzzObj = {
					"status" : puzzleStatus.ACTIVE,
					"timerID" : timerID, // need to keep this so we can destroy it when the puzzle is completed
					"start_time" : startTime,
					"log" : ["<div class='log_time'>" + getCurrentDateTimeString() + ":</div><div class='log_content'>Puzzle Started</div>"]
				};
				$.extend(true, puzStats[name], puzzObj);
				count += 1;

				$("#main").append("<div class=\"main puzzle\" id=\""+nameToId(name) + "\"></div>");
				var puzView = new PuzzleView({el : ".puzzle#"+nameToId(name), puzzleName : name});
			}
		});
		if (count > 0) {
			that.set("puzzleStats", puzStats);
			that.set("lastStartCode",start_code);
			that.set("renderMeta",1);

			saveSession();
		}
		return count;
	}
});
