var MessageController = {
	startTimers: function(puzzle) {
		if (puzzle in messages) {
			var time_multiplyer = 60000;
			if ( debugActive() )
				time_multiplyer /= parameters["debug_parameters"]["time_multiplyer"];

			$.each(messages[puzzle], function(msgId, message) {
				setTimeout(function() {MessageController.notify(message);}, message["time"]*time_multiplyer);
			});
		}
	},

	notify: function(message) {
		// show toast notification
		toastr.info('A message has arrived from ' + message["sender"] + '!');

		// todo(sana): play a sound

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