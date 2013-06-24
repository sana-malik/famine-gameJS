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
	return str.replace(/[\s+!.@#,$%^&*()']/g, '').toLowerCase();
}

function puzzlesWithStartCode(start) {
	var count = 0;
	$.each(puzzles, function(name, puz) {
		if (puz.get("start_code") === start) {
			count++;
		}
	})

	return count;
}

function getAnswerToPuzzle(name) {
	var finalAnswer = "";
	$.each(puzzles[name].get("answers"), function(answer, ansObj) {
		if (ansObj["type"] === answerTypes.FINAL) {
			finalAnswer = answer;
			return false;
		}
	});

	return finalAnswer;
}

function getMetaName(start) {
	var pname = "";
	$.each(puzzles, function(name, puz) {
		if (puz.get("start_code") === start && puz.get("meta")) {
			pname = name;
			return false;
		}
	})

	return pname;

}

function showPopup(content) {
	$("#popup_container").show();
	$("#popup_content > .content").append(content);
	$("#close_popup").click(hidePopup);
}

function showAlert(content) {
	$("#alert_container").show();
	$("#alert_content > .content").append(content);
	$("#close_alert").click(hideAlert);
}

function hidePopup() {
	$("#popup_content > .content").empty();
	$("#popup_container").hide();
}

function hideAlert() {
	$("#alert_content > .content").empty();
	$("#alert_container").hide();
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
		var changed = false
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
					changed = true;
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

function saveServerSession(mySession, myTeam) {
	var d=new Date();
	var n=d.getTime();
	request = $.ajax({
	        url: "http://www.rawbw.com/~zero/hg/save.php",
	        type: "post",
	        data: "session="+Base64.encode(Ti.JSON.stringify(mySession))+"&team="+myTeam+"&time="+n
	});
	request.done(function (response, textStatus, jqXHR){
		var d=new Date();
		session.lastSuccess=d.getTime();
		// uncomment the following line if you want proof you're getting a response
		// alert(response);
	});
	request.fail(function (jqXHR, textStatus, errorThrown){
		// fail silently
	});
	request.always(function () {
		var d=new Date();
		session.lastAttempt=d.getTime();
	});
}

function loadServerSession(myTeam) {
	request = $.ajax({
		url: "http://www.rawbw.com/~zero/hg/load.php",
		type: "post",
		data: "team="+myTeam
	});
	request.done(function (response, textStatus, jqXHR){
		respStrings = response.split("|");	
                session2=$.parseJSON(Base64.decode(respStrings[1].replace(/ /g,'+')));
	        for(var key in session2){
			session.set(key,session2[key]);
	        };
	});
	request.always(function () {
		var d=new Date();
		session.lastRestore=d.getTime();
	});
}

function playSound(soundfile) {
	var sound = Ti.Media.createSound("sounds/" + soundfile)
	sound.play();
	setTimeout(function(){sound.stop()}, 3000);
}


function logAction(type, msg) {
	var temp = session.get("history").slice();
	temp.push([getCurrentDateTime(), type, msg]);
	session.set("history",temp);
}