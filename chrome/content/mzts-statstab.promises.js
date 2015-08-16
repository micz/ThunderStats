"use strict";

Components.utils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
Components.utils.import("chrome://thunderstats/content/mzts-utils.jsm");
Components.utils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsTab.promises={};

miczThunderStatsTab.promises.customqry = {

	_analyzers:{},
	_analyzer_data:{},

	setAnalyzer:function(type,data){	//type: 1 sent, 0 received
		this._analyzers[type]=new Promise(
			function(resolve, reject){
				dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.setAnalyzer: type: '+type+'\r\n');
				this._analyzer_data[type]={};
				this._analyzer_data[type]['max']=0;
				this._analyzer_data[type]['min']=0;
				this._analyzer_data[type]['avg']=0;
				// data structure, from mzts-statstab.ui.js
				// {day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:this.data[1]["Num"]}
				// do aggregate functions (max, min, avg)
				for (let ai in data){
					this._analyzer_data[type]['max']=data[ai]['num']>this._analyzer_data[type]['max']?data[ai]['num']:this._analyzer_data[type]['max'];
					this._analyzer_data[type]['min']=data[ai]['num']<this._analyzer_data[type]['min']?data[ai]['num']:this._analyzer_data[type]['min'];
					this._analyzer_data[type]['avg']+=data[ai]['num'];
				}
				this._analyzer_data[type]['avg']=this._analyzer_data[type]['avg']/data.length;
				resolve(type);
			});
		},

	resetAnalyzers:function(){
		this._analyzers={};
		this._analyzer_data={};
	},

	doAnalyzer:function(type){
		this._analyzers[type].then(
			function(val){
				dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.doAnalyzer: type: '+type+'\r\n');
				switch(val){
					case 1: //sent
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_max_sent_wait");
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_min_sent_wait");
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_avg_sent_wait");
						if(!miczThunderStatsPrefs.getBoolPref_TS('aggregate_average_not_rounded')) avgNum=Math.round(avgNum);
						$jQ("#customqry_aggregate_max_sent").text(maxNum);
						$jQ("#customqry_aggregate_min_sent").text(minNum);
						$jQ("#customqry_aggregate_avg_sent").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
						break;
					case 0: //received
						break;
				}
			})
		.catch(
			function(reason){
				miczLogger.log('[miczThunderStatsTab.promises.customqry] Handle rejected promise ('+reason+') here.');
			});

	},

};
