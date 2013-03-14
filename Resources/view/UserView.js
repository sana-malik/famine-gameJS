/*	getActiveTeamHTML : function() {
		var team = teams[tid];
		var output = "<span class=\"team_title\">" + team.name + "</span>" + 
		"<span class=\"team_bio\">" + team.bio + "</span>" + 
		"<span class=\"fan_count\">Fans: " + this.get("fans") + "</span>";
		return output;
}*/

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