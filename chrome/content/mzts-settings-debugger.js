"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");

var miczThunderStatsDebugger = {

	onLoad: function(){
		//Fixing window height
		this.fixWinHeight();
	},

	fixWinHeight:function(){
		sizeToContent();
		var vbox = document.getElementById('ts_vbox');
		vbox.height = vbox.boxObject.height;
		sizeToContent();
	},

};

