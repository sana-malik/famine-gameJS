function Team(teamObj) {
		this.id = teamObj.id;
		this.name = teamObj.name;
		this.bio = teamObj.bio;
		this.mentor = teamObj.mentor;
		this.icon = teamObj.icon;
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
	var stat = "<div class=\"team_div\" id=\"" + this.id +"\">" +
				"<img src=\"" + this.icon + "\" class=\"team_img\">";
	if (this.status == teamStatus.dead) {
		stat = stat + "<div class=\"status\">DEAD</div>";
	}
	stat = stat + "</div>";
	return stat;
}

Team.prototype.kill = function() {
	// mark dead visually
	$(".team_div#" + this.id).append("<div class=\"status\">DEAD</div>");

	// update object
	this.status = teamStatus.dead;
}