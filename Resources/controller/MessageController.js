var MessageController = {
	enqueue: function(puzzle) {
		if (puzzle in messages) {
			var queue = session.get("messageQueue");
			var latest = 0;
			$.each(queue, function(index, message) {
				if (message["time"] > latest) latest = message["time"];
			});

			$.each(messages[puzzle], function(msgId, message) {
				message["time"] = latest + message["time"];
				queue.push(message);
			});

			session.set("messageQueue", queue);

			saveSession();
		}
	},

	notify: function(message) {
		// show toast notification
		toastr.info('A message has arrived from ' + message["sender"] + '!',"",
			{onclick: function(e) {
				$("#toc > .current").removeClass("current");
				$("#toc > #tab_history").addClass("current");

				$("#main_container > .active.tab").removeClass("active");
				$("#history.tab").addClass("active");

				toastr.clear($('.toast:contains("A message has arrived from")'));
			}
		});

		// todo(sana): play a sound
		playSound("pling.wav", 500);

		// increment activity tab counter
		var unreadCount = session.get("unreadCount")+1;
		$('#tab_history').html('<a href="#">Activity ('+unreadCount+")</a>");
		session.set("unreadCount", unreadCount);

		// add in activty tab
		var stats = $.extend(true, {}, session.get("messageStats"));
		stats[message["id"]] = {"status" : "unread"};
		session.set("messageStats", stats);

		switch( message["type"] ) {
			case "text" :
				logAction(logTypes.MESSAGE, "A message from " + message["sender"] + " - " + message["content"], message["id"]);
				break;
			case "video" :
				logAction(logTypes.MESSAGE, "A video message from " + message["sender"] + " - <div id=\"" + message["content"] + "\" class=\"vid_message clickable\">Click to view message.</div>", message["id"]);
				alert(message["content"])
				break;
			default:
				console.log("Encountered a message of unknown type \"" + message["type"] + "\"");
		}
	
 		// Save session
		saveSession();
	},

	checkQueue: function() {
		if (typeof session.get("lastSolved") === "undefined") return;
	
		var lastSolveTime = session.get("puzzleStats")[session.get("lastSolved")]["end_time"];
		var time_multiplyer = 1;
		if (debugActive())
			time_multiplyer = parameters["debug_parameters"]["time_multiplyer"];
		var elapsedMin = time_multiplyer*(getCurrentDateTime() - lastSolveTime)/60000;
		
		var queue = session.get("messageQueue");
		var toRemove = [];
		$.each(queue, function(index, message) {
			if (message["time"] <= elapsedMin) {
				MessageController.notify(message);
				toRemove.push(index);
			} 
		});
	
		var offset = 0;
		$.each(toRemove, function(index, i) {
			queue.splice(i-offset, 1);
			offset += 1;
		});

		session.set("messageQueue", queue);

		saveSession();
	}
}