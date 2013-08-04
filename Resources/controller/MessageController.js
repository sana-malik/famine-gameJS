var MessageController = {
	startTimers: function(puzzle) {
		if (puzzle in messages) {
			$.each(messages[puzzle], function(msgId, message) {
				setTimeout(function() {MessageController.notify(message);}, message["time"]*1000);
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
		if (!debugActive("ephemeral_session")) {
			// If verbose, save whenever an answer is entered.  This updates logs, partial answers, and final answers.
			if( debugActive("verbose_server"))
				try { saveServerSession(session, tid); } catch (err) {}
		
			saveLocalSession();
		}	
	}
}