famine-gameJS
=============

JS version of the famine game app!


=============

Notes on running the app:
In Resources/data, there are puzzle, resource, location, and team data files.
The only other file the app needs to run is session.json. If this is not present, 
the app will run a fresh version of the app. If you'd like to simulate a mid-game
session, then there are some sample files in sample-sessions. If you would like to
save the session you are in, you can go to Debug > Save session to create a new
session file. It will be create in the directory the app is running out of, so you
might have to hunt around.

Note: If you are using TideSDK, sometimes the app caches the session file. To remove this
and run a fresh (no session file) version of the game, go to Debug > Clear session. 