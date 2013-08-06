var HistoryView = Backbone.View.extend({
	template: _.template('yay! the history tab.'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change",this.render)
		this.render();
	},

	render: function() {
		var that = this;
		$(that.el).empty();
		var history = that.model.get("history");
		$.each(history, function(i, item) {
			var unread = "";
			var id = "";
			if (item[1] === logTypes.MESSAGE && session.get("messageStats")[item[3]]["status"] === "unread") {
				unread = " unread";
				id = ' id = "' + item[3] +'"';
			}
			$(that.el).prepend('<span class="log-item' + unread + '"' + id +'><h4 class="timestamp">'+item[0]+'</h4><p class="msg">'+item[2]+'</p></span>');
		});
	},


	events : {
		'click .puzzle_link' : 'showPuzzleScreen', 
		'click .vid_link' : 'playVideo',
		'click .log-item' : 'markRead'
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

	playVideo : function(e) {
		var clickedEl = $(e.currentTarget);
  		var id = clickedEl.attr("id");

  		teams[id].showVideo();
	},

	markRead: function(e) {
		var id = $(e.currentTarget).attr("id");

		var stats = $.extend(true, {}, session.get("messageStats"));
		stats[id]["status"] = "read";
		session.set("messageStats", stats);

		var unreadCount = session.get("unreadCount")-1;
		session.set("unreadCount", unreadCount);
		if (unreadCount > 0) {
	 		$('#tab_history').html('<a href="#">Activity ('+unreadCount+')</a>');
		} else {
			$('#tab_history').html('<a href="#">Activity</a>');
		}

		saveSession();
	}
});