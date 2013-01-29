function Session(sessionObj) {
	this.fans = sessionObj.fans;
	this.locationStats = sessionObj.locationStats;
	this.puzzleStats = sessionObj.puzzleStats;
	this.teamStats = sessionObj.teamStats;
	this.resourceStats = sessionObj.resourceStats;
}

function Session() {
	this.fans = 0;	
	this.locationStats = {locOrder[0] : locationStatus.VISITED};
	this.puzzleStats = {};
	this.teamStats = {};
	this.resourceStats = {};
}


