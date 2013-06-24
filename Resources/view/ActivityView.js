var ActivityView = Backbone.View.extend({
	template: _.template('yay! the activity tab.'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
	},

	render: function() {
		$(this.el).html(this.template());
	}
});