function Team(teamObj) {
		this.id = teamObj.id;
		this.name = teamObj.name;
		this.bio = teamObj.bio;
		this.mentor = teamObj.mentor;
		this.icon = teamObj.icon;
		this.status = teamObj.status;
		this.talents = teamObj.talents;
		this.password = teamObj.password;
		this.video = teamObj.video;
	}

Team.prototype.getHTMLSummary = function() {
	var output = this.getIconHTML() + "<span class=\"team_title\">" + this.name + "</span>" + 
		"<span class=\"team_bio\">" + this.bio + "</span>";
	return output;
}

Team.prototype.getIconHTML = function() {
	return "<div class=\"team_div\" id=\"" + this.id +"\">" +
				"<img src=\"" + this.icon + "\" class=\"team_img\">" +
				"<div class=\"status "+this.status+"\">X</div>" +
			"</div>";
}

Team.prototype.kill = function() {
	// mark dead visually
	$(".team_div#" + this.id + " > .status").addClass("dead");
	$(".team_div#" + this.id + " > .status").removeClass("alive");

	// update object
	this.status = "dead";
}