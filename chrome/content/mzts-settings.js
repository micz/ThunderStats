"use strict";
var miczThunderStatsPrefPanel = {

	onLoad: function(){
		//Fixing window height
		sizeToContent();
		var vbox = document.getElementById('ts_tabbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},
};
