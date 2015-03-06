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
		miczThunderStatsDB.init();
		switch(tab_id){
			case '#tab_today':
				miczThunderStatsTab.getTodayStats(miczThunderStatsTab.getCurrentIdentityId());
			break;
			case '#tab_yesterday':
				miczThunderStatsTab.getYesterdayStats(miczThunderStatsTab.getCurrentIdentityId());
			break;
			case '#tab_7days':
				miczThunderStatsTab.getLast7DaysStats(miczThunderStatsTab.getCurrentIdentityId());
			break;
			case '#tab_info':
				//TODO
			break;
		}
		miczThunderStatsTab.getLastIndexedMessage();
		miczThunderStatsDB.close();
		return true;
	},

	openPrefWindow: function () {
		window.openDialog('chrome://thunderstats/content/mzts-settings.xul','ThunderStats_Settings','non-private,chrome,titlebar,dialog=no,resizable,centerscreen').focus();
	} ,

	formatInvolvedTable: function(involvedData){	//data columns ["ID","Name","Mail","Num"]
		let outString="<table class='mzts-tinvolved'>";
		outString+="<tr class='mzts-thead'><td>Name</td><td>Mail</td><td>Total Messages</td></tr>";

		for (let key in involvedData){
			outString+="<tr class='mzts-trow'><td>"+involvedData[key]["Name"]+"</td><td>"+involvedData[key]["Mail"]+"</td><td>"+involvedData[key]["Num"]+"</td></tr>";
		}

		outString+="</table>";
		return outString;
	},

};
