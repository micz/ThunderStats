"use strict";

ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsTab.promises={};

miczThunderStatsTab.promises.customqry = {

	_analyzers:{},

	setAnalyzer:function(type,data){	//type: 1 sent, 0 received
		this._analyzers[type]=new Promise(
			function(resolve, reject){
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.setAnalyzer: type: '+type+'\r\n');
				miczThunderStatsUtils._customqry_analyzer_data[type]={};
				miczThunderStatsUtils._customqry_analyzer_data[type]['max']=0;
				miczThunderStatsUtils._customqry_analyzer_data[type]['min']=data[0]['num'];
				miczThunderStatsUtils._customqry_analyzer_data[type]['avg']=0;
				// data structure, from mzts-statstab.ui.js
				// {day:m.unix(),day_str:miczThunderStatsUtils.getDateStringYY(m,true),num:this.data[1]["Num"]}
				// do aggregate functions (max, min, avg)
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.setAnalyzer: data: '+JSON.stringify(data)+'\r\n');
				for (let ai in data){
					//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.setAnalyzer: miczThunderStatsUtils._customqry_analyzer_data[type]: '+JSON.stringify(miczThunderStatsUtils._customqry_analyzer_data[type])+'\r\n');
					miczThunderStatsUtils._customqry_analyzer_data[type]['max']=data[ai]['num']>miczThunderStatsUtils._customqry_analyzer_data[type]['max']?data[ai]['num']:miczThunderStatsUtils._customqry_analyzer_data[type]['max'];
					miczThunderStatsUtils._customqry_analyzer_data[type]['min']=data[ai]['num']<=miczThunderStatsUtils._customqry_analyzer_data[type]['min']?data[ai]['num']:miczThunderStatsUtils._customqry_analyzer_data[type]['min'];
					miczThunderStatsUtils._customqry_analyzer_data[type]['avg']+=data[ai]['num'];
				}
				miczThunderStatsUtils._customqry_analyzer_data[type]['avg']=miczThunderStatsUtils._customqry_analyzer_data[type]['avg']/data.length;
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.setAnalyzer: avg: '+JSON.stringify(miczThunderStatsUtils._customqry_analyzer_data[type]['avg'])+'\r\n');
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.setAnalyzer: min: '+JSON.stringify(miczThunderStatsUtils._customqry_analyzer_data[type]['min'])+'\r\n');
				resolve(type);
			});
		this._analyzers[type].then(
			function(val){
				//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] promises.customqry.doAnalyzer: type: '+type+'\r\n');
				let avgNum=miczThunderStatsUtils._customqry_analyzer_data[type]['avg'];
				switch(val){
					case 1: //sent
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_max_sent_wait");
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_min_sent_wait");
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_avg_sent_wait");
						if(!miczThunderStatsPrefs.getBoolPref_TS('aggregate_average_not_rounded')) avgNum=Math.round(miczThunderStatsUtils._customqry_analyzer_data[type]['avg']);
						$jQ("#customqry_aggregate_max_sent").text(miczThunderStatsUtils._customqry_analyzer_data[type]['max']);
						$jQ("#customqry_aggregate_min_sent").text(miczThunderStatsUtils._customqry_analyzer_data[type]['min']);
						$jQ("#customqry_aggregate_avg_sent").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
						break;
					case 0: //received
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_max_rcvd_wait");
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_min_rcvd_wait");
						miczThunderStatsTab.ui.hideLoadingElement("customqry_aggregate_avg_rcvd_wait");
						if(!miczThunderStatsPrefs.getBoolPref_TS('aggregate_average_not_rounded')) avgNum=Math.round(miczThunderStatsUtils._customqry_analyzer_data[type]['avg']);
						$jQ("#customqry_aggregate_max_rcvd").text(miczThunderStatsUtils._customqry_analyzer_data[type]['max']);
						$jQ("#customqry_aggregate_min_rcvd").text(miczThunderStatsUtils._customqry_analyzer_data[type]['min']);
						$jQ("#customqry_aggregate_avg_rcvd").text(avgNum.toLocaleString(miczThunderStatsUtils.getCurrentSystemLocale()));
						break;
				}
			})
		.catch(
			function(reason){
				miczLogger.log('[miczThunderStatsTab.promises.customqry] Handle rejected promise ('+reason+') here.');
			});
		},

	resetAnalyzers:function(){
		this._analyzers={};
		miczThunderStatsUtils._customqry_analyzer_data={};
	},

};
