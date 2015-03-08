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
	
	draw7DaysGraph:function(element_id_txt,data_array){
		let barWidth = 55;
		let w = (barWidth + 5) * 7;
		let h = 200;
		let bottom = 20;
		let left = 20;

		//let y = d3.scale.linear().range([h, 0]);
		let x = d3.scale.linear().domain([0, data_array.length]).range([0, w]);
		let y = d3.scale.linear().domain([0, d3.max(data_array, function(datum) { return datum.num; })]).rangeRound([0, h]);
		//let y = d3.scale.linear().domain([0, d3.max(data_array)]).rangeRound([0, h]);

		let chart = d3.select("#"+element_id_txt)
			.append("svg:svg")
			.attr("width", w + left)
			.attr("height", h + bottom)
			.attr("transform", "translate("+left+",0)");
		
		//graph bars
		chart.selectAll("rect")
		  .data(data_array)
		  .enter()
		  .append("svg:rect")
		  .attr("x", function(datum, index) { return x(index); })
		  .attr("y", function(datum) { return h - y(datum.num); })
		  .attr("height", function(datum) { return y(datum.num); })
		  .attr("width", barWidth)
		  .attr("fill", "#2d578b");
		
		//data labels
		chart.selectAll("text")
		  .data(data_array)
		  .enter()
		  .append("svg:text")
		  .attr("x", function(datum, index) { return x(index) + barWidth; })
		  .attr("y", function(datum) { return h - y(datum.num); })
		  .attr("dx", -barWidth/2)
		  .attr("dy", "1.7em")
		  .attr("text-anchor", "middle")
		  .text(function(datum) { return datum.num;})
		  .attr("fill", "white");
		  
		//x axis labels
		chart.selectAll("text.xAxis")
			.data(data_array)
			.enter().append("svg:text")
			.attr("x", function(datum, index) { return x(index) + barWidth; })
			.attr("y", h)
			.attr("dx", -barWidth/2)
			.attr("text-anchor", "middle")
			.text(function(datum) { return datum.day_str; })
			.attr("transform", "translate(0, "+bottom+")")
			.attr("class", "xAxis");
			
		//x axis
		let xAxis = d3.svg.axis().scale(x).orient("bottom")
				.tickValues([0.5,1.5,2.5,3.5,4.5,5.5,6.5])
				.outerTickSize(0);
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis);
			
		//y axis
		let num_ticks = (d3.max(data_array, function(datum) { return datum.num; })>10 ? 10 : d3.max(data_array, function(datum) { return datum.num; }));
		let yAxis = d3.svg.axis().tickFormat(d3.format('0:d')).ticks(num_ticks).scale(y).orient("left"); //TODO: REVERSE SCALE ON AXIS
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis);
	},

};
