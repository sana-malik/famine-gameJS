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
	$('#popup_body').removeClass('solve-popup');
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
		var stats = $.extend(true,{},session.get("puzzleStats"));

		var timediff = 1;
		if ( debugActive() )
			timediff *= parameters["debug_parameters"]["time_multiplyer"];
		var elapsed = timediff*(getCurrentDateTime() - stats[puzzleId]["start_time"])/1000;
		
		// update elapsed time in view
		$(".main.puzzle#" + nameToId(puzzleId) + " #elapsed_time").html(formatTime(elapsed, true));

		var hints = puzzles[puzzleId].get("hints");
		var changed = false;
		var newHintFree = false;
		// go through hints & check for status changes
		$.each(hints, function(name, hint) {
			if (stats[puzzleId]["hintStats"][name]["status"] === hintStatus.LOCKED) {
				var remaining = stats[puzzleId]["hintStats"][name]["start_time"] - elapsed/60;

				if (remaining <= 0) {
					stats[puzzleId]["hintStats"][name]["status"] = hintStatus.AVAILABLE;
					changed = true;
				}
			} else if (stats[puzzleId]["hintStats"][name]["status"] === hintStatus.AVAILABLE) {
				var remaining = stats[puzzleId]["hintStats"][name]["end_time"] - elapsed/60;

				if (remaining <= 0) { // hint is now free
					stats[puzzleId]["hintStats"][name]["status"] = hintStatus.FREE;
					changed = true;
					newHintFree = true;
				}
			}

			var cost = hint.getCost(elapsed/60, puzzleId, name);
			if (cost < 0) cost = 0;
			$(".main.puzzle#" + nameToId(puzzleId) + " .hints .hint#" + nameToId(name) + " .hint-cost").text("Cost: " + cost + " viewers");
		});
		if (changed) session.set("puzzleStats", stats);
		if (newHintFree && stats[puzzleId]["status"] === puzzleStatus.ACTIVE) {
			if ($('.toast-message:contains("' + puzzles[puzzleId].get("name") + '")').length === 0) { // if a notification isn't already shown for this puzzle
				playSound("pling.wav", 750);
				toastr.info("New hints available for " + puzzles[puzzleId].get("name") + "!","",
					{onclick: function(e) {
						$(".main.active").removeClass("active");
						$(".main#"+nameToId(puzzleId)).addClass("active");
						toastr.clear($('.toast:contains("' + puzzles[puzzleId].get("name") + '")'));
					}
				});
			}
		}
	}	

	return setInterval(increment, interval);  // returns timer id	
}

function rot13(s)
{
	return (s ? s : this).split('').map(function(_)
	{
		if (!_.match(/[A-za-z]/)) return _;
		c = Math.floor(_.charCodeAt(0) / 97);
		k = (_.toLowerCase().charCodeAt(0) - 83) % 26 || 26;
		return String.fromCharCode(k + ((c == 0) ? 64 : 96));
	}).join('');
}

function getCurrentDateTime() {
	var date = new Date().valueOf();

	if ( debugActive() ) {
		if (typeof session !== 'undefined') date += session.get("debug.timediff");
		else date += parameters.start_time - new Date();
	}

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

		if (day < 10){
			day = "0" + day
		}

		if (month < 10){
			month = "0" + month
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

function parseDateTimeString(str) { // in format year-month-dayThour:minute:secondsZ
	str = str.replace(/[TZ:-]/g," ")
	var date = str.split(" ");
	var year = date[0];
	var month = date[1] - 1; // because JS is weird and uses 0 - 11 for months not 1 - 12
	var day = date[2];
	var hour = date[3] - 4; // to account for EDT (GMT-4)
	var minutes = date[4];
	var seconds = date[5];

	return new Date(year, month, day, hour, minutes, seconds);

}

function saveServerSession(mySession, myTeam) {
	/*var d=new Date();
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
	});*/

	// do nothing in distributed version
}

function loadServerSession(myTeam) {
	/*request = $.ajax({
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
	});*/
	// do nothing
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
