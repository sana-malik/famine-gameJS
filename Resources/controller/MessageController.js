var MessageController = {
	startTimers: function(puzzle, accelerate, offset) {
		var latest_time = 0;

		if (puzzle in messages) {
			accelerate = typeof accelerate !== 'undefined' ? accelerate : false;
			offset = typeof offset !== 'undefined' ? offset : 0;

			var time_multiplyer = 60000;

			if( accelerate )
				time_multiplyer = 1000;

			if ( debugActive() )
				time_multiplyer /= parameters["debug_parameters"]["time_multiplyer"];

			$.each(messages[puzzle], function(msgId, message) {
				setTimeout(function() {MessageController.notify(message);}, (message["time"]+offset)*time_multiplyer);

				if ( message["time"] > latest_time)
					latest_time = message["time"];
			});
		}

		return latest_time;
	},

	notify: function(message) {
		// show toast notification
		toastr.info('A message has arrived from ' + message["sender"] + '!');

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

		logAction(logTypes.MESSAGE, "A message from " + message["sender"] + " - " + message["content"], message["id"]);
	
 		// Save session
		saveSession();
	}
}