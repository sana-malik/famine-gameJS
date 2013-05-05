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
	template : _.template('<h3 class="hint_name"><%= name %>: </h3><div class="hint_text"></div>'),
	
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
		var cost = puzzles[this.puzzleName].get("hints")[this.hintName].getCost(elapsed/60);
		var status = stats[this.puzzleName]["hintStats"][this.hintName]["status"];
		var reveal = true;

		// Popup asking for hint reveal confirmation
		if (cost != 0  && status == hintStatus.AVAILABLE)
			reveal=confirm("If you take this hint " + cost + " viewers will lose interest in your progress.  Are you sure you want to do this?");
		
		if (reveal==true) {
			if (stats[this.puzzleName]["hintStats"][this.hintName]["status"] != hintStatus.SKIPPED) {	
				stats[this.puzzleName]["current_worth"] -= cost;
				
				if (stats[this.puzzleName]["current_worth"] < 0)
					stats[this.puzzleName]["current_worth"] = 0;

			}

			stats[this.puzzleName]["hintStats"][this.hintName]["status"] = hintStatus.REVEALED;

			this.model.set("puzzleStats",stats);
		}
	},

	render: function() {
		var that = this;
		$(that.el).html(that.template({name : this.hintName}));

		var remaining = session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["remaining"];
		
		var current_time = Math.round((new Date()).getTime()/1000);
		var elapsed = (current_time-session.get("puzzleStats")[this.puzzleName]["start_time"]) * 1000/timeInterval;
		
		var cost = puzzles[this.puzzleName].get("hints")[this.hintName].getCost(elapsed/60);
		

		if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.LOCKED) {
			$(that.el).children('.hint_text').html('Available in ' + formatTime(remaining));
		}
		else if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.AVAILABLE) {
			var button_text = 'Get hint, lose ' + cost + ' viewers';
			if (cost == 0)
				button_text = 'Reveal free hint';
			$(that.el).children('.hint_text').html('<button id=\"hint_button\">' + button_text + '</button>');
		}
		else if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.SKIPPED) {
			$(that.el).children('.hint_text').html('<button id=\"hint_button\">Reveal free hint</button>');
		}
		else {
			$(that.el).children('.hint_text').html(puzzles[this.puzzleName].get("hints")[this.hintName].get("text"));
		}
	}

});

var PuzzleSessionView = Backbone.View.extend({
	template : _.template('Viewers watching: <span id="fan_worth"><%= current_worth %></span>'),

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
	template: _.template('<div class="left-sidebar"><div id="navigation-bar">\
				<div id="backbutton"><a href="back"><img src="images/gui/back-button.png"></a></div>\
				<div id="path">Path > Goes > Here</div>\
			</div>\
			<div class="content"><h2 class="puzzle_title"><%= name %></h2>\
		<span class="flavor_text"><%= flavor_text %></span>\
		<div class="session_vars"></div>\
		<div class="hints"></div>\
		<!--<button class="giveup_button">I give up!</button>-->\
		</div></div>\
		<div class="right-sidebar">\
		<div id="right_sidebar_content">\
		<h2 class="puzzle_title"><%= name %></h2>\
		<div class="puzzle_data">Viewers watching<br />\
		Time elapsed</div>\
			<div class="log"></div>\
		</div>\
		<div class="answer_box">Enter an answer: <input type="text" class="answer_input">\
		<button class="answer_button">Submit</button></div>\
		</div>'),

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		
		this.puzzleName = options.puzzleName;

		this.render();
		this.session_vars = new PuzzleSessionView({el : ".main#" + nameToId(this.puzzleName) + " .session_vars", puzzleName : this.puzzleName, model : session});
		this.hints = {};
		$.each(puzzles[this.puzzleName].get("hints"), function(name, hint) {
			$("#" + nameToId(that.puzzleName) + " .hints").append("<div class=\"hint\" id=\"" + nameToId(name) + "\"></div>");
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
		'click #backbutton' : 'back_to_main'
	},

	submit_answer : function() {
		var entry = clean($("#" + nameToId(this.puzzleName) + " .answer_input").val());
		puzzles[this.puzzleName].checkAnswer(entry);
	},

	back_to_main :function() {
		$('.main.active').removeClass('active');

		var results = session.getActivePuzzles().length;
		if (results <= 1) {
			$('#main_screen').addClass('active');
		}
		else {
			$('#multipuzzle').addClass('active');
		}
	}
});

var MultiPuzzleView = Backbone.View.extend({
	template: _.template('<div class="left-sidebar"><div id="navigation-bar">\
				<div id="backbutton"><a href="back"><img src="images/gui/back-button.png"></a></div>\
				<div id="path">Path > Goes > Here</div>\
			</div>\
			<div class="content"></div></div>\
		<div class="right-sidebar">what should go here? probably an overall timer?</div>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
		this.ActiveView = new ActivePuzzlesView({el : "#multipuzzle .content", model : this.model});
	},

	render: function() {
		$(this.el).html(this.template());
	},

	events : {
		'click #backbutton' : 'back_to_main',
	},

	back_to_main :function() {
		$('.main.active').removeClass('active');
		$('#main_screen').addClass('active');
	}
});