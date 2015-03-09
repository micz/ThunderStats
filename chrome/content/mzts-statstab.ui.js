"use strict";

miczThunderStatsTab.ui={

	showLoadingElement:function(element){
		$jQ("#"+element).show();
	},

	hideLoadingElement:function(element){
		$jQ("#"+element).hide();
	},

	loadIdentitiesSelector:function(selector_id){
		$jQ("select#"+selector_id).find('option').remove();
		//let id_selector = document.getElementById(selector_id);
		/*let opt_0 = document.createElement('option');
		opt_0.value = "0";
		opt_0.innerHTML = "All identities";
		id_selector.appendChild(opt_0);*/
		$jQ("#"+selector_id).append('<option value="0">All identities</option>');
		for(let key in miczThunderStatsCore.identities){
			//let opt = document.createElement('option');
			/*opt.value = miczThunderStatsCore.identities[key]["id"];
			opt.innerHTML = miczThunderStatsUtils.escapeHTML(miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")");
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities.length "+miczThunderStatsCore.identities.length+"\r\n");
			id_selector.appendChild(opt);*/
			$jQ("#"+selector_id).append('<option value="'+miczThunderStatsCore.identities[key]["id"]+'">'+miczThunderStatsUtils.escapeHTML(miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")")+'</option>');
			if(miczThunderStatsCore.identities.length==1){	//If there is only one identity, autochoose it
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
				$jQ("#"+selector_id).val(miczThunderStatsCore.identities[key]["id"]);
				$jQ("#"+selector_id).change();
			}
		}
		$jQ("#"+selector_id).change(miczThunderStatsTab.updateStats);
	},

	updateTab:function(){
		miczThunderStatsDB.init();
		switch(miczThunderStatsTab.currentTab){
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
		let margin = {top: 5, right: 0, bottom: 20, left: 30};
		let barWidth = 50;
		let w = ((barWidth + 15) * 7) - margin.left - margin.right;
		let h = 220 - margin.top - margin.bottom;

		let x = d3.scale.linear().domain([0, data_array.length]).range([0, w]);
		let y = d3.scale.linear().domain([0, d3.max(data_array, function(datum) { return datum.num; })]).rangeRound([h, 0]);

		//remove old graph
		$jQ("#"+element_id_txt+"_svg_graph").remove();

		let chart = d3.select("#"+element_id_txt)
			.append("svg:svg")
			.attr("id",element_id_txt+"_svg_graph")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
			.attr("transform", "translate("+margin.left+","+margin.top+")");

		//graph bars
		chart.selectAll("rect")
		  .data(data_array)
		  .enter()
		  .append("svg:rect")
		  .attr("x", function(datum, index) { return x(index); })
		  .attr("y", function(datum) { return y(datum.num); })
		  .attr("height", function(datum) { return y(0) - y(datum.num); })
		  .attr("width", barWidth)
		  .attr("fill", "#2d578b");

		//data labels
		chart.selectAll("text")
		  .data(data_array)
		  .enter()
		  .append("svg:text")
		  .attr("x", function(datum, index) { return x(index) + barWidth; })
		  .attr("y", function(datum) { return y(datum.num); })
		  .attr("dx", -barWidth/2)
		  .attr("dy", function(datum) { return datum.num > 0 ? "1.7em":"-1em"; })
		  .attr("text-anchor", "middle")
		  .text(function(datum) { return datum.num;})
		  .attr("class", function(datum) { return datum.num > 0 ? "data_label":"zero_data_label"; });

		//x axis labels
		chart.selectAll("text.xAxis")
			.data(data_array)
			.enter().append("svg:text")
			.attr("x", function(datum, index) { return x(index) + barWidth; })
			.attr("y", h)
			.attr("dx", -barWidth/2)
			.attr("text-anchor", "middle")
			.text(function(datum) { return datum.day_str; })
			.attr("transform", "translate(0, "+margin.bottom+")")
			.attr("class", "xAxis");

		//x axis
		let xAxis = d3.svg.axis().scale(x).orient("bottom")
				.tickValues([0.4,1.4,2.4,3.4,4.4,5.4,6.4])
				.outerTickSize(0);
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis);

		//y axis
		let num_ticks = (d3.max(data_array, function(datum) { return datum.num; })>10 ? 10 : d3.max(data_array, function(datum) { return datum.num; }));
		let yAxis = d3.svg.axis().tickFormat(d3.format('0:d')).ticks(num_ticks).scale(y).orient("left");
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis);
	},

	drawInbox0FolderSpreadGraph:function(element_id_txt,data_array){
		let margin = {top: 5, right: 0, bottom: 20, left: 20};
		let barWidth = 50;
		let w = ((barWidth + 15) * 7) - margin.left - margin.right;
		let h = 220 - margin.top - margin.bottom;
		let r = 100;
		let ir = 45;

		//D3 helper function to populate pie slice parameters from array data
		let donut = d3.layout.pie().value(function(d){ return d.octetTotalCount; });
		//D3 helper function to create colors from an ordinal scale
		let color = d3.scale.category20();
		//D3 helper function to draw arcs, populates parameter "d" in path object
		let arc = d3.svg.arc()
		  .startAngle(function(d){ return d.startAngle; })
		  .endAngle(function(d){ return d.endAngle; })
		  .innerRadius(ir)
		  .outerRadius(r);

		let x = d3.scale.linear().domain([0, data_array.length]).range([0, w]);
		let y = d3.scale.linear().domain([0, d3.max(data_array, function(datum) { return datum.num; })]).rangeRound([h, 0]);

		//remove old graph
		$jQ("#"+element_id_txt+"_svg_graph").remove();

		let chart = d3.select("#"+element_id_txt)
			.append("svg:svg")
			.attr("id",element_id_txt+"_svg_graph")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom);
			//.attr("transform", "translate("+margin.left+","+margin.top+")");

		//GROUP FOR ARCS/PATHS
		let arc_group = vis.append("svg:g")
		  .attr("class", "arc")
		  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

		//GROUP FOR LABELS
		let label_group = vis.append("svg:g")
		  .attr("class", "label_group")
		  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

		//GROUP FOR CENTER TEXT
		let center_group = vis.append("svg:g")
		  .attr("class", "center_group")
		  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

		//PLACEHOLDER GRAY CIRCLE
		let paths = arc_group.append("svg:circle")
			.attr("fill", "#EFEFEF")
			.attr("r", r);

		///////////////////////////////////////////////////////////
		// CENTER TEXT ////////////////////////////////////////////
		///////////////////////////////////////////////////////////

		//WHITE CIRCLE BEHIND LABELS
		let whiteCircle = center_group.append("svg:circle")
		  .attr("fill", "white")
		  .attr("r", ir);

		// "TOTAL" LABEL
		let totalLabel = center_group.append("svg:text")
		  .attr("class", "label")
		  .attr("dy", -15)
		  .attr("text-anchor", "middle") // text-align: right
		  .text("TOTAL");

		//TOTAL TRAFFIC VALUE
		let totalValue = center_group.append("svg:text")
		  .attr("class", "total")
		  .attr("dy", 7)
		  .attr("text-anchor", "middle") // text-align: right
		  .text("Waiting...");

		//UNITS LABEL
		let totalUnits = center_group.append("svg:text")
		  .attr("class", "units")
		  .attr("dy", 21)
		  .attr("text-anchor", "middle") // text-align: right
		  .text("kb");


		/* work in progress... see here: http://blog.stephenboak.com/2011/08/07/easy-as-a-pie.html
		 *					http://jsfiddle.net/stephenboak/hYuPb/
		 * 					http://bl.ocks.org/mbostock/3887235
		 */

	},

};
