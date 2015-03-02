"use strict";

miczThunderStatsTab.ui={

	showLoadingElement:function(element){
		$jQ("#"+element).show();
	},

	hideLoadingElement:function(element){
		$jQ("#"+element).hide();
	},

	updateTab:function(tab_id){
		miczThunderStatsTab.currentTab=tab_id;
		switch(tab_id){
			case '#tab_today':
				miczThunderStatsDB.init();
				miczThunderStatsTab.getTodayStats(miczThunderStatsTab.getCurrentIdentityId());
				miczThunderStatsDB.close();
			break;
			case '#tab_yesterday':
				miczThunderStatsDB.init();
				miczThunderStatsTab.getYesterdayStats(miczThunderStatsTab.getCurrentIdentityId());
				miczThunderStatsDB.close();
			break;
		}
	},

	openPrefWindow: function () {
		window.openDialog('chrome://thunderstats/content/mzts-settings.xul','ThunderStats_Settings','non-private,chrome,titlebar,dialog=no,resizable,centerscreen').focus();
	} ,

	formatInvolvedTable: function(involvedData){	//data columns ["ID","Name","Mail","Num"]
		let outString="<table>";
		outString+="<tr><td>Name</td><td>Mail</td><td>Total Messages</td></tr>";

		for (let key in involvedData){
			outString+="<tr><td>"+involvedData[key]["Name"]+"</td><td>"+involvedData[key]["Mail"]+"</td><td>"+involvedData[key]["Num"]+"</td></tr>";
		}

		outString+="</table>";
		return outString;
	},

};
