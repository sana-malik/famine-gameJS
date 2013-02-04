function jsonToString(filename) {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),filename);

	var json = "";
	if(file.exists()) {
		var document = file.open();
    	var line = document.readLine();
    	while (line != null) {
    		json += line;
    		line = document.readLine();
    	}
	}

	return json;
}

function clean(str) {
	return str.replace(/[\s+!.@#$%^&*()]/g, '').toLowerCase();
}

function showPopup(content) {
	$("#popup_container").show();
	$("#popup_content > .content").append(content);
	$("#close_popup").click(hidePopup);

}

function hidePopup() {
	$("#popup_content > .content").empty();
	$("#popup_container").hide();
}

function nameToId(str) {
	return str.replace(/ /g,'_');
}

function PuzzleTimer(puzzleId, interval){	
	if (arguments.length == 1) { 
			interval = timeInterval; 
	}


	function formatTime(seconds) {
		var mins = Math.floor(seconds / 60);
		var secs = seconds % 60;
		var out = "";
		if (mins < 10) out += "0";
		out += mins + ":";
		if (secs < 10) out += "0";
		out += secs;
		return out;
	}

	var increment = function() {
		// update status
		session.puzzleStats[puzzleId]["sec_elapsed"] += 1;

		var current_time = Math.round((new Date()).getTime()/1000);
		var elapsed = (current_time-session.puzzleStats[puzzleId]["start_time"]) * 1000/timeInterval;
		var hints = puzzles[puzzleId]["hints"];

		// go through hints. update visually & check for status changes
		$.each(hints, function(name, hint) {
			var remaining;
			if (!(name in session.puzzleStats[puzzleId]["hintStats"])) {
				remaining = hint["start_time"]*60 - elapsed;
			}
			else if (session.puzzleStats[puzzleId]["hintStats"][name]["status"] == hintStatus.AVAILABLE) {
				remaining = hint["end_time"]*60 - elapsed;
			}
			else {
				return; // no need to display any timer/change any status
			}

			var hintDiv = $("#"+nameToId(puzzleId) + " > #" + nameToId(name) + " > .hint_text").empty();
			if (remaining === 0) { // change status
				if (!(name in session.puzzleStats[puzzleId]["hintStats"])) { // go to available
					session.puzzleStats[puzzleId]["hintStats"][name] = {"status" : hintStatus.AVAILABLE};
					remaining = hint["end_time"]*60 - elapsed;
				}
				else { // reveal the hint
					session.puzzleStats[puzzleId]["hintStats"][name]["status"] = hintStatus.REVEALED;
					// reveal the hint
					hintDiv.append(puzzles[puzzleId]["hints"][name].text);
					return;
				}
			}
			// update the hint visually
			if (!(name in session.puzzleStats[puzzleId]["hintStats"])) {
				hintDiv.append("available in ");	
			}
			else {
				hintDiv.append("get hint button -- min cost in ");
			}
			hintDiv.append(formatTime(remaining));
		});
	}	

	return setInterval(increment, interval);  // returns timer id	
}

function getCurrentDateTime() {
	var currentTime = new Date();
	var year = currentTime.getFullYear();
	var day = currentTime.getDate();
	var month = currentTime.getMonth() + 1;
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	
	if (minutes < 10){
		minutes = "0" + minutes
	}
	
	var out = month + "/" + day + "/" + year + "  " + hours + ":" + minutes;
	if(hours > 11){
		out += "pm";
	} else {
		out += "am";
	}
	
	return out;
}
