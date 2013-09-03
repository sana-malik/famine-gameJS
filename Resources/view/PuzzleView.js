var ActivePuzzlesView = Backbone.View.extend({
	template : _.template('<li class="puzzle_row"><span class="puzzle_link clickable" id="<%= puzzleID %>"><%= puzzleName %></span><span id="<%= puzzleID %>" class="answer"></span></li>'),

	initialize: function(options) {
		_.bindAll(this, 'render');
		this.puzzleName = options.puzzleName;
		this.render();
		this.model.bind('change:renderMeta', this.render);
	},

	events : {
		'click .puzzle_link' : 'showPuzzleScreen'
	},

	showPuzzleScreen : function(e) {
		var clickedEl = $(e.currentTarget);
  		var name = clickedEl.attr("id");

  		$('.main.active').removeClass('active');
  		$('div.puzzle#' + name).addClass('active');
  		$('div.puzzle#' + name + " .answer_input").focus()
	},

	render: function() {
		var that = this;
		$(that.el).empty();

		var count = 0;
		$.each(that.model.get("puzzleStats"), function(name, puzzle) {
			if (puzzles[name].get("start_code") === session.get("lastStartCode") || (that.puzzleName != "none" && puzzles[name].get("start_code") === puzzles[that.puzzleName].get("start_code"))) {
				if ((puzzle["status"] === puzzleStatus.ACTIVE || puzzle["status"] === puzzleStatus.ARCHIVED) && !puzzles[name].get("meta")) {
					$(that.el).append(that.template({puzzleID: nameToId(name), puzzleName: name}));
					count += 1;
				}
				else if (puzzle["status"] === puzzleStatus.SOLVED && !puzzles[name].get("meta")) {
					$(that.el).append(that.template({puzzleID: nameToId(name), puzzleName: name}));
					$(".answer#"+nameToId(name)).text('SOLVED: ' + getAnswerToPuzzle(name));
					count += 1;
				}
			}
		});

		if (count != 0) {
			$(that.el).prepend('<h4 class="title">Active Puzzles:</h4>');
		}
		else {
			$("#start_code_box").show(); // why does it show the start code box here? what if it solved all the minis but not hte meta?
		}
	}
});
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

		var current_time = getCurrentDateTime();
		var elapsed = (current_time-stats[this.puzzleName]["start_time"])/1000;
		if ( debugActive() )
				elapsed *= parameters["debug_parameters"]["time_multiplyer"];

		var cost = puzzles[this.puzzleName].get("hints")[this.hintName].getCost(elapsed/60); 
		var status = stats[this.puzzleName]["hintStats"][this.hintName]["status"];
		var reveal = true;

		// Popup asking for hint reveal confirmation
		if (cost != 0  && status == hintStatus.AVAILABLE)
			reveal=confirm("If you take this hint, " + cost + " viewers will lose interest in your progress.  Are you sure you want to do this?");
		
		if (reveal) {
			if (stats[this.puzzleName]["hintStats"][this.hintName]["status"] != hintStatus.SKIPPED) {	
				stats[this.puzzleName]["current_worth"] -= cost;
				
				if (stats[this.puzzleName]["current_worth"] < 0)
					stats[this.puzzleName]["current_worth"] = 0;

			}

			stats[this.puzzleName]["hintStats"][this.hintName]["status"] = hintStatus.REVEALED;

			this.model.set("puzzleStats",stats);

			saveSession();
		}
	},

	render: function() {
		var that = this;
		$(that.el).html(that.template({name : this.hintName}));
		
		var current_time = getCurrentDateTime();
		var elapsed = (current_time-session.get("puzzleStats")[this.puzzleName]["start_time"])/1000;
		if ( debugActive() )
				elapsed *= parameters["debug_parameters"]["time_multiplyer"];

		var cost = puzzles[this.puzzleName].get("hints")[this.hintName].getCost(elapsed/60);

		if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.LOCKED) {
			$(that.el).hide();
		}
		else {
			$(that.el).parent().show();	
			$(that.el).show();
			if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.AVAILABLE) {
				var button_text = 'Purchase Hint';
				if (cost <= 0)
					button_text = 'Reveal Free Hint';
				$(that.el).children('.hint_text').html('<button id=\"hint_button\">' + button_text + '</button>');
			}
			else if (session.get("puzzleStats")[that.puzzleName]["hintStats"][that.hintName]["status"] === hintStatus.SKIPPED) {
				$(that.el).children('.hint_text').html('<button id=\"hint_button\">Reveal Free Hint</button>');
			}
			else {
				$(that.el).children('.hint_text').html(puzzles[this.puzzleName].get("hints")[this.hintName].get("text"));
			}
		}
	}

});

