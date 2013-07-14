var Team = Backbone.Model.extend({

	// the following two functions *should* be taken care of in TeamViews.js but too lazy right now...
	getHTMLSummary : function() {
		var output = "<div class=\"team-popup-sidebar\">" + this.getIconHTML() + "Tributes: <ul><li>Glimmer</li><li>Glitter</li><li>Glamour</li></ul></div><div class=\"team-popup-content\"><h1 class=\"team_title\">" + this.get("name") + "</h1><h2 class=\"team-district\">District 1 - Luxury</h2><h2 class=\"team-status\">Status:  DEAD</h2>" + 
		"<p class=\"team_bio\">" + this.get("bio") + "</p><p class=\"team-contact-info\">Contact: 123-456-7889</p></div>";
		return output;
	},

	getIconHTML : function() {
		var stat = "<div class=\"team_div\" id=\"" + this.get("id") +"\">" +
		"<img src=\"images/team_icons/" + this.get("icon") + "\" class=\"team_img team-popup-img\">";
		if (this.get("id") in session.get("teamStats") && session.get("teamStats")[this.get("id")]["status"] === teamStatus.DEAD) {
			stat = stat + "<div class=\"status\">DEAD</div>";
		}
		stat = stat + "</div>";
		return stat;
	},

	die : function() {
		if (session.get("teamStats")[this.get("id")]["status"] === teamStatus.DEAD) {
			return; // already dead?!
		}
		
		playSound('cannon.wav', 3000);

		// show video
		this.showVideo();
	
		// update object
		var stats = $.extend({},session.get("teamStats"));
		stats[this.get("id")] = {"status" : teamStatus.DEAD};
		session.set("teamStats",stats);
	},


	showVideo : function() {
		showPopup("<iframe width=\"560\" height=\"315\" src=\"" + this.get("video") + "\" frameborder=\"0\"></iframe>");
	}
});
