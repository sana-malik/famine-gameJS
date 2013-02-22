var PuzzleLogView = Backbone.View.extend({
	template : _.template('<span class="log_entry"><%= entry %></span>'),
	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		this.puzzleName = options.puzzleName;
		this.model.bind('change:puzzleStats', that.render);
		this.render();
	},

	render: function() {
		var that = this;
		$(this.el).empty();
		$.each(session.get("puzzleStats")[that.puzzleName]["log"], function (index, text) {
			$(that.el).prepend(that.template({entry : text}));
		});	
	}
});

var HintView = Backbone.View.extend({
	template : _.template('<span class="hint_name"><%= name %>: </span><span class="hint_text"></span>'),
	
	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		$.extend(this, options);
		this.model.bind('change:puzzleStats', that.render);
		this.render();
	},

	events : {
		'click #hint_button' : 'reveal_hint'
	},

	reveal_hint : function () {
		var stats = $.extend(true, {}, this.model.get("puzzleStats"));

		var current_time = Math.round((new Date()).getTime()/1000);
		var elapsed = (current_time-stats[this.puzzleName]["start_time"]) * 1000/timeInterval;
		
		stats[this.puzzleName]["hintStats"][this.hintName]["status"] = hintStatus.REVEALED;
		
		var cost = puzzles[this.puzzleName].get("hints")[this.hintName].getCost(elapsed/60);
		stats[this.puzzleName]["current_worth"] -= cost;
		
		if (stats[this.puzzleName]["current_worth"] < 0)
			stats[this.puzzleName]["current_worth"] = 0;

		this.model.set("puzzleStats",stats);
	},

	render: function() {
		var that = this;
		$(that.el).html(that.template({name : this.hintName}));

		var remaining = session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["remaining"];
		if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.LOCKED) {
			$(that.el).children('.hint_text').html('available in ' + formatTime(remaining));
		}
		else if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.AVAILABLE) {
			$(that.el).children('.hint_text').html('<button id=\"hint_button\">Get Hint</button>');
			if (remaining > 0) $(that.el).children('.hint_text').append(' -- min cost in ' + formatTime(remaining));
		}
		else {
			$(that.el).children('.hint_text').html(puzzles[this.puzzleName].get("hints")[this.hintName].get("text"));
		}
	}

});

var PuzzleSessionView = Backbone.View.extend({
	template : _.template('Fans watching: <span id="fan_worth"><%= current_worth %></span>'),

	initialize: function(options) {
		_.bindAll(this, 'render');
		this.puzzleName = options.puzzleName;
		this.model.bind('change:puzzleStats', this.render);
		this.render();
	},

	render: function() {
		var that = this;
		var stat = this.model.get("puzzleStats")[this.puzzleName];	
		$(that.el).html(that.template(stat));
	}

});

var PuzzleView = Backbone.View.extend({
	template: _.template('<span class="puzzle_title"><%= name %></span>\
		<span class="flavor_text"><%= flavor_text %></span>\
		<div class="session_vars"></div>\
		<div class="hints"></div>\
		<div class="answer_box">Enter an answer: <input type="text" class="answer_input">\
		<button class="answer_button">Submit</button><button class="giveup_button">I give up!</button></div>\
		<div class="log"></div>\
		<span id="back_to_main">back to main</span>'),

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		this.puzzleName = options.puzzleName;

		this.render();
		this.session_vars = new PuzzleSessionView({el : ".main#" + nameToId(this.puzzleName) + " .session_vars", puzzleName : this.puzzleName, model : session});
		this.hints = {};
		$.each(puzzles[this.puzzleName].get("hints"), function(name, hint) {
			$("#" + nameToId(that.puzzleName) + " > .hints").append("<div class=\"hint\" id=\"" + nameToId(name) + "\"></div>");
			that.hints[name] = new HintView({el : '.main#' + nameToId(that.puzzleName) + " .hint#" + nameToId(name), hintName : name, puzzleName: that.puzzleName, model : session});
		});

		this.log_view = new PuzzleLogView({el : ".main#" + nameToId(this.puzzleName) + " .log", model : session, puzzleName : this.puzzleName});
	},

	render: function() {
		var that = this;
		$(that.el).html(that.template(puzzles[this.puzzleName].toJSON()));
	},

	events : {
		'click .answer_button' : 'submit_answer',
		'click #back_to_main' : 'back_to_main'
	},

	submit_answer : function() {
		var entry = clean($("#" + nameToId(this.puzzleName) + " .answer_input").val());
		puzzles[this.puzzleName].checkAnswer(entry);
	},

	back_to_main : function() {
		$('.main.active').removeClass('active');
		$('#main_screen').addClass('active');
	}
});