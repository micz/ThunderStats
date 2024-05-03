"use strict";

var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

var { miczThunderStatsDB } = ChromeUtils.import("chrome://thunderstats/content/dbutils/mzts-mdb.jsm");
var { miczThunderStatsCore } = ChromeUtils.import("chrome://thunderstats/content/mzts-statscore.jsm");
var { miczThunderStatsPrefs } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.prefs.jsm");
var { miczThunderStatsI18n } = ChromeUtils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");
var { miczThunderStatsUtils } = ChromeUtils.import("chrome://thunderstats/content/mzts-utils.jsm");
var { miczLogger } = ChromeUtils.import("resource://thunderstats/miczLogger.jsm");

miczThunderStatsDebugger.callback = {};

miczThunderStatsDebugger.callback.base = {

    handleError: function(aError) {
        miczLogger.log("Error in executeAsync: " + aError.message, 2);
    },

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                //miczLogger.log("Query completed successfully.");
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.last_idx_msg = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["last_msg_date"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab");
                    miczThunderStatsDebugger.addLogLines(_bundleCW.GetStringFromName("ThunderStats.LastIndexedMessage") + ": " + miczThunderStatsUtils.getDateTimeString(moment(this.data[1]["last_msg_date"] / 1000)));
                } else {
                    miczThunderStatsDebugger.addLogLines(_bundleCW.GetStringFromName("ThunderStats.LastIndexedMessage") + ": not found.");
                }
                miczLogger.log("Last indexed message loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(1);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};


miczThunderStatsDebugger.callback.tot_msg = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["tot_msg"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("Total messages from gloda: " + this.data[1]["tot_msg"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("Total messages from gloda: not found.");
                }
                miczLogger.log("Total messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(4);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.tot_msg_att = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["tot_msg_att"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("Total message attributes from gloda: " + this.data[1]["tot_msg_att"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("Total message attributes from gloda: not found.");
                }
                miczLogger.log("Total message attributes loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(5);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.stats_today_sent = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("Today: total messages sent: " + this.data[1]["Num"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("Today: total messages sent: not found");
                }
                miczLogger.log("Today sent messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(6);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.stats_today_rcvd = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("Today: total messages received: " + this.data[1]["Num"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("Today: total messages received: not found");
                }
                miczLogger.log("Today sent messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(7);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.stats_yesterday_sent = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("Yesterday: total messages sent: " + this.data[1]["Num"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("Yesterday: total messages sent: not found");
                }
                miczLogger.log("Today sent messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(8);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.stats_yesterday_rcvd = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("Yesterday: total messages received: " + this.data[1]["Num"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("Yesterday: total messages received: not found");
                }
                miczLogger.log("Today sent messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(9);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.stats_customqry_sent = {
    empty: true,
    data: {},
    data_customqry_sent: new Array(),
    total_mail: 0,
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num", "Info"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                let m = moment(miczThunderStatsUtils.getDate7DaysString(new Date(this.data[1]["Info"])), "YYYYMMDD");
                if (!this.empty) {
                    this.total_mail += this.data[1]["Num"];
                    this.data_customqry_sent.push({ day: m.unix(), day_str: miczThunderStatsUtils.getDateStringYY(m, true), num: this.data[1]["Num"] });
                } else {
                    this.data_customqry_sent.push({ day: m.unix(), day_str: miczThunderStatsUtils.getDateStringYY(m, true), num: 0 });
                }
                miczLogger.log("Custom query sent messages loaded day: " + this.data[1]["Info"] + ".", 0);
                //if we've collected our days, let's print it!
                //dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsDebugger.callback.stats_customqry_sent miczThunderStatsDebugger.data_customqry_sent.length '+this.data_customqry_sent.length+'\r\n');
                
                miczThunderStatsUtils._customqry_num_days
                if (this.data_customqry_sent.length == miczThunderStatsUtils._customqry_num_days) {
                    //ordering results array
                    this.data_customqry_sent.sort(miczThunderStatsUtils.array_7days_compare);
                    miczThunderStatsDebugger.addLogLines("7 days: total messages sent: " + this.total_mail);
                    miczThunderStatsDebugger.addLogLines("7 days: total messages sent data: " + JSON.stringify(this.data_customqry_sent));
                    this.total_mail = 0;
                    this.data_customqry_sent = new Array();
                    miczThunderStatsDebugger.getThunderStatsData(10);
                }
                this.data = {};
                this.empty = true;
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                this.total_mail = 0;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                this.total_mail = 0;
                return false;
        }
        return false;
    },
};


miczThunderStatsDebugger.callback.stats_customqry_rcvd = {
    empty: true,
    data: {},
    data_customqry_rcvd: new Array(),
    total_mail: 0,
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num", "Info"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                let m = moment(miczThunderStatsUtils.getDate7DaysString(new Date(this.data[1]["Info"])), "YYYYMMDD");
                if (!this.empty) {
                    this.total_mail += this.data[1]["Num"];
                    this.data_customqry_rcvd.push({ day: m.unix(), day_str: miczThunderStatsUtils.getDateStringYY(m, true), num: this.data[1]["Num"] });
                } else {
                    this.data_customqry_rcvd.push({ day: m.unix(), day_str: miczThunderStatsUtils.getDateStringYY(m, true), num: 0 });
                }
                miczLogger.log("Custom query received messages loaded day: " + this.data[1]["Info"] + ".", 0);
                //if we've collected our days, let's print it!
                //dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsDebugger.callback.stats_customqry_sent miczThunderStatsDebugger.data_customqry_sent.length '+this.data_customqry_sent.length+'\r\n');
                if (this.data_customqry_rcvd.length == miczThunderStatsUtils._customqry_num_days) {
                    //ordering results array
                    this.data_customqry_rcvd.sort(miczThunderStatsUtils.array_7days_compare);
                    miczThunderStatsDebugger.addLogLines("7 days: total messages received: " + this.total_mail);
                    miczThunderStatsDebugger.addLogLines("7 days: total messages received data: " + JSON.stringify(this.data_customqry_rcvd));
                    this.total_mail = 0;
                    this.data_customqry_rcvd = new Array();
                    miczThunderStatsDebugger.getThunderStatsData(11);
                }
                this.data = {};
                this.empty = true;
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                this.total_mail = 0;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                this.total_mail = 0;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.debugger_time_range = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerTimeRangeMessages: total: " + this.data[1]["Num"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerTimeRangeMessages: total: not found");
                }
                miczLogger.log("Today sent messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(13);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.debugger_attributes_sent = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerMessageAttributes: total sent: " + this.data[1]["Num"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerMessageAttributes: total sent: not found");
                }
                miczLogger.log("Today sent messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(14);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.debugger_attributes_rcvd = {
    empty: true,
    data: {},
    handleResult: function(aResultSet) {
        this.empty = false;
        let result = miczThunderStatsCore.db.getResultObject(["Num"], aResultSet);
        for (let key in result) {
            this.data[key] = result[key];
        }
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerMessageAttributes: total received: " + this.data[1]["Num"]);
                } else {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerMessageAttributes: total received: not found");
                }
                miczLogger.log("Today sent messages loaded.", 0);
                this.data = {};
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(15);
                return true;
            case Ci.mozIStorageStatementCallback.REASON_CANCELED:
                miczLogger.log("Query canceled by the user!", 1);
                this.data = {};
                this.empty = true;
                return false;
            case Ci.mozIStorageStatementCallback.REASON_ERROR:
                miczLogger.log("Query aborted!", 2);
                this.data = {};
                this.empty = true;
                return false;
        }
        return false;
    },
};

miczThunderStatsDebugger.callback.debugger_used_attributes = {
    empty: true,
    data: new Array(),
    handleResult: function(aResultSet) {
        let result = miczThunderStatsCore.db.getResultObject(["attributeID", "Num"], aResultSet);
        this.empty = false;
        for (let key in result) {
            this.data.push(result[key]);
        }
        //dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_yesterday_recipients handleResult '+JSON.stringify(this.data)+'\r\n');
    },

    handleError: miczThunderStatsDebugger.callback.base.handleError,

    handleCompletion: function(aReason) {
        switch (aReason) {
            case Ci.mozIStorageStatementCallback.REASON_FINISHED:
                if (!this.empty) {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerUsedMessageAttributes: " + JSON.stringify(this.data));
                    //dump('>>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsTab.callback.homepage_stats_7days_recipients handleCompletion '+JSON.stringify(this.data)+'\r\n');
                } else {
                    miczThunderStatsDebugger.addLogLines("queryDebuggerUsedMessageAttributes: not found");
                }
                miczLogger.log("debugger_used_attributes loaded.", 0);
                this.data = new Array();
                this.empty = true;
                miczThunderStatsDebugger.getThunderStatsData(16);
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
        return false;
    },
};