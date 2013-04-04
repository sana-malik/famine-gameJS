var ActivePuzzlesView = Backbone.View.extend({
	template : _.template('<li class="puzzle_link" id=<%= puzzleID %>><%= puzzleName %></li>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
		this.model.bind('change:puzzleStats', this.render);
	},

	events : {
		'click .puzzle_link' : 'showPuzzleScreen'
	},

	showPuzzleScreen : function(e) {
		var clickedEl = $(e.currentTarget);
  		var name = clickedEl.attr("id");

  		$('.active').removeClass('active');
  		$('div.puzzle#' + name).addClass('active');

	},

	render: function() {
		var that = this;
		$(that.el).empty();

		var count = 0;
		$.each(that.model.get("puzzleStats"), function(name, puzzle) {
			if (puzzle["status"] === puzzleStatus.ACTIVE) {
				$(that.el).append(that.template({puzzleID: nameToId(name), puzzleName: name}));
				count += 1;
			}
		});

		if (count === 0) {
			$(that.el).append("<li>none!</li>");
		}
	}
});

var SolvedPuzzlesView = Backbone.View.extend({
	template : _.template('<li class="puzzle_link" id=<%= puzzleID %>><%= puzzleName %></li>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
		this.model.bind('change:puzzleStats', this.render);
	},

	events : {
		'click .puzzle_link' : 'showPuzzleScreen'
	},

	showPuzzleScreen : function(e) {
		var clickedEl = $(e.currentTarget);
  		var name = clickedEl.attr("id");

  		$('.active').removeClass('active');
  		$('div.puzzle#' + name).addClass('active');

	},

	render: function() {
		var that = this;
		$(that.el).empty();

		var count = 0;
		$.each(that.model.get("puzzleStats"), function(name, puzzle) {
			if (puzzle["status"] === puzzleStatus.SOLVED) {
				$(that.el).append(that.template({puzzleID: nameToId(name), puzzleName: name}));
				count += 1;
			}
		});

		if (count === 0) {
			$(that.el).append("<li>none!</li>");
		}
	}
});

var MainView = Backbone.View.extend({
	template: _.template('<div class="left-sidebar"><div id="navigation-bar">\
				<div id="backbutton"><a href="back"><img src="images/gui/back-button.png"></a></div>\
				<div id="path">Path > Goes > Here</div>\
			</div>\
			<div class="content"><p>Testing the scrollbar</p>\
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum enim mi, vulputate et rutrum quis, feugiat ut libero. Nulla eu velit odio. Aliquam enim nunc, pharetra vel laoreet non, malesuada at sapien. Nullam eleifend sem eu eros facilisis euismod. Etiam quis lacus id felis gravida venenatis. Quisque blandit pharetra dolor, vel accumsan eros gravida vitae. Integer ac leo urna. Nullam ut iaculis orci. Nunc at orci eros. Morbi quis nibh purus, id ultricies sapien.</p>\
				<p>Nam accumsan, tellus eget pretium posuere, nisl orci dignissim felis, vel pharetra mauris lacus sed est. Nullam id turpis venenatis sem viverra volutpat sed quis elit. Integer non ipsum facilisis velit tincidunt convallis non vitae nisi. Sed bibendum vulputate nisl, et vehicula sapien tincidunt commodo. Aliquam erat volutpat. Donec a massa vitae justo laoreet fringilla a vel urna. Sed ultrices tincidunt cursus. Curabitur bibendum placerat tortor, non laoreet est bibendum in. Nulla vel elit eros, id pharetra dolor. Nullam quis velit eget purus iaculis aliquet. Etiam pellentesque augue nisi, sit amet cursus neque.</p></div>\
				</div></div>\
				<div class="right-sidebar">location stuff <br>Enter a start code: <input type="text" id="start_input">\
		<button id="start_button">Submit</button><div id="return_message"></div>\
		</div>'),

	events: {
		'click #start_button' : 'start_button_clicked'
	},


	start_button_clicked : function() {
		var entry = clean($("#start_input").val());

		// activate puzzles in session
		var result = this.model.activatePuzzles(entry);
		if (result > 0) {
			$("#return_message").html("<font color=green>Success!</font>");
		}
		else {
			$("#return_message").html("<font color=red>sorry! " + entry + " is not a valid code.</font>");
		}
	},

	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
		this.ActiveView = new ActivePuzzlesView({el : "#main_screen > #active_puzzles", model : this.model});
		this.SolvedView = new SolvedPuzzlesView({el : "#main_screen > #solved_puzzles", model : this.model});
	},

	render: function() {
		$(this.el).html(this.template());
		$(this.el).addClass('active')
	}
});