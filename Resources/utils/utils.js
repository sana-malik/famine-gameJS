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

function PuzzleTimer(puzzleIn, intervalIn){

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
