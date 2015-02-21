"use strict";

let EXPORTED_SYMBOLS = ["miczThunderStatsUtils"];

var miczThunderStatsUtils = {

	escapeHTML: function(s){
		return s.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
	},
};
