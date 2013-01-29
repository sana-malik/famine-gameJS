function Answer(answerObj) {
	this.type = answerObj.type;
	this.text = answerObj.text;
	this.response = answerObj.response;
	
	this.skipped_hints = answerObj.skipped_hints;
}