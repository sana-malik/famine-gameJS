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
			$(that.el).prepend('<span class="log-item"><span class="timestamp">'+item[0]+'</span><span class="msg">'+item[2]+'</span></span>');
		});
	}
});