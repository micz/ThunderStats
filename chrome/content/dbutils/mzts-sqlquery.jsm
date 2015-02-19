"use strict";
let EXPORTED_SYMBOLS = ["miczThunderStatsQuery"];

var miczThunderStatsQuery = {

	querySelect:function(mDb,mWhat,mFrom,mWhere){
		if((mWhere=="")||(mWhere==null))mWhere="1=1";
		let mQuery="SELECT "+mWhat+" FROM "+mFrom+" WHERE "+mWhere;
		dump(">>>>>>>>>>>>>> [miczThunderStatsTab] querySelect:\r\nSQL: " + mQuery+"\r\n");
		let rows = mDb.exec(mQuery);
		if(rows[1].length == 0){
			dump(">>>>>>>>>>>>>> [miczThunderStatsTab] ERROR:\r\nNo matching record found.\r\nSQL: " + mQuery+"\r\n");
			return -1;
		}
		return rows[1];
	},
};
