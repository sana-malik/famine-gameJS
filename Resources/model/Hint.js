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
	
	var rise = end_time - start_time;
	var run = end_cost - start_cost;
	
	var slope = rise/run;
	
	return Math.max( end_cost, start_cost + slope * (mins - start_time) );
}