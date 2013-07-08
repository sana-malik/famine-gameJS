var Resource = Backbone.Model.extend({

	getIconHTML : function() {
		var stat = "<div class=\"resource_div\" id=\"" + this.get("name") +"\">" +
		"<img src=\"images/resources/" + this.get("icon") + "\" class=\"resource_img\">";
		if (this.get("name") in session.get("resourceStats") && session.get("resourceStats")[this.get("name")]["status"] === resourceStatus.UNLOCKED) {
			stat = stat + "<div class=\"status\">UNLOCKED</div>";
		}
		stat = stat + "</div>";
		return stat;
	},

	unlock : function() {
		if (session.get("resourceStats")[this.get("name")]["status"] === resourceStatus.UNLOCKED) {
			return; // already unlocked?!
		}

		// update object
		var stats = $.extend({},session.get("resourceStats"));
		stats[this.get("name")] = {"status" : resourceStatus.UNLOCKED};
		session.set("resourceStats",stats);

		showPopup("The " + this.get("name") + " has been unlocked.");
	}
});
