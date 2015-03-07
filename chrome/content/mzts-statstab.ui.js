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
		let barWidth = 55;
		let w = (barWidth + 5) * 7;
		let h = 200;
		let bottom = 10;
		//let rh = h - bottom;
		

		//let y = d3.scale.linear().range([h, 0]);
		let x = d3.scale.linear().domain([0, data_array.length]).range([0, w]);
		//var y = d3.scale.linear().domain([0, d3.max(data, function(datum) { return datum.books; })]).rangeRound([0, height]);
		let y = d3.scale.linear().domain([0, d3.max(data_array)]).rangeRound([0, h]);

		let chart = d3.select("#"+element_id_txt)
			.append("svg:svg")
			.attr("width", w)
			.attr("height", h);
		
		chart.selectAll("rect").
		  data(data_array).
		  enter().
		  append("svg:rect").
		  attr("x", function(datum, index) { return x(index); }).
		  attr("y", function(datum) { return h - y(datum); }).
		  attr("height", function(datum) { return y(datum); }).
		  attr("width", barWidth).
		  attr("fill", "#2d578b");

		/*let bar = chart.selectAll("g")
			.data(data_array)
			.enter().append("g")
			.attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

		bar.append("rect")
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return h - y(d.value); })
			.attr("width", barWidth - 1);

		bar.append("text")
			.attr("x", barWidth / 2)
			.attr("y", function(d) { return y(d.value) + 3; })
			.attr("dy", ".75em")
			.text(function(d) { return d.value; });
		
		/*let x = d3.scale.linear()
			.domain([0, d3.max(data_array)])
			.range([0, w]);

		d3.select("#"+element_id_txt)
			.selectAll("div")
			.data(data_array)
			.enter().append("div")
			.style("heigth",function(d) { return x(d) + "px"; })
			.text(function(d) { return d; });
		*/
		
		
		/*let vis = new pv.Panel().canvas(element_id_txt);
		vis.width(w).height(h);
		
		let bar=vis.add(pv.Bar)
			.data(data_array)
			.bottom(10)
			.height(function(d) d * (rh / max_data))
			.left(function() this.index * 60)
			.width(55);
		
		/* bar stroke lines 
		vis.add(pv.Rule)
			.data(pv.range(4))
			.bottom(function(d) (d * (rh / max_data)) + 10)
			.left(0)
			.right(0)
			.strokeStyle(function(d) (d > 0) ? "white" : "black")
		
		/* the value label 
		bar.anchor("top").add(pv.Label)
			.top(function(d) h - (d * (rh / max_data)))
			.textStyle("white")
			.text(function(d) d.toFixed(0));
		
		/* the x axis label 
		/*bar.parent.anchor("bottom").add(pv.Label)
			.textMargin(5)
			.textAlign("center")
			.text(function() label_array[this.parent.index]);
		
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
		
		//bar.root.render();
	},

};
