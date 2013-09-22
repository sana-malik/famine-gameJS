var HistoryView = Backbone.View.extend({
	template: _.template('yay! the history tab.'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change:history",this.render);
		this.model.bind("change:messageStats", this.render);
		this.render();
	},

	render: function() {
		var that = this;
		$(that.el).empty();

		// history items
		var history = that.model.get("history");
		$.each(history, function(i, item) {
			var unread = "";
			var id = "";
			if (item[1] === logTypes.MESSAGE) {
				if (session.get("messageStats")[item[3]]["status"] === "unread") unread = " unread";
				id = ' id = "' + item[3] +'"';
			}
			$(that.el).prepend('<span class="log-item' + unread + ' ' + item[1] + '"' + id +'><h4 class="timestamp">'+item[0]+'</h4><p class="msg">'+item[2]+'</p></span>');
		});


		// mark messages read button
		$(that.el).prepend('<span id="mark_messages" class="filter">Mark All Read</span>');

		// filters
		$(that.el).prepend('<b>Filter:</b> <ul id="filters">\
			<li id="kill" class="filter">Kills</li>\
			<li id="story" class="filter">Story</li>\
			<li id="resource" class="filter">Resources</li>\
			<li id="message" class="filter">Messages</li>\
			<li id="puzzle" class="filter">Puzzles</li>\
		</ul>');
	},


	events : {
		'click .puzzle_link' : 'showPuzzleScreen', 
		'click .vid_link' : 'playTeamVideo',
		'click .log-item' : 'markRead',
		'click li.filter' : 'filter',
		'click #mark_messages' : 'readAll',
		'click .vid_message' : 'playVideo'
	},

	showPuzzleScreen : function(e) {
		var clickedEl = $(e.currentTarget);
  		var name = clickedEl.attr("id");

  		$("#toc > .current").removeClass("current");
		$("#toc > #tab_main").addClass("current");

		$("#main_container > .tab.active").removeClass("active");
		$("#main.tab").addClass("active");

  		$('.main.active').removeClass('active');
  		$('div.puzzle#' + nameToId(name)).addClass('active');
	},

	playTeamVideo : function(e) {
		var clickedEl = $(e.currentTarget);
  		var id = clickedEl.attr("id");

  		teams[id].showVideo();
	},

	playVideo : function(e) {
		alert("play video")
		var clickedEl = $(e.currentTarget);
  		var vid = clickedEl.attr("id");

		var movieFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),"Resources/movies/"+vid).nativePath();
		alert(vid)
		alert(movieFile)
		Ti.Platform.openApplication(movieFile);
	},

	markRead: function(e) {
		if ($(e.currentTarget).hasClass("message") === false) return;
		
		var id = $(e.currentTarget).attr("id");

		var stats = $.extend(true, {}, session.get("messageStats"));
		stats[id]["status"] = "read";
		session.set("messageStats", stats);

		var unreadCount = session.get("unreadCount")-1;
		if (unreadCount < 0) unreadCount = 0;
		session.set("unreadCount", unreadCount);
		if (unreadCount > 0) {
	 		$('#tab_history').html('<a href="#">Activity ('+unreadCount+')</a>');
		} else {
			$('#tab_history').html('<a href="#">Activity</a>');
		}

		saveSession();
	},

	readAll: function() {
		var stats = $.extend(true, {}, session.get("messageStats"));

		$.each(stats, function(name, mObj) {
			if (mObj["status"] === "unread") {
				mObj["status"] = "read";
			}
		});
		session.set("messageStats", stats);

		session.set("unreadCount", 0);
		$('#tab_history').html('<a href="#">Activity</a>');

		saveSession();
	},

	filter: function(e) {
		var id = $(e.currentTarget).attr("id");

		if ($("#filters li.selected#" + id).length > 0) { // deselect this
			$("#filters li.selected#" + id).removeClass("selected");
			$('.log-item.' + id).hide();
			if ($("#filters li.selected").length === 0) $('.log-item').show(); // if nothing is now selected, show everything
		} else { // select something new
			$("#filters li#" + id).addClass("selected");
			if ($("#filters li.selected").length === 1) $('.log-item').hide(); // if only this is selected, hide everything first
			$('.log-item.' + id).show();
		} 
	}
});