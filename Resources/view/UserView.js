var ResourceView = Backbone.View.extend({
	template : _.template(''),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change:resourceStats",this.render);
		this.render();
	},

	render : function() {
		var that = this;
		$(that.el).empty()
		$.each(resources, function(name, resource) { 
			$(that.el).append('<div class="resource_div" id="' + nameToId(name) + '"><img src="images/resources/' + resource.get("icon") + '" class="resource_img" alt="' + name + '"></div>');

			if (that.model.get("resourceStats")[name]["status"] == resourceStatus.LOCKED) {
				$(".resource_div#"+nameToId(name), that.el).addClass("locked");
			}
		});
	}
});

var UserView = Backbone.View.extend({
	template : _.template('<h3 class="fan_count"><%= fans %></h3><h3 class="fans">Fans</h3>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change:fans",this.render);
		this.icon = new TeamIconView({el : "#sidebar > #icon", model:teams[tid]});
		this.render();
	},

	render : function() {
		var that = this;
		$(that.el).children('#stats').html(this.template(this.model.toJSON()));

		var resources = new ResourceView({el: "#sidebar > #resources", model: this.model});
	}
});