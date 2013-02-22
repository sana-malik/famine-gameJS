var Hint = Backbone.Model.extend({

	
	/** Function: getCost
	* Input: mins - minutes since start of puzzle
	* Output: current cost of hint
	**/
	getCost : function(mins) {
		var rise = this.get("end_time") - this.get("start_time");
		var run = this.get("end_cost") - this.get("start_cost");
		
		var slope = rise/run;
		var cost = Math.round(this.get("start_cost") + slope * (mins - this.get("start_time")));
	
		return Math.max( this.get("end_cost"), cost );
	}
});