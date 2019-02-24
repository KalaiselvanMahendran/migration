module.exports = {
	getString: function() {
	  	var text = "";
	  	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	  	for (var i = 0; i < 10; i++) {
	    	text += possible.charAt(Math.floor(Math.random() * possible.length));
	  	}
	  	return text;
	},
	getInt: function() {
		return Math.floor((Math.random()*10) + 1); 
	},
	getDescription: function() {
	  	var text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry";
	  	return text;
	},
	getDate: function() {
	  	// var text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry";
	  	return new Date();
	},
}