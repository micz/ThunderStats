"use strict";
const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczThunderStatsQuery"];

var miczThunderStatsQuery = {

	querySelect:function(mDb,mWhat,mFrom,mWhere,mCallback){
		//dump('>>>>>>>>>>>>>> [miczThunderStatsTab] querySelect mCallback '+(typeof mCallback)+'\r\n');
		if((mWhere=="")||(mWhere==null))mWhere="1=1";
		let mQuery="SELECT "+mWhat+" FROM "+mFrom+" WHERE "+mWhere;
		if(!mCallback){	// do it SYNC
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] querySelect (Sync):\r\nSQL: " + mQuery+"\r\n");
			mDb.selectQuery(mQuery);
			let rows = mDb.getRecords();
			if(rows.length == 0){
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] ERROR:\r\nNo matching record found.\r\nSQL: " + mQuery+"\r\n");
				return -1;
			}
			return rows;
		}else{					// do it ASYNC
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] querySelect (Async):\r\nSQL: " + mQuery+"\r\n");
			return mDb.executeAsync([mQuery],mCallback); // returns true or false
		}
	},

	queryExec:function(mDb,mQueries,mCallback){
		if(!mCallback){	// do it SYNC
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] queryExec (Sync):\r\nSQLs: " + JSON.stringify(mQueries)+"\r\n");
			return mDb.executeSimpleSQLs(mQueries);
		}else{					// do it ASYNC
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] queryExec (Async):\r\nSQLs: " + JSON.stringify(mQueries)+"\r\n");
			return mDb.executeAsync(mQueries,mCallback); // returns true or false
		}
	},
};
