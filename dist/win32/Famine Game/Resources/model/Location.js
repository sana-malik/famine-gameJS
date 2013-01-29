
function Location(locationObj) {
	this.name = locationObj.name;
	this.puzzles = locationObj.puzzles;
	this.address = locationObj.address;
	
	this.notes = locationObj.notes;
	this.restroom_description = locationObj.restroom_description;
	this.food_description = locationObj.food_description;
	
	this.image_file = locationObj.image_file;
	this.map_file = locationObj.map_file;
	
	this.time_open = locationObj.time_open;
	this.time_closed = locationObj.time_closed;
}
