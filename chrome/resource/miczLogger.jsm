"use strict";
const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczLogger"];

var miczLogger = {
	active:true,
	consoleService:null,
	debug:false,

	setLogger:function(active,debug){
		this.active=active;
		this.debug=debug;
	},

	setActive:function(active){
		this.active=active;
	},

	setDebug:function(debug){
		this.debug=debug;
	},

	logTime: function logTime() {
		let end = new Date();
		return end.getHours() + ':' + end.getMinutes() + ':' + end.getSeconds() + '.' + end.getMilliseconds();
	},

	log:function(msg,level = 0){ //level 0: msg, 1: warning, 2: critical error
		if (this.consoleService === null){
			this.consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		}

		if((level==0)&&(this.debug)){
			this.consoleService.logStringMessage("ThunderStats >>> " + this.logTime() + "\n"+ msg);
		}else if(level>0){
			// flags
			// errorFlag    0x0   Error messages. A pseudo-flag for the default, error case.
			// warningFlag    0x1   Warning messages.
			// exceptionFlag  0x2   An exception was thrown for this case - exception-aware hosts can ignore this.
			// strictFlag     0x4
			let aCategory = '';
        	let scriptError = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
        	let aFlags=0x0;
        	if(level==1) aFlags=0x1;
        	let aSourceName='ThunderStats',
        	aSourceLine='Error dumped by miczLogger...',
        	aLineNumber=0,
        	aColumnNumber=0;
    		scriptError.init(msg, aSourceName, aSourceLine, aLineNumber, aColumnNumber, aFlags, aCategory);
    		this.consoleService.logMessage(scriptError);
		}
	},
};
