var PuzzleTimer = function( puzzleIn, intervalIn ){

	var puzzleId = puzzleIn;	
	var interval = 60000; 

	if (arguments.length == 2) { 
			interval = intervalIn; 
	}


	var increment = function() {
		session.puzzleStats[puzzleId]["min_elapsed"] += 1;
		alert( "it's been a minute!");
		// Now check for status changes
	}	

	return setInterval(increment, interval);  // returns timer id	
}

