"use strict";
const {classes: Cc, interfaces: Ci, utils: Cu, results : Cr} = Components;

let EXPORTED_SYMBOLS = ["miczLogger"];

var miczLogger = {
	logger:null,
	doc:null,

	setLogger:function(wrapper,document){
		this.logger=wrapper;
		this.doc=document;
	},

	log:function(msg,level){ //level 0: msg, 1: warning, 2: critical error
		if(this.logger==null)return;


		let node = this.doc.createElement("p");
		let p_class="micz_log_msg";
		if(level==1){
			p_class="micz_log_warn";
		}else if(level==2){
			p_class="micz_log_err";
		}
		node.setAttribute("class",p_class);
		let textnode = this.doc.createTextNode(msg);
		node.appendChild(textnode);

		this.logger.appendChild(node);
		this.logger.scrollTop=this.logger.scrollHeight;
	},
};
