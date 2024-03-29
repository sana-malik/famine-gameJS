var Debug = {
	saveSession: function() {
		var document = Ti.Filesystem.getFileStream(Ti.Filesystem.getApplicationDirectory(),data_dir+'session.json');
		if (document.open(Ti.Filesystem.MODE_WRITE)) {
			document.write(Ti.JSON.stringify(session));
			document.close();
		}
	},

	clearSession: function() {
		var document = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),data_dir+'session.json');
		if (document.exists()) {
			document.deleteFile();
		}

	},

	toggleDebugTiming: function() {
		if (timeInterval != 1000)
			timeInterval = 1000;
		else 
			timeInterval = 50;

		$.each(session.puzzleStats, function(name, puzzle) {
			clearInterval( puzzle["timerId"] )
			puzzle["timerId"] = setInterval( function(){ puzzle["sec_elapsed"]++}, timeInterval);
		});
	

		// reload puzzle page
		if ( currentScreen == screenTypes.PUZZLE )
			showPuzzleScreen( puzzles[$(".puzzle_title").text()] );
	}
}