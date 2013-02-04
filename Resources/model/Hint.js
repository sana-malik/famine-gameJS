function Hint(hintObj) {
	this.name = hintObj.name;
	this.text = hintObj.text;
	
	this.start_time = hintObj.start_time;
	this.start_cost = hintObj.start_cost;
	
	this.end_time = hintObj.end_time;
	this.end_cost = hintObj.end_cost;
}

// Input is minutes past the start of puzzle
Hint.prototype.getCost = function(mins) {
	
	var rise = this.end_time - this.start_time;
	var run = this.end_cost - this.start_cost;
	
	var slope = rise/run;
	var cost = Math.round(this.start_cost + slope * (mins - this.start_time));
	
	return Math.max( this.end_cost, cost );
}