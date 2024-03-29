var Hint = Backbone.Model.extend({

	
	/** Function: getCost
	* Input: mins - minutes since start of puzzle
	* Output: current cost of hint
	**/
	getCost : function(mins, puzzleId, hintId) {
		var run = this.get("end_time") - this.get("start_time");

		var rise = this.get("end_cost") - this.get("start_cost");
		
		var slope = rise/run;
		var cost = Math.round(this.get("start_cost") + slope * (mins - session.get("puzzleStats")[puzzleId]["hintStats"][hintId]["start_time"]));
	
		if (isNaN(cost))
			cost = 0;
		
		return Math.max( this.get("end_cost"), cost );
	}
});