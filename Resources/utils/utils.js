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

function formatTime(seconds) {
	var mins = Math.floor(seconds / 60);
	var secs = seconds % 60;
	var out = "";
	
	if (mins > 0) {
		out = mins + " minute";
		if (mins > 1)
			out += "s";
	}
	else {
		out = secs + " second";
		if (secs > 1)
			out += "s";
	}
	return out;
}

function PuzzleTimer(puzzleId, interval){	
	if (arguments.length == 1) { 
			interval = timeInterval; 
	}

	var increment = function() {
		var stats = $.extend(true,{},session.get("puzzleStats"));

		var current_time = Math.round((new Date()).getTime()/1000);
		var hints = puzzles[puzzleId].get("hints");

		// go through hints & check for status changes
		$.each(hints, function(name, hint) {
			var remaining = stats[puzzleId]["hintStats"][name]["remaining"];
			if (stats[puzzleId]["hintStats"][name]["status"] === hintStatus.LOCKED) {
				stats[puzzleId]["hintStats"][name]["remaining"] -= 1;
				if (remaining <= 0) {
					stats[puzzleId]["hintStats"][name]["status"] = hintStatus.AVAILABLE;
					stats[puzzleId]["hintStats"][name]["remaining"] = hint.get("end_time")*60;
				}
			}
			else if (stats[puzzleId]["hintStats"][name]["status"] === hintStatus.AVAILABLE) {
				stats[puzzleId]["hintStats"][name]["remaining"] -= 1;
			}
			else {
				return; // no need to display any timer/change any status
			}
		});

		session.set("puzzleStats", stats);
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
