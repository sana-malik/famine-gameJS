var TeamIconView = Backbone.View.extend({
	template: _.template('<img src=\"images/team_icons/<%= icon %>\" class=\"team_img\">'),
	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
	},

	render : function() {
		$(this.el).html(this.template(this.model.toJSON()));

		if (session.get("teamStats")[this.model.get("id")]["status"] === teamStatus.DEAD) {
			$(this.el).append("<div class=\"status\">DEAD</div>");
		}
	}
});

var TeamView = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change:teamStats",this.render);
		this.render();
	},

	events : {
		'click .team_div' : 'showTeamInfo'
	},

	showTeamInfo: function(e) {
		var clickedEl = $(e.currentTarget);
  		var name = clickedEl.attr("id");

		showPopup(teams[name].getHTMLSummary());
	},

	render : function() {
		var that = this;
		var teamIconViews = {};
		$(this.el).empty();
		$.each(teams, function(id, team) {
			$(that.el).append("<div class=\"team_div\" id=\""+id+"\"></div>")
			teamIconViews[id] = new TeamIconView({el : "#bottombar > div.team_div#"+id, model:team});
		});
	}
});