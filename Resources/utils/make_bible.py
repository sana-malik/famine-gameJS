import json
import codecs

locations_file = codecs.open("../data/locations.json", 'r', 'utf-8')
puzzles_file = codecs.open("../data/puzzles.json", 'r', 'utf-8')
solutions_file = codecs.open("../data/puzzle_solutions.json", 'r', 'utf-8')

bible = codecs.open("Puzzle Bible.txt", 'w', 'utf-8')

locations = json.load(locations_file)
puzzles = json.load(puzzles_file)
solutions = json.load(solutions_file)


location_keys = locations["order"]
locations = locations["locations"]

def writeln(line, level=0):
	for x in range(0,level):
		bible.write("\t")
	bible.write( line + "\n")

def write(line):
	bible.write( line )

def printLocation(location):
	writeln( location["name"] )
	writeln( "Address: " + location["address"] )
	writeln( "Time Open: " + location["time_open"] )
	writeln( "Time Closed: " + location["time_closed"] )
	writeln("")

	writeln( "General Flavor Text: \n\t" + location["flavor_text"] )
	if location["self_flavor_text"] != "":
		writeln( "Flavor text for the team that dies here: \n\t" + location["self_flavor_text"] )
	writeln("")

	writeln( "Parking Available: " + location["parking_status"] )
	if location["parking_description"] != "":
		writeln( "Parking Notes: " + location["parking_description"] )
	writeln("")

	writeln( "Restroom Available: " + location["restroom_status"] )
	if location["restroom_description"] != "":
		writeln( "Restroom Notes: " + location["restroom_description"] )
	writeln("")

	writeln( "Food Availabe: " + location["food_status"] )
	if location["food_description"] != "":
		writeln( "Food Notes: " + location["food_description"] )
	writeln("")
	
	writeln( "Wifi Available: " + location["wifi_status"] )
	if location["wifi_description"] != "":
		writeln( "Wifi Notes: " + location["wifi_description"] )
	writeln("")
	
	#writeln( "" + location["image_file"] )
	#writeln( "" + location["map_file"] )
	writeln( "Location Notes: " + location["notes"] )
	writeln("")

	writeln("Puzzles: ")
	local_puzzles = location["puzzles"]
	for puzzle in local_puzzles:
		printPuzzle( puzzles[puzzle], 1)

	writeln("")
	writeln("")


def printPuzzle(puzzle, level):
	writeln( "Name: " + puzzle["name"], level )
	writeln( "Start Code: " + puzzle["start_code"], level+1 )
	writeln( "Fan Worth: " + str(puzzle["max_fans"]), level+1 )
	writeln( "General Flavor Text: ", level+1)
	writeln( puzzle["flavor_text"], level+2 )
	if puzzle["self_flavor_text"] != "":
		writeln( "Flavor text for the team that dies here:", level+1)
		writeln( puzzle["self_flavor_text"], level+2 )
	writeln( "General Solve Text: ", level+1)
	writeln( puzzle["solve_text"], level+2 )

	if puzzle["self_solve_text"] != "":
		writeln("Solve Text for team that dies here:", level+1)
		writeln( puzzle["self_solve_text"], level+2 )

	if len(puzzle["resources_unlocked"]) > 0:
		writeln("Resources Unlocked By This Puzzle:", level+1)
	for resource in puzzle["resources_unlocked"]:
		writeln( resource, level+2 )
	
	if len(puzzle["teams_killed"]) > 0:
		writeln("Teams Killed By This Puzzle:", level+1)
		
	for team in puzzle["teams_killed"]: 
		writeln( team, level+2 )
	
	writeln( "Meta: " + str(puzzle["meta"]), level+1 )
	writeln( "Advance Location: " + str(puzzle["advance_location"]), level+1 )
	writeln("")
	
	hints = puzzle["hints"]
	writeln("Hints", level+1)
	for hint in hints:
		printHint(hint, hints[hint], level + 2)

	writeln("Answers", level+1)
	for answer in puzzle["answers"]:
		printAnswer(puzzle["answers"][answer], level + 2)

	writeln("How To Solve The Puzzle", level+1)
	tabs = ""
	for x in range(0, level+2):
		tabs = tabs + "\t"

	writeln(solutions[puzzle["name"]]["solution"].replace("\n", "\n" + tabs), level+2)
	writeln("")

	if solutions[puzzle["name"]]["notes"] != "":
		writeln("Volunteer Notes", level+1)
		writeln(solutions[puzzle["name"]]["notes"].replace("\n", "\n" + tabs), level+2)
		writeln("")

def printHint(name, hint, level):
	writeln( name, level )
	writeln( "Hint text: ", level + 1)
	writeln( hint["text"], level + 2)
	
	writeln( "Hint available after: " + str(hint["start_time"]) + " minutes", level + 1 )
	writeln( "Hint cost: " + str(hint["start_cost"]) + " fans.", level + 1 )
	writeln( "Hint free after: " + str(hint["end_time"]) + " minutes", level + 1 )
	writeln("")

def printAnswer(answer, level):
	writeln("Answer: " + answer["text"], level)
	writeln("Type: " + answer["type"], level + 1)
	writeln("Response: ", level + 1) 
	writeln(answer["response"], level + 2)
	if "self_response" in answer and answer["self_response"] != "":
		writeln("Response for the team that dies here:", level + 1)
		writeln(answer["self_response"], level + 2 )

	if len(answer["skipped_hints"]) > 0:
		writeln("Hints skipped by this answer:", level+1)
		for hint in answer["skipped_hints"]:
			writeln(hint, level + 2 )
	writeln("")

def writeLocationOrder():
	cnt = 0
	for key in location_keys:
		writeln ( str(cnt) + " : " + key)
		cnt = cnt + 1



for location in location_keys:
	printLocation( locations[location] )
	writeln("")


writeln("Index")
writeln("Location Numbers")
writeln("These numbers are to be used to manually change a teams location in the app.  Simply go to the \"currentLocation\" parameter in the session.json and change it to the appropriate number.")
writeLocationOrder()

locations_file.close()
puzzles_file.close()
solutions_file.close()
bible.close()
