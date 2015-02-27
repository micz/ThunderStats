"use strict";

miczThunderStatsTab.ui={

	showLoadingElement:function(element){
		$jQ("#"+element).show();
	},

	hideLoadingElement:function(element){
		$jQ("#"+element).hide();
	},
	
	updateTab:function(tab_id){
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
	}
};
