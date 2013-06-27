var goToActivePuzzle = function(result) {
	// hide main screen
	$(".main.active").removeClass("active");
	// go to either single puzzle view or multipuzzle view
	if (result === 1) {
		var activePuz = session.getActivePuzzles();
		$(".puzzle#"+nameToId(activePuz[0])).addClass("active");
	}
	else {
		var activePuzs = session.getActivePuzzles();
		var activePuz = activePuzs[0];
		$.each(activePuzs, function(index, puzzle) {
			if (puzzles[puzzle].get("meta")) {
				activePuz = puzzle;
				return false;
			}
		})
		$(".puzzle#"+nameToId(activePuz)).addClass("active");
		$("#" + nameToId(activePuz) + " .answer_input").focus();
	}
}

var LocationView = Backbone.View.extend({
	template: _.template('<h3 class="location-name"><%= name %></h3><p class="location-address"><%= address %></p><h4 class="location-restaurants">Location Details</h4><table class="location-info"><tr><td>Parking: </td><td><%= parking_status %></td></tr><tr><td>Restrooms: </td><td><%= restroom_status %></td></tr><tr><td>Wi-Fi: </td><td><%= wifi_status %></td></tr><tr><td>Food: </td><td><%= food_status %></td></tr></table>'),

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
			<div class="content"><div class="clickable" id="active_puzzle_button">Return to current puzzle</div>\
				<div class="location_description"></div>\
				</div></div></div>\
				<div class="right-sidebar"><div id="right_sidebar_content"></div>\
				<div id="return_message" class="hidden"></div>\
				<div id="start_code_box">Enter a start code: <input type="text" id="start_input">\
		<button id="start_button">Submit</button></div>\
		</div>'),

	events: {
		'click #start_button' : 'start_button_clicked',
		'click #active_puzzle_button' : 'active_puzzle_clicked',
		'keypress input[type=text]#start_input': 'check_for_enter'
	},

	check_for_enter : function(e) {
		 if (e.keyCode == 13) this.start_button_clicked();
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
			// show puzzle link box
			$("#active_puzzle_button").show();

			goToActivePuzzle(result);
			
		}
		else {
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
		$("#active_puzzle_button").hide();
		this.LocationView = new LocationView({el : "#main_screen > .right-sidebar > #right_sidebar_content", model : this.model});
		$("#main #main_screen .left-sidebar .content .location_description").html( locations[locOrder[session.get("currentLocation")]].get("flavor_text") );
		$(this.el).addClass('active')
	},

	render: function() {
		$(this.el).html(this.template());
	}
});