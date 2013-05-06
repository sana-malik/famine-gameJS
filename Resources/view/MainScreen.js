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
	}
}

var LocationView = Backbone.View.extend({
	template: _.template('<span class="title"><%= name %> <%= address %> <%= food_description %> <%= food_description %> <%= name %></span>'),

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
			<div class="content"><div class="clickable" id="active_puzzle_button">Return to current puzzle</div><p>\
				Testing the scrollbar</p>\
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum enim mi, vulputate et rutrum quis, feugiat ut libero. Nulla eu velit odio. Aliquam enim nunc, pharetra vel laoreet non, malesuada at sapien. Nullam eleifend sem eu eros facilisis euismod. Etiam quis lacus id felis gravida venenatis. Quisque blandit pharetra dolor, vel accumsan eros gravida vitae. Integer ac leo urna. Nullam ut iaculis orci. Nunc at orci eros. Morbi quis nibh purus, id ultricies sapien.</p>\
				<p>Nam accumsan, tellus eget pretium posuere, nisl orci dignissim felis, vel pharetra mauris lacus sed est. Nullam id turpis venenatis sem viverra volutpat sed quis elit. Integer non ipsum facilisis velit tincidunt convallis non vitae nisi. Sed bibendum vulputate nisl, et vehicula sapien tincidunt commodo. Aliquam erat volutpat. Donec a massa vitae justo laoreet fringilla a vel urna. Sed ultrices tincidunt cursus. Curabitur bibendum placerat tortor, non laoreet est bibendum in. Nulla vel elit eros, id pharetra dolor. Nullam quis velit eget purus iaculis aliquet. Etiam pellentesque augue nisi, sit amet cursus neque.</p></div>\
				</div></div>\
				<div class="right-sidebar"><div id="right_sidebar_content"></div><div id="return_message"></div><div id="start_code_box">Enter a start code: <input type="text" id="start_input">\
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

		// activate puzzles in session
		var result = this.model.activatePuzzles(entry);
		if (result > 0) {
			// clear and hide start code box
			$("#start_input").val("");
			$("#start_code_box").hide();
			// show puzzle link box
			$("#active_puzzle_button").show();

			goToActivePuzzle(result);
		}
		else {
			$("#return_message").html("<font color=red>" + entry + " is not valid</font>");
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
		$(this.el).addClass('active')
	},

	render: function() {
		$(this.el).html(this.template());
	}
});