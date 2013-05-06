var Team = Backbone.Model.extend({

	// the following two functions *should* be taken care of in TeamViews.js but too lazy right now...
	getHTMLSummary : function() {
		var output = this.getIconHTML() + "<span class=\"team_title\">" + this.get("name") + "</span>" + 
		"<span class=\"team_bio\">" + this.get("bio") + "</span>";
		return output;
	},

	getIconHTML : function() {
		var stat = "<div class=\"team_div\" id=\"" + this.get("id") +"\">" +
		"<img src=\"images/team_icons/" + this.get("icon") + "\" class=\"team_img\">";
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
		
		playSound('cannon.wav');

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