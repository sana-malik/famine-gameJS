function jsonToString(filename) {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationDirectory(),filename);

	var json;
	if(file.exists()) {
		var document = file.open();
		json = "";
    	var line = document.readLine();
    	while (line != null) {
    		json += line;
    		line = document.readLine();
    	}
	}

	return json;
}

function clean(str) {
	return str.replace(/[\s+!.@#$%^&*()]/g, '');
}

function showPopup(content) {
	$("#popup_container").show();
	$("#popup_content > .content").append(content);
}

function hidePopup() {
	$("#popup_content > .content").empty();
	$("#popup_container").hide();
}