function Team(teamObj) {
		this.id = teamObj.id;
		this.name = teamObj.name;
		this.bio = teamObj.bio;
		this.mentor = teamObj.mentor;
		this.icon = teamObj.icon;
		this.talents = teamObj.talents;
		this.video = teamObj.video;
}

Team.prototype.getActiveTeamHTML = function() {
	var output = this.getIconHTML() + "<span class=\"team_title\">" + this.name + "</span>" + 
		"<span class=\"team_bio\">" + this.bio + "</span>" + 
		"<span class=\"fan_count\">Fans: " + session.fans + "</span>";
	return output;
}

Team.prototype.getHTMLSummary = function() {
	var output = this.getIconHTML() + "<span class=\"team_title\">" + this.name + "</span>" + 
		"<span class=\"team_bio\">" + this.bio + "</span>";
	return output;
}

Team.prototype.getIconHTML = function() {
	var stat = "<div class=\"team_div\" id=\"" + this.id +"\">" +
				"<img src=\"" + this.icon + "\" class=\"team_img\">";
	if (this.id in session.teamStats && session.teamStats[this.id]["status"] === teamStatus.DEAD) {
		stat = stat + "<div class=\"status\">DEAD</div>";
	}
	stat = stat + "</div>";
	return stat;
}

Team.prototype.die = function() {
	if (this.id in session.teamStats && session.teamStats[this.id]["status"] === teamStatus.DEAD) {
		return; // already dead?!
	}

	// mark dead visually
	$(".team_div#" + this.id).append("<div class=\"status\">DEAD</div>");

	// show video
	this.showVideo();

	// update object
	session.teamStats[this.id] = {"status" : teamStatus.DEAD};
}


Team.prototype.showVideo = function() {
	showPopup("<iframe width=\"560\" height=\"315\" src=\"" + this.video + "\" frameborder=\"0\"></iframe>");
}
