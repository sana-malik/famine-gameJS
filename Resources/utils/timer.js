var PuzzleTimer = function( puzzleIn, intervalIn ){

	var puzzleId = puzzleIn;	
	var interval = 1000; // every second

	if (arguments.length == 2) { 
			interval = intervalIn; 
	}


	var increment = function() {
		session.puzzleStats[puzzleId]["sec_elapsed"] += 1;
		// Now check for status changes
	}	

	return setInterval(increment, interval);  // returns timer id	
}

