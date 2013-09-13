var ResourceView = Backbone.View.extend({
	template : _.template(''),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change:resourceStats",this.render);
		this.render();
		$("#resources")
			.delegate(".resource_div.locked", "mouseenter", function() {$(this).stop().animate({opacity: 1}, 250)})
			.delegate(".resource_div.locked", "mouseleave", function() {$(this).stop().animate({opacity: 0.4}, 250)});
	},

	render : function() {
		var that = this;
		$(that.el).empty()

		var count = 0;
		$.each(resources, function(name, resource) { 
			$(that.el).append('<div class="resource_div" id="' + nameToId(name) + '"><img src="images/resources/' + resource.get("icon") + '" class="resource_img" title="' + name + '"></div>');

			if (that.model.get("resourceStats")[name]["status"] == resourceStatus.LOCKED) {
				$(".resource_div#"+nameToId(name), that.el).addClass("locked");
			}

			count = count + 1
			if(count % 4 == 0 )
				$(that.el).append("<br>")
		});
	}
});

var UserView = Backbone.View.extend({
	template : _.template('<h3 class="fan_count"><%= fans %></h3><h3 class="fans"></h3>'),

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind("change:fans",this.render);
		this.model.bind("change:rebellionTheme",this.render);
		this.icon = new BigTeamIconView({el : "#sidebar > #icon", model:teams[tid]});
		this.render();
	},

	render : function() {
		var that = this;
		$(that.el).children('#stats').html(this.template(this.model.toJSON()));
		if (session.get("rebellionTheme")) $(".fans", that.el).text("Revolutionaries");
		else $(".fans", that.el).text("Fans");
		var resources = new ResourceView({el: "#sidebar > #resources", model: this.model});
	}
});