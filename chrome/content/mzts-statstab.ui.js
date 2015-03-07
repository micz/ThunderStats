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
	
	draw7DaysGraph:function(element_id_txt,data_array,label_array){
		let w = 420;
		let h = 200;
		let bottom = 10;
		let rh = h - bottom;
		
		let max_data = Math.max.apply(Math, data_array);

		let vis = new pv.Panel().canvas(element_id_txt);
		vis.width(w).height(h);
		
		let bar=vis.add(pv.Bar)
			.data(data_array)
			.bottom(10)
			.height(function(d) d * (rh / max_data))
			.left(function() this.index * 60)
			.width(55);
		
		/* bar stroke lines */
		vis.add(pv.Rule)
			.data(pv.range(4))
			.bottom(function(d) (d * (rh / max_data)) + 10)
			.left(0)
			.right(0)
			.strokeStyle(function(d) (d > 0) ? "white" : "black")
		
		/* the value label */
		bar.anchor("top").add(pv.Label)
			.top(function(d) h - (d * (rh / max_data)))
			.textStyle("white")
			.text(function(d) d.toFixed(0));
		
		/* the x axis label */
		/*bar.parent.anchor("bottom").add(pv.Label)
			.textMargin(5)
			.textAlign("center")
			.text(function() label_array[this.parent.index]);*/
		
		bar.anchor("top").add(pv.Label)
			.top(function() max_data + 10)
			.textMargin(5)
			.textAlign("center")
			.text(function() label_array[this.index]);
		
		/*vis.add(pv.Rule)
			.anchor("bottom")
			.data(label_array)
			.bottom(0)
			.width(55)
			.height(0)
			.fillStyle("white")
			.left(function() this.index * 60)
			.add(pv.Label)
			.textMargin(5)
			.textAlign("center")
			.text(function(d) d);*/
		
		bar.root.render();
	},

};
