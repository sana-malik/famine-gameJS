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
			$(that.el).prepend('<span class="log-item"><h4 class="timestamp">'+item[0]+'</h4><p class="msg">'+item[2]+'</p></span>');
		});
	},


	events : {
		'click .puzzle_link' : 'showPuzzleScreen', 
		'click .vid_link' : 'playVideo'
	},

	showPuzzleScreen : function(e) {
		var clickedEl = $(e.currentTarget);
  		var name = clickedEl.attr("id");

  		$("#toc > .current").removeClass("current");
		$("#toc > #tab_main").addClass("current");

		$("#main_container > .tab.active").removeClass("active");
		$("#main.tab").addClass("active");

  		$('.main.active').removeClass('active');
  		$('div.puzzle#' + name).addClass('active');
	},

	playVideo : function(e) {
		var clickedEl = $(e.currentTarget);
  		var id = clickedEl.attr("id");

  		teams[id].showVideo();
	}
});