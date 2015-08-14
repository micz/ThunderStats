"use strict";
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsTab.promises={};

miczThunderStatsTab.promises.customqry = {
	
	_current_analyzer:null,
	
	setAnalyzer:function(){
		this._current_analyzer=new Promise(
			function(resolve, reject) {
				//TO DO
			});
		this._current_analyzer.then(
			function(val){
				
			})
		.catch(
			function(reason) {
				miczLogger.log('Handle rejected promise ('+reason+') here.');
			});

	},

};