var PuzzleSessionView = Backbone.View.extend({
	template : _.template('<div class="solving-details">Viewers watching: <span id="fan_worth"><%= current_worth %></span><br />\
		Elapsed time: <span id="elapsed_time"></span></div>'),

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
		var current_time = getCurrentDateTime();
		var elapsed = (current_time-session.get("puzzleStats")[this.puzzleName]["start_time"])/1000;
		if ( debugActive() )
				elapsed *= parameters["debug_parameters"]["time_multiplyer"];

		$("#elapsed_time", that.el).html( formatTime(elapsed, true) )
	}

});

var PuzzleView = Backbone.View.extend({
	template: _.template('<div class="left-sidebar"><div id="navigation-bar">\
				<!--<div id="backbutton"><a href="back"><img src="images/gui/back-button.png"></a></div>-->\
				<div id="path"><span id="mainbutton" class="clickable">Main</span> > <% if (puzzlesWithStartCode(start_code) > 1 && !meta) { %> <span class="meta_name clickable"></span>  > <% } %> <%= name %></div>\
			</div>\
			<div class="content"><h2 class="puzzle_title"><%= name %></h2>\
		<span class="flavor_text"><%= flavor_text %></span>\
		<div class="hints"></div>\
		</div></div>\
		<div class="right-sidebar">\
		<div id="right_sidebar_content_puzzle">\
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
		this.session_vars = new PuzzleSessionView({el : ".main#" + nameToId(this.puzzleName) + " .puzzle_data", puzzleName : this.puzzleName, model : session});
		$("#" + nameToId(that.puzzleName) + " .hints").hide()
		this.hints = {};
		$.each(puzzles[this.puzzleName].get("hints"), function(name, hint) {
			$("#" + nameToId(that.puzzleName) + " .hints").prepend("<div class=\"hint\" id=\"" + nameToId(name) + "\"></div>");
			that.hints[name] = new HintView({el : '.main#' + nameToId(that.puzzleName) + " .hint#" + nameToId(name), hintName : name, puzzleName: that.puzzleName, model : session});
		});

		this.log_view = new PuzzleLogView({el : ".main#" + nameToId(this.puzzleName) + " .log", model : session, puzzleName : this.puzzleName});
		if (puzzles[that.puzzleName].get("meta")) {
			$('<div class="metas sub-container"></div>').insertAfter('.flavor_text', this.el);
			that.ActiveView = new ActivePuzzlesView({el : ".main#" + nameToId(this.puzzleName) + " .metas", model : session, puzzleName: that.puzzleName});
		}
		$(".meta_name", this.el).text(getMetaName(puzzles[this.puzzleName].get("start_code")));

		var self_text = puzzles[this.puzzleName].get("self_flavor_text")
		if (self_text != "" && $.inArray(tid, puzzles[this.puzzleName].get("teams_killed")) != -1 )
			$("#" + nameToId(this.puzzleName) + " .flavor_text").html(self_text)
	},

	render: function() {
		var that = this;
		$(that.el).html(that.template(puzzles[this.puzzleName].toJSON()));
	},

	events : {
		'click .answer_button' : 'submit_answer',
		'click #mainbutton' : 'back_to_main',
		'click .meta_name' : 'go_to_meta',
		'keypress input[type=text].answer_input': 'check_for_enter'
	},

	check_for_enter : function(e) {
		 if (e.keyCode == 13) this.submit_answer();
	},

	submit_answer : function() {
		var entry = clean($("#" + nameToId(this.puzzleName) + " .answer_input").val());
		$("#" + nameToId(this.puzzleName) + " .answer_input").val("");
		puzzles[this.puzzleName].checkAnswer(entry);
	},

	back_to_main :function() {
		$('.main.active').removeClass('active');
		$('#main_screen').addClass('active');
	},

	go_to_meta : function() {
		$('.main.active').removeClass('active');
		var metaName = getMetaName(puzzles[this.puzzleName].get("start_code"))
		if (metaName === "All Puzzles") $('.main#multipuzzle').addClass('active');
		else $('.main#' + nameToId(metaName)).addClass('active');
	}
});

var MultiPuzzleView = Backbone.View.extend({
	template: _.template('<div class="left-sidebar"><div id="navigation-bar">\
				<div id="path"><span id="mainbutton" class="clickable">Main</span> > All Puzzles</div>\
			</div>\
			<div class="content">\
		</div></div>\
		<div class="right-sidebar">\
		<div id="right_sidebar_content_puzzle">\
		not sure what to put here?\
		</div>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
		this.ActiveView = new ActivePuzzlesView({el : "#multipuzzle .content", model : this.model, puzzleName: "none"});
	},

	render: function() {
		$(this.el).html(this.template());
	}
});