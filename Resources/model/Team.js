var Team = Backbone.Model.extend({

	// the following two functions *should* be taken care of in TeamViews.js but too lazy right now...
	getHTMLSummary : function() {
		var district = String(this.get("id")).substring(0, this.get("id").length-1)
		var dis_specialty = ""
		switch(district){
			case "1":
				dis_specialty = "Luxury";
				break;
			case "2":
				dis_specialty = "Masonry";
				break;
			case "3":
				dis_specialty = "Technology";
				break;
			case "4":
				dis_specialty = "Fishing";
				break;
			case "5":
				dis_specialty = "Power";
				break;
			case "6":
				dis_specialty = "Transportation";
				break;
			case "7":
				dis_specialty = "Lumber";
				break;
			case "8":
				dis_specialty = "Textiles";
				break;
			case "9":
				dis_specialty = "Grain";
				break;
			case "10":
				dis_specialty = "Livestock";
				break;
			case "11":
				dis_specialty = "Agriculture";
				break;
			case "12":
				dis_specialty = "Mining";
				break;
			default:
				dis_specialty = "Unrecognized";
		}

		var output = "<div class=\"team-popup-sidebar\">" + 
			this.getIconHTML() +
			"<h2 class=\"team-district\">District " + district + "<br />" + dis_specialty + "</h2>";
			
			var status;
			if(session.get("teamStats")[this.get("id")]["status"] == teamStatus.DEAD)
				status = "Dead";
			else
				status = "Alive";

			output = output + "<h2 class=\"team-status\">Status:  " + status + "</h2><h2 class=\"team-status\">(123) 456-7890</h2></div><div class=\"team-popup-content\"><h1 class=\"team_title\">" + 
			this.get("name") + 
			"</h1><p class=\"team_bio\">" + 
			this.get("bio") + 
			"</p><h3 class=\"team-popup-header\">Tributes:</h3><code><ul id=\"double\"><span class=\"code-comment\"></span>"
			
			var members = this.get("members")
			for( var index = 0; index < members.length; index++)
				output = output + "<li>" + members[index] + "</li>" 

			output = output + "</ul></code></div>";
			
		return output;
	},

	getIconHTML : function() {
		var stat = "<div id=\"" + this.get("id") +"\">" +
		"<img src=\"images/team_icons/med_" + this.get("icon") + "\" class=\"team_img team-popup-img\">";
		/*if (this.get("id") in session.get("teamStats") && session.get("teamStats")[this.get("id")]["status"] === teamStatus.DEAD) {
			stat = stat + "<div class=\"status\">DEAD</div>";
		}*/
		stat = stat + "</div>";
		return stat;
	},

	die : function(quiet) {
		if (session.get("teamStats")[this.get("id")]["status"] === teamStatus.DEAD) {
			return; // already dead?!
		}

		// default quiet to false
		quiet = typeof quiet !== 'undefined' ? quiet : false;
		
		logAction(logTypes.KILL, "<span id=\"" + this.get("id") + "\" class=\"vid_link clickable\">" + this.get("name") + "</span> has been killed!");

		if(!quiet) {
			playSound('cannon.wav', 3000);

			// show video
			this.showVideo();
		}
	
		// update object
		var stats = $.extend({},session.get("teamStats"));
		stats[this.get("id")] = {"status" : teamStatus.DEAD};
		session.set("teamStats",stats);
	},


	showVideo : function() {
		var movieFile = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),"Resources/movies/"+this.get("video")).nativePath();
		Ti.Platform.openApplication(movieFile);
	}
});
