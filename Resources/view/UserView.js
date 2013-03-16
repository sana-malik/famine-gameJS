var UserView = Backbone.View.extend({
	template : _.template('Fans: <span class="fan_count"><%= fans %></span>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change:resourceStats",this.render);
		this.model.bind("change:fans",this.render);
		this.icon = new TeamIconView({el : "#sidebar > #icon", model:teams[tid]});
		this.render();
	},

	render : function() {
		var that = this;
		$(this.el).children('#stats').html(this.template(this.model.toJSON()));
	}
});