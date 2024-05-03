"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var { SQLiteTypes, SQLiteHandler, SQLiteFn } = ChromeUtils.import("resource://thunderstats/sqlite.js");
var { sql_tokenizer, replaceObjectNameInSql, getViewSchemaSelectStmt } = ChromeUtils.import("resource://thunderstats/tokenize.js");
var { FileIO } = ChromeUtils.import("resource://thunderstats/fileIO.js");
var { OS } = ChromeUtils.import("resource://gre/modules/osfile.jsm");
var { miczThunderStatsQuery } = ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-sqlquery.jsm");
var { miczLogger } = ChromeUtils.import("resource://thunderstats/miczLogger.jsm");
var { miczThunderStatsUtils } = ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");


let EXPORTED_SYMBOLS = ["miczThunderStatsDB"];

var miczThunderStatsDB = {

    mDb: null,
    msgAttributes: null,
    forbiddenFolders: null,
    inboxFolders: null,
    inboxFolders_Account: null,
    inboxFolderURLs: null,
    identities_custom_ids: new Array(),
    identities_custom_ids_mail: new Array(),

    init: function() {
        this.mDb = new SQLiteHandler();

        let dirName = OS.Constants.Path.profileDir;
        let fileName = OS.Path.join(dirName, "global-messages-db.sqlite");
        let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        file.initWithPath(fileName);

        if (this.mDb.openDatabase(file)) {
            //load messages attributes!
            this.loadMsgAttributes(false);
            return true;
        } else {
            miczLogger.log('[miczThunderStatsDB] Error on db open {' + fileName + '}!!!\r\n', 2);
            //dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] Error on db open {'+fileName+'}!!!\r\n');
            return false;
        }
    },

    close: function() {
        this.mDb.closeConnection();
    },

    loadMsgAttributes: function(async) {

        if (async) { //do it async
            let rows = miczThunderStatsQuery.querySelect(this.mDb, "name,id", "attributeDefinitions", null, miczThunderStatsDB.callback.loadMsgAttributes);
        } else { //do it sync
            this.msgAttributes = {};
            let rows = miczThunderStatsQuery.querySelect(this.mDb, "name,id", "attributeDefinitions", null);
            //dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes rows '+JSON.stringify(rows)+'\r\n');
            for (let key in rows) {
                //dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes rows[key] '+JSON.stringify(rows[key])+'\r\n');
                this.msgAttributes[rows[key][0]] = rows[key][1];
            }
            //dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes this.msgAttributes  '+JSON.stringify(this.msgAttributes)+'\r\n');
        }
    },

    querySelect: function(mWhat, mFrom, mWhere, mCallback) {
        return miczThunderStatsQuery.querySelect(this.mDb, mWhat, mFrom, mWhere, mCallback);
    },

    queryExec: function(mQuery, mCallback) { //mQuery is a query string
        return miczThunderStatsQuery.queryExec(this.mDb, [mQuery], mCallback);
    },

    queryExecMulti: function(mQueries, mCallback) { //mQueries is an array of query strings
        return miczThunderStatsQuery.queryExec(this.mDb, mQueries, mCallback);
    },

    queryMessages: function(mType, mFromDate, mToDate, mIdentity, mCallback) { //mFromDate,mToDate are in milliseconds
        let mInfo = null;
        let mHours = null;
        if (typeof mType === 'object') {
            mInfo = mType.info;
            mHours = mType.hours;
            mType = mType.type;
        }
        let fromMe_attribute = this.msgAttributes['fromMe'];
        let toMe_attribute = this.msgAttributes['toMe'];
        //mType 0: toMe, 1: fromMe
        let mType_attribute = (mType == 1 ? fromMe_attribute : toMe_attribute);
        let involves_attribute = this.msgAttributes['involves'];
        let forbiddenFolders = this.queryGetForbiddenFolders();
        let forbiddenFoldersStr = "(" + forbiddenFolders.join() + ")";
        let mWhat = "count(distinct m.headerMessageID) as Num";
        if (mInfo != null) {
            mWhat += ", '" + mInfo + "' as Info";
        }
        let mFrom = "messageattributes ma left join messages m on ma.messageID=m.id";

        let mWhere = "m.date>" + mFromDate + "000 and m.date<" + mToDate + "000 AND m.folderID not in " + forbiddenFoldersStr;
        //if mType!=0 do not consider custom identities, they do not send emails
        //Also do not consider custom identities if there are no ones
        if ((mType == 1) || (this.identities_custom_ids_mail.length == 0)) {
            mWhere += " and ma.attributeID=" + mType_attribute;
            if (typeof mIdentity == "object") {
                let mIdsStr = mIdentity.ids.join();
                Services.console.logStringMessage('MainIdentities '+mIdsStr);
                mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
                let identitiesStr = "(" + mIdsStr + ")";
                mWhere += " AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identitiesStr;
            }
        } else { //do consider custom identities
            if (typeof mIdentity == "object") {
                mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
                let identitiesStr = "(" + mIdentity.ids.join() + ")";
                let identities_customStr = "(" + mIdentity.ids_custom.join() + ")";
                mWhere += "and ((ma.attributeID=" + mType_attribute + " AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identitiesStr + ") OR ";
                mWhere += " (ma.attributeID=" + involves_attribute + " AND ma.value in " + identities_customStr + "))";

                Services.console.logStringMessage('Identities1 '+identities_customStr);

            } else { //all identities
                let identitiesStr = "(" + this.identities_custom_ids.join() + ")";
                mWhere += "and ((ma.attributeID=" + mType_attribute + ") OR ";
                mWhere += "(ma.attributeID=" + involves_attribute + " AND ma.value in " + identitiesStr + "))";
            }
        }

        // cleidigh
        if (mHours != null) { //group messages by hours
            mWhat += ", strftime('%H',m.date/1000000,'unixepoch','localtime') AS mHour";
            mWhere += " GROUP BY mHour";
            let mQuery = "SELECT " + mWhat + " FROM " + mFrom + " WHERE " + mWhere;
            mQuery += " UNION SELECT 0 AS Num, '" + mInfo + "' as Info, -1 AS mHour";
            return this.queryExec(mQuery, mCallback);
        }
        if (mInfo == 'aggregate') { //getting max, min, avg
            mWhat += ", round(strftime('%J',m.date/1000000,'unixepoch','localtime')) AS mDay";
            mWhere += " GROUP BY mDay";
            let mQuery = 'SELECT max(t.Num) as maxNum, min(t.Num) as minNum, round(sum(t.Num)*1.0/(max(t.mDay)-min(t.mDay)+1),2) as avgNum FROM (';
            mQuery += "SELECT  max(Num) as Num,mDay FROM (";
            mQuery += "SELECT " + mWhat + " FROM " + mFrom + " WHERE " + mWhere;
            let mFromJD = miczThunderStatsUtils.getJulianDate(new Date(mFromDate)) + 1;
            let mToJD = miczThunderStatsUtils.getJulianDate(new Date(mToDate));
            let days_iterator = mToJD - mFromJD;
            //dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes mFromJD: '+mFromJD+' - mFromDate: '+mFromDate+'\r\n');
            //dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] loadMsgAttributes mToJD: '+mToJD+' - mToDate: '+mToDate+'\r\n');
            //mQuery+=" UNION SELECT 0 as Num, '"+mInfo+"' as Info, round(strftime('%J',"+mFromDate+"000/1000000,'unixepoch','localtime')) AS mDay";
            //mQuery+=" UNION SELECT 0 as Num, '"+mInfo+"' as Info, round(strftime('%J',"+mToDate+"000/1000000,'unixepoch','localtime')) AS mDay";
            for (let jd = mFromJD; jd <= mToJD; jd++) {
                mQuery += " UNION SELECT 0 as Num, '" + mInfo + "' as Info, " + jd + " AS mDay";
            }
            mQuery += ') GROUP BY mDay) t';
            return this.queryExec(mQuery, mCallback);
        }
        return this.querySelect(mWhat, mFrom, mWhere, mCallback);
    },

    queryGetNumInvolved: function(mType, mFromDate, mToDate, mIdentity, mMax, mCallback) { //mFromDate,mToDate are in milliseconds
        let fromMe_attribute = this.msgAttributes['fromMe'];
        let toMe_attribute = this.msgAttributes['toMe'];
        //mType 0: toMe, 1: fromMe
        let mType_attribute = (mType == 1 ? fromMe_attribute : toMe_attribute);
        let involves_attribute = this.msgAttributes['involves'];
        let forbiddenFolders = this.queryGetForbiddenFolders();
        let forbiddenFoldersStr = "(" + forbiddenFolders.join() + ")";
        let mWhat = "ma.value AS ID,c.name AS Name,i.value AS Mail,count(distinct m.headerMessageID) AS Num";
        let mFrom = "messageattributes ma left join messages m on ma.messageID=m.id left join identities i on i.id=ma.value left join contacts c on c.id=i.contactID";
        let mWhere = "m.date>" + mFromDate + "000 and m.date<" + mToDate + "000 AND m.folderID not in " + forbiddenFoldersStr;
        //if mType!=0 do not consider custom identities, they do not send emails
        //Also do not consider custom identities if there are no ones
        if ((mType == 1) || (this.identities_custom_ids_mail.length == 0)) {
            mWhere += " and ma.attributeID=" + mType_attribute;
            if (typeof mIdentity == "object") {
                mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
                let identitiesStr = "(" + mIdentity.ids.join() + ")";
                mWhere += " AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identitiesStr;
            }
        } else { //do consider custom identities
            let not_like_mail_Str = '("' + this.identities_custom_ids_mail.join() + '")';
            if (typeof mIdentity == "object") {
                mFrom += " left join messagesText_content mt on m.id=mt.docid";
                mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
                let identitiesStr = "(" + mIdentity.ids.join() + ")";
                let identities_customStr = "(" + mIdentity.ids_custom.join() + ")";
                mWhere += " and ((ma.attributeID=" + mType_attribute + " AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identitiesStr + ") OR ";
                mWhere += " (ma.attributeID=" + involves_attribute + " AND mt.c3author LIKE '%'||i.value||'%' AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identities_customStr + " AND i.value NOT IN " + not_like_mail_Str + "))";
            } else { //all identities
                mFrom += " left join messagesText_content mt on m.id=mt.docid";
                mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
                let identitiesStr = "(" + this.identities_custom_ids.join() + ")";
                mWhere += " and ((ma.attributeID=" + mType_attribute + ") OR ";
                mWhere += "(ma.attributeID=" + involves_attribute + " AND mt.c3author LIKE '%'||i.value||'%' AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identitiesStr + " AND i.value NOT IN " + not_like_mail_Str + "))";
            }
        }
        mWhere += " group by ma.value order by Num DESC";
        if (mMax > 0) {
            mWhere += " LIMIT " + mMax;
        }
        return this.querySelect(mWhat, mFrom, mWhere, mCallback);
    },

    /*queryGetAttachments:function(mType,mFromDate,mToDate,mIdentity,mMax,mCallback){	//mFromDate,mToDate are in milliseconds
    	let fromMe_attribute=this.msgAttributes['fromMe'];
    	let toMe_attribute=this.msgAttributes['toMe'];
    	let fromMe_attribute=this.msgAttributes['fromMe'];
    	let toMe_attribute=this.msgAttributes['toMe'];
    	//mType 0: toMe, 1: fromMe
    	let mType_attribute=(mType==1?fromMe_attribute:toMe_attribute);
    	let attachmentTypes_attribute=this.msgAttributes['attachmentTypes'];
    	let involves_attribute=this.msgAttributes['involves'];
    	let forbiddenFolders=this.queryGetForbiddenFolders();
    	let forbiddenFoldersStr="("+forbiddenFolders.join()+")";
    	let mWhat="count(m.id) AS TotAttachments,count(distinct m.id) AS NumMails";
    	let mFrom="messageattributes ma left join messages m on ma.messageID=m.id left join messageattributes ma2 on ma2.messageID=m.id";
    	let mWhere="ma2.attributeID="+attachmentTypes_attribute+" and ma.attributeID="+mType_attribute+" and m.date>"+mFromDate+"000 and m.date<"+mToDate+"000 AND m.folderID not in "+forbiddenFoldersStr;
    	if(typeof mIdentity == "Array"){
    		mFrom+=" left join messageattributes ma3 on ma3.messageID=m.id";
    		let identitiesStr="("+mIdentity.join()+")";
    		mWhere+=" AND ma3.attributeID="+involves_attribute+" AND ma3.value in "+identitiesStr;
    	}
    	mWhere+=" group by m.id";
    	if(mMax>0){
    		mWhere+=" LIMIT "+mMax;
    	}
    	return this.querySelect(mWhat,mFrom,mWhere,mCallback);	//returns tot_attachments,tot_mails
    },*/

    queryMessagesFolders: function(mType, mFromDate, mToDate, mIdentity, mCallback) { //mFromDate,mToDate are in milliseconds
        let fromMe_attribute = this.msgAttributes['fromMe'];
        let toMe_attribute = this.msgAttributes['toMe'];
        //mType 0: toMe (for inbox 0 stats), 1: fromMe (where are you keeping your sent mails?)
        let mType_attribute = (mType == 1 ? fromMe_attribute : toMe_attribute);
        let involves_attribute = this.msgAttributes['involves'];
        let forbiddenFolders = this.queryGetForbiddenFolders();
        let forbiddenFoldersStr = "(" + forbiddenFolders.join() + ")";
        let mWhat = "f.name as Folder, f.folderURI as FolderURI, count(distinct m.headerMessageID) as Num";
        let mFrom = "messageattributes ma left join messages m on ma.messageID=m.id left join folderLocations f on f.id=m.folderID";
        let mWhere = "m.date>" + mFromDate + "000 and m.date<" + mToDate + "000 AND m.folderID not in " + forbiddenFoldersStr;
        //if mType!=0 do not consider custom identities, they do not send emails
        //Also do not consider custom identities if there are no ones
        if ((mType == 1) || (this.identities_custom_ids_mail.length == 0)) {
            mWhere += " and ma.attributeID=" + mType_attribute;
            if (typeof mIdentity == "object") {
                mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
                let identitiesStr = "(" + mIdentity.ids.join() + ")";
                mWhere += " AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identitiesStr;
            }
        } else { //do consider custom identities
            if (typeof mIdentity == "object") {
                mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
                let identitiesStr = "(" + mIdentity.ids.join() + ")";
                let identities_customStr = "(" + mIdentity.ids_custom.join() + ")";
                mWhere += " and ((ma.attributeID=" + mType_attribute + " AND ma2.attributeID=" + involves_attribute + " AND ma2.value in " + identitiesStr + ") OR ";
                mWhere += " (ma.attributeID=" + involves_attribute + " AND ma.value in " + identities_customStr + "))";
            } else { //all identities
                let identitiesStr = "(" + this.identities_custom_ids.join() + ")";
                mWhere += " and ((ma.attributeID=" + mType_attribute + ") OR ";
                mWhere += "(ma.attributeID=" + involves_attribute + " AND ma.value in " + identitiesStr + "))";
            }
        }
        mWhere += " GROUP BY f.name, f.folderURI";
        return this.querySelect(mWhat, mFrom, mWhere, mCallback);
    },

    /*queryInboxMessages:function(mIdentity,mCallback){
    	let toMe_attribute=this.msgAttributes['toMe'];
    	let involves_attribute=this.msgAttributes['involves'];
    	let inboxFolders=this.queryGetInboxFolders();
    	let inboxFoldersStr="("+inboxFolders.join()+")";
    	let mWhat="count(distinct m.headerMessageID) as Num";
    	let mFrom="messageattributes ma left join messages m on ma.messageID=m.id";
    	let mWhere="ma.attributeID="+toMe_attribute+" AND m.folderID in "+inboxFoldersStr;
    	if(mIdentity>0){
    		mFrom+=" left join messageattributes ma2 on ma2.messageID=m.id";
    		mWhere+=" AND ma2.attributeID="+involves_attribute+" AND ma2.value="+mIdentity;
    	}
    	return this.querySelect(mWhat,mFrom,mWhere,mCallback);
    },

    //returns the number of messages in the inbox for each day
    queryInboxMessagesDate:function(mIdentity,mCallback){
    	let toMe_attribute=this.msgAttributes['toMe'];
    	let involves_attribute=this.msgAttributes['involves'];
    	let inboxFolders=this.queryGetInboxFolders();
    	let inboxFoldersStr="("+inboxFolders.join()+")";
    	let mWhat="strftime('%Y-%m-%d',m.date/1000000,'unixepoch') as Date, count(distinct m.headerMessageID) as Num";
    	let mFrom="messageattributes ma left join messages m on ma.messageID=m.id";
    	let mWhere="ma.attributeID="+toMe_attribute+" AND m.folderID in "+inboxFoldersStr;
    	if(mIdentity>0){
    		mFrom+=" left join messageattributes ma2 on ma2.messageID=m.id";
    		mWhere+=" AND ma2.attributeID="+involves_attribute+" AND ma2.value="+mIdentity;
    	}
    	mWhere+= " GROUP BY strftime('%Y-%m-%d',m.date/1000000,'unixepoch') ORDER BY m.date ASC";
    	return this.querySelect(mWhat,mFrom,mWhere,mCallback);
    },*/

    //returns an array of ids of folder to be ignored in stats crunching
    queryGetForbiddenFolders: function() {
        if (this.forbiddenFolders !== null) {
            return this.forbiddenFolders;
        }
        let folderArray = new Array();
        //not in drafts folders and not if folder is not indexed
        let mWhere = 'indexingPriority=-1 OR name="Drafts"';
        let rows = this.querySelect("id", "folderLocations", mWhere);
        for (let key in rows) {
            folderArray.push(rows[key][0]);
        }
        this.forbiddenFolders = folderArray;
        return folderArray;
    },

    //returns an array of nsIMsgFolders of inbox folders for the given identity
    queryGetInboxFolders: function(account_split = false) {
        if (!account_split) {
            if ((this.inboxFolders !== null) && (this.inboxFolders.length > 0)) {
                return this.inboxFolders;
            }
        } else {
            if ((this.inboxFolders_Account !== null) && (this.inboxFolders_Account.length > 0)) {
                return this.inboxFolders_Account;
            }
        }
        //get accounts
        let acctMgr = Cc["@mozilla.org/messenger/account-manager;1"].getService(Ci.nsIMsgAccountManager);
        let accounts = acctMgr.accounts;
        let arr_inbox = new Array();
        let arr_inbox_account = {};
        //dump('>>>>>>>>>>>>>> [miczThunderStatsTab] accounts '+JSON.stringify(accounts)+'\r\n');
        for (let i = 0; i < accounts.length; i++) {
            let account = accounts.queryElementAt(i, Ci.nsIMsgAccount);
            if (account == null) continue;
            //dump('>>>>>>>>>>>>>> [miczThunderStatsTab queryGetInboxFolders] mIdentity|identities '+mIdentity+"|"+JSON.stringify(identities)+'\r\n');
            //if((mIdentity!=0)&&(identities[mIdentity]["account_key"]!=account.key)) continue;
            // check folders
            let server = account.incomingServer;
            let folder = server.rootFolder;
            //dump('>>>>>>>>>>>>>> [miczThunderStatsTab getInboxMessages] folder.URI '+JSON.stringify(folder.URI)+'\r\n');
            arr_inbox = miczThunderStatsUtils.arrayMerge(arr_inbox, miczThunderStatsUtils.getInboxFoldersObjects(folder));
            arr_inbox_account[account.key] = miczThunderStatsUtils.getInboxFoldersObjects(folder);
        }
        this.inboxFolders = arr_inbox;
        this.inboxFolders_Account = arr_inbox_account;
        if (!account_split) {
            return arr_inbox;
        } else {
            return arr_inbox_account;
        }
    },

    queryGetInboxFolderURLs: function() {
        if (this.inboxFolderURLs !== null) {
            return this.inboxFolderURLs;
        }
        let inboxFolders = miczThunderStatsDB.queryGetInboxFolders(false);
        let output = new Array();
        for (let inboxfs of inboxFolders) {
            output.push(inboxfs.folderURL);
        }
        return output;
    },

    //returns the id of an identity from its email
    queryGetIdentityID: function(email) {
        let mWhere = 'value="' + email + '" LIMIT 1';
        let rows = this.querySelect("id", "identities", mWhere);
        if (rows.length > 0) {
            return rows[0][0];
        } else {
            return false;
        }
    },

    //returns the id of a folder from its URI
    queryGetFolderID: function(URI) {
        let mWhere = 'folderURI="' + URI + '" LIMIT 1';
        let rows = this.querySelect("id", "folderLocations", mWhere);
        if (rows.length > 0) {
            return rows[0][0];
        } else {
            return false;
        }
    },

    queryGetLastMessageDate: function(mCallback) {
        let mWhat = "max(date) as last_msg_date";
        let mFrom = "messages";
        let mWhere = "";
        return this.querySelect(mWhat, mFrom, mWhere, mCallback); //returns last_msg_date
    },

    getLastIndexUpdate: function() {
        let dirName = OS.Constants.Path.profileDir;
        let fileName = OS.Path.join(dirName, "global-messages-db.sqlite");
        let promise = OS.File.stat(fileName);
        promise = promise.then(
            function onSuccess(stat) {
                let ObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
                ObserverService.notifyObservers(null, "mzts-last-index-update", JSON.stringify(stat.lastModificationDate));
            },
            function onFailure(reason) {
                if (reason instanceof OS.File.Error && reason.becauseNoSuchFile) {
                    // The file does not exist
                    miczLogger.log("Failed loading last index update: file not found.", 2);
                } else {
                    // Some other error
                    let error = 0;
                    if (miczThunderStatsUtils.getHostSystem() == 'winnt') {
                        error = reason.unixErrno;
                    } else {
                        error = reason.winLastError;
                    }
                    miczLogger.log("Failed loading last index update: " + reason.operation + ", error: " + error + ".", 2);
                    throw reason;
                }
            }
        );
    },

    getTotalMessages: function(mCallback) {
        let mWhat = "count(*) as tot_msg";
        let mFrom = "messages";
        let mWhere = "";
        return this.querySelect(mWhat, mFrom, mWhere, mCallback); //returns tot_msg
    },

    getTotalMessageAttributes: function(mCallback) {
        let mWhat = "count(*) as tot_msg_att";
        let mFrom = "messageAttributes";
        let mWhere = "";
        return this.querySelect(mWhat, mFrom, mWhere, mCallback); //returns tot_msg_att
    },

    queryDebuggerGetForbiddenFoldersInfo: function() {
        let folderArray = new Array();
        //not in drafts folders and not if folder is not indexed
        let mWhere = 'indexingPriority=-1 OR name="Drafts"';
        let rows = this.querySelect("*", "folderLocations", mWhere);
        for (let key in rows) {
            folderArray.push(rows[key]);
        }
        return folderArray;
    },

    queryDebuggerTimeRangeMessages: function(mFromDate, mToDate, mCallback) { //returns the query string
        let mWhat = "count(distinct m.headerMessageID) as Num";
        let mFrom = "messages m";
        let forbiddenFolders = this.queryGetForbiddenFolders();
        let forbiddenFoldersStr = "(" + forbiddenFolders.join() + ")";
        let mWhere = "m.date>" + mFromDate + "000 and m.date<" + mToDate + "000 AND m.folderID not in " + forbiddenFoldersStr;
        this.querySelect(mWhat, mFrom, mWhere, mCallback);
        return "SELECT " + mWhat + " FROM " + mFrom + " WHERE " + mWhere;
    },

    queryDebuggerMessageAttributes: function(mType_attribute, involves_attribute, identitiesStr, mCallback) { //returns the query string
        let mWhat = "count(distinct m.headerMessageID) as Num";
        let mFrom = "messageattributes ma left join messages m on ma.messageID=m.id";
        mFrom += " left join messageattributes ma2 on ma2.messageID=m.id";
        let forbiddenFolders = this.queryGetForbiddenFolders();
        let forbiddenFoldersStr = "(" + forbiddenFolders.join() + ")";
        let mWhere = "m.folderID not in " + forbiddenFoldersStr;
        mWhere += "and ((ma.attributeID=" + mType_attribute + ") OR ";
        mWhere += "(ma.attributeID=" + involves_attribute + " AND ma.value in " + identitiesStr + "))";
        this.querySelect(mWhat, mFrom, mWhere, mCallback);
        return "SELECT " + mWhat + " FROM " + mFrom + " WHERE " + mWhere;
    },

    queryDebuggerUsedMessageAttributes: function(mCallback) {
        let mWhat = "attributeID,count(attributeID) as Num";
        let mFrom = "messageAttributes";
        let mWhere = "1=1 group by attributeID order by 2 DESC";
        return this.querySelect(mWhat, mFrom, mWhere, mCallback);
    },

};

miczThunderStatsDB.callback = {};

miczThunderStatsDB.callback.loadMsgAttributes = {
    empty: true,
    data: new Array(),
    handleResult: function(aResultSet) {
        let result = miczThunderStatsCore.db.getResultObject(["name", "id"], aResultSet);
        this.empty = false;
        for (let key in result) {
            this.data.push(result[key]);
        }
    },

    handleError: function(aError) {
        miczLogger.log("Error in executeAsync: " + aError.message, 2);
    },

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                this.msgAttributes = {};
                if (!this.empty) {
                    for (let key in this.data) {
                        //dump('>>>>>>>>>>>>>> [miczThunderStatsTab mDB] (Async) loadMsgAttributes this.data '+JSON.stringify(this.data)+'\r\n');
                        miczThunderStatsDB.msgAttributes[this.data[key][0]] = this.data[key][1];
                    }
                } else {
                    //Do nothing
                }
                miczLogger.log("(Async) MsgAttributes loaded.", 0);
                this.data = new Array();
                this.empty = true;
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = new Array();
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = new Array();
                this.empty = true;
                return false;
        }
    },
};