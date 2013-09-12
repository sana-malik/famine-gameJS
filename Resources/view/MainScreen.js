var goToActivePuzzle = function(result) {
	// hide main screen
	$(".main.active").removeClass("active");
	// go to either single puzzle view or multipuzzle view
	if (result === 1) {
		var activePuz = session.getActivePuzzles();
		$(".puzzle#"+nameToId(activePuz[0])).addClass("active");
		$("#" + nameToId(activePuz[0]) + " .answer_input").focus();
	}
	else {
		var activePuzs = session.getActivePuzzles();
		var activePuz = activePuzs[0];
		var hasMeta = false;
		$.each(activePuzs, function(index, puzzle) {
			if (puzzles[puzzle].get("meta")) {
				activePuz = puzzle;
				hasMeta = true;
				return false;
			}
		})
		if (hasMeta)  {
			$(".puzzle#"+nameToId(activePuz)).addClass("active");
			$("#" + nameToId(activePuz) + " .answer_input").focus();
		}
		else $("#multipuzzle").addClass("active");
	}
}

var LocationView = Backbone.View.extend({
	template: _.template('<h3 class="location-name"><%= name %></h3>\
		<p class="location-address"><%= address %></p>\
		<h4 class="location-header">Location Details</h4>\
		<table class="location-info">\
			<td class="location-item">Map: </td><td class="location-status" map="<%= map_file %>">View</td></tr>\
			<tr><td class="location-item">Parking: </td><td class="location-status" title="<%= parking_description %>"><%= parking_status %></td></tr>\
			<tr><td class="location-item">Restrooms: </td><td class="location-status" title="<%= restroom_description %>"><%= restroom_status %></td></tr>\
			<tr><td class="location-item">Wi-Fi: </td><td class="location-status" title="<%= wifi_description %>"><%= wifi_status %></td></tr><tr>\
			<td class="location-item">Food: </td><td class="location-status" title="<%= food_description %>"><%= food_status %></td></tr>\
		</table>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind('change:currentLocation', this.render);
		this.render();
	},

	render: function() {
		$(this.el).html(this.template(locations[locOrder[this.model.get("currentLocation")]].toJSON()));
	}
});

var MainView = Backbone.View.extend({
	template: _.template('<div class="left-sidebar"><div id="navigation-bar">\
				<div id="path">Main</div>\
			</div>\
			<div class="content">\
				<div class="location_description"></div>\
				</div></div></div>\
				<div class="right-sidebar"><div id="right_sidebar_content"></div>\
				<div id="return_message" class="hidden"></div>\
				<div id="start_code_box">Enter a start code: <input type="text" id="start_input">\
		<button id="start_button">Submit</button></div>\
		<div class="return-button"><button class="clickable" id="active_puzzle_button">Return to current puzzle</button></div>\
		</div>'),

	events: {
		'click #start_button' : 'start_button_clicked',
		'click #active_puzzle_button' : 'active_puzzle_clicked',
		'keypress input[type=text]#start_input': 'check_key'
	},

	check_key : function(e) {
		 switch(e.keyCode) {
		 	case 13: // enter
		 		this.start_button_clicked();
		 		break;
		 	}
	},

	start_button_clicked : function() {
		var entry = clean($("#start_input").val());
		// clear start code box + error box
		$("#start_input").val("");
		$("#return_message").html("");

		// activate puzzles in session
		var result = this.model.activatePuzzles(entry);
		if (result > 0) {
			$("#start_code_box").hide();
			$("#return_message").addClass("hidden");
			// show puzzle link box
			$("#active_puzzle_button").show();

			goToActivePuzzle(result);
			
		}
		else if (entry != "") {
			$("#return_message").removeClass("hidden");
			$("#return_message").html(entry + " is not a valid start code.");
		}
	    
	},

	active_puzzle_clicked : function() {
		// activate puzzles in session
		var result = this.model.getActivePuzzles().length;
		goToActivePuzzle(result);
	},

	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
		
		if (this.model.getActivePuzzles().length > 0) { // show current puzzle link instead
			$("#start_code_box").hide();
			$("#return_message").addClass("hidden");
			$("#active_puzzle_button").show();
		} else {
			$("#active_puzzle_button").hide();
			$("#start_input").focus();
		}
		
		$(this.el).addClass('active')

		var location_text = locations[locOrder[session.get("currentLocation")]].get("flavor_text")
		var puzzle = locations[locOrder[session.get("currentLocation")]].get("puzzles")
		var start_code = puzzles[puzzle].get("start_code")
		if( debugActive("show_solutions") )
			location_text = location_text + "<br><br>Start Code:\t" + start_code
		
		$("#main #main_screen .left-sidebar .content .location_description").html( location_text );
		this.LocationView = new LocationView({el : "#main_screen > .right-sidebar > #right_sidebar_content", model : this.model});
	},

	render: function() {
		$(this.el).html(this.template());
	}
});