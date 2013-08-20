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
	if (pname == "") pname = "All Puzzles";
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
	$("#start_input").focus();
}

function hideAlert() {
	$("#alert_content > .content").empty();
	$("#alert_container").hide();
	$("#start_input").focus();
}

function nameToId(str) {
	return str.replace(/ /g,'_');
}

function formatTime(seconds, clock) {
	if (arguments.length == 0) { 
			clock = false; 
	}

	var hours = Math.floor(seconds / 3600); 
	var mins = Math.floor((seconds%3600) / 60);
	var secs = Math.round(seconds % 60);
	var out = (hours<10?"0":"") + hours+":"+(mins<10?"0":"")+mins+":"+(secs<10?"0":"")+secs;

	if (!clock) {
		out = ""
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

		var hints = puzzles[puzzleId].get("hints");

		// go through hints & check for status changes
		$.each(hints, function(name, hint) {
			var remaining = stats[puzzleId]["hintStats"][name]["remaining"];
			var timediff = 1;
			if ( debugActive() )
				timediff *= parameters["debug_parameters"]["time_multiplyer"];

			if (stats[puzzleId]["hintStats"][name]["status"] === hintStatus.LOCKED) {
				stats[puzzleId]["hintStats"][name]["remaining"] -= timediff;
				if (remaining <= 0) {
					// only notify if active, not archived
					if (stats[puzzleId]["status"] === puzzleStatus.ACTIVE) {
						playSound("notify.wav", 500);
						toastr.info("New hint available for " + puzzles[puzzleId].get("name") + "!");
					}
					stats[puzzleId]["hintStats"][name]["status"] = hintStatus.AVAILABLE;
					stats[puzzleId]["hintStats"][name]["remaining"] = hint.get("end_time")*60;
					changed = true;
				}
			}
			else if (stats[puzzleId]["hintStats"][name]["status"] === hintStatus.AVAILABLE) {
				stats[puzzleId]["hintStats"][name]["remaining"] -= timediff;
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
	var date = new Date().valueOf();

	if ( debugActive() )
		date += parameters.time_diff;

	date = new Date(date);
	
	return date;
}

function getCurrentDateTimeString(format) {
	format = typeof format !== 'undefined' ? format : timeFormat.TWELVE;

	var currentTime = getCurrentDateTime();
	var year = currentTime.getFullYear();
	var day = currentTime.getDate();
	var month = currentTime.getMonth() + 1;
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	
	if ( format == timeFormat.TWENTYFOUR )
		if (hours < 10){
			hours = "0" + hours
		}

	if (minutes < 10){
		minutes = "0" + minutes
	}
	
	var out = month + "/" + day + "/" + year + " " + hours + ":" + minutes;
	
	if(format == timeFormat.TWELVE) {
		if(hours > 11)
			out += "pm";
		else 
			out += "am";
	}
		
	
	return out;
}

function saveServerSession(mySession, myTeam) {
	var d=new Date();
	var n=d.getTime();
	session.lastAttempt=d.getTime();
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
		// nothing for now
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

function saveLocalSession() {
	try {
		var document = Ti.Filesystem.getFileStream(Ti.Filesystem.getApplicationDirectory(), data_dir+'session.json');  //This saves in the distribution version!

		if (document.open(Ti.Filesystem.MODE_WRITE)) {
			document.write(Ti.JSON.stringify(session));
			document.close();
		}
	} catch(err) {
  		alert("Error description: " + err.message + "\n\n");
 	}
}

function saveSession() {
	if (!debugActive("ephemeral_session")) {
		// If verbose, save to server.  
		if( debugActive("verbose_server"))
			try { saveServerSession(session, tid); } catch (err) {}
	
		saveLocalSession();
	}	
}

function playSound(soundfile, duration) {
	var sound = Ti.Media.createSound("sounds/" + soundfile)
	sound.play();
	setTimeout(function(){sound.stop()}, duration);
}


function logAction(type, msg, msgId) {
	var temp = session.get("history").slice();
	if (type == logTypes.MESSAGE) {
		temp.push([getCurrentDateTimeString(), type, msg, msgId]);
	}
	else {
		temp.push([getCurrentDateTimeString(), type, msg]);
	}
	session.set("history",temp);
}

function debugActive(flag) {
	return parameters["debug_parameters"]["debug"] && (arguments.length == 0 || parameters["debug_parameters"][flag]); 
}
