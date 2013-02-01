var PuzzleTimer = function( puzzleIn, intervalIn ){

	var puzzleId = puzzleIn;	
	var interval = 60000;   // every minute

	if (arguments.length == 2) { 
			interval = intervalIn; 
	}


	var increment = function() {
		session.puzzleStats[puzzleId]["min_elapsed"] += 1;
		alert( "Something happening");
		// Now check for status changes
	}	

	var timerId = setInterval(increment, interval);  // returns timer id	
}

