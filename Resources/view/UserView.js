var UserView = Backbone.View.extend({
	template : _.template('<h3 class="fan_count"><%= fans %></h3><h3 class="fans">Fans</h3>'),

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