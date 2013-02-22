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

		$.each(that.model.get("puzzleStats"), function(name, puzzle) {
			if (puzzle["status"] === puzzleStatus.ACTIVE) {
				$(that.el).append(that.template({puzzleID: nameToId(name), puzzleName: name}));
			}
		});
	}
});

var MainView = Backbone.View.extend({
	template: _.template('Enter a start code: <input type="text" id="start_input">\
		<button id="start_button">Submit</button><div id="return_message"></div>\
		<b>Active Puzzles</b><ul id="active_puzzles"></ul>\
	'),

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
	},

	render: function() {
		$(this.el).html(this.template());
		$(this.el).addClass('active')
	}
});