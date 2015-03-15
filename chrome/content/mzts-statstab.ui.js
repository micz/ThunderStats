"use strict";

miczThunderStatsTab.ui={

	log_panel_status:false,

	showLoadingElement:function(element){
		$jQ("#"+element).show();
	},

	hideLoadingElement:function(element){
		$jQ("#"+element).hide();
	},

	toggleLogPanel:function(){
		$jQ("#log_close_btn img").tooltipster('hide');
		$jQ("#log_close_btn").toggleClass('opened');
		$jQ("#log_close_btn").toggleClass('closed');
		if(miczThunderStatsTab.ui.log_panel_status){	//hide
			miczLogger.setActive(false);
			miczThunderStatsTab.ui.log_panel_status=false;
			$jQ("#log_wrapper").hide();
			$jQ("#log_clear_btn").hide();
			$jQ('#log_wrapper').empty();
			$jQ('#content_wrapper').css('padding-bottom','0px');
			$jQ("#log_close_btn img").attr('title','Open log panel');
			$jQ("#log_close_btn img").attr('alt','Open log panel');
			$jQ("#log_close_btn img").tooltipster('content','Open log panel');
			this.logCloseBtnHide();
		}else{		//show
			miczLogger.setActive(true);
			miczThunderStatsTab.ui.log_panel_status=true;
			$jQ("#log_wrapper").show();
			$jQ("#log_clear_btn").show();
			$jQ('#content_wrapper').css('padding-bottom','100px');
			$jQ("#log_close_btn img").attr('title','Close log panel');
			$jQ("#log_close_btn img").attr('alt','Close log panel');
			$jQ("#log_close_btn img").tooltipster('content','Close log panel');
		}
	},

	logCloseBtnShow:function(){
		if(!miczThunderStatsTab.ui.log_panel_status){
			$jQ("#log_close_btn img").fadeIn();
			$jQ("#log_close_btn").css('background','white');
		}
	},

	logCloseBtnHide:function(){
		if(!miczThunderStatsTab.ui.log_panel_status){
			$jQ("#log_close_btn img").fadeOut();
			$jQ("#log_close_btn").css('background','lightgrey');
		}
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
		outString+="<tr class='mzts-thead'><td class='mzts-row-num'>#</td><td>Name</td><td>Mail</td><td>Total</td></tr>";

		let ind=1;
		for (let key in involvedData){
			outString+="<tr class='mzts-trow'><td class='mzts-row-num'>"+ind+"</td><td>"+involvedData[key]["Name"]+"</td><td>"+involvedData[key]["Mail"]+"</td><td>"+involvedData[key]["Num"]+"</td></tr>";
			ind++;
		}

		outString+="</table>";
		return outString;
	},

	util7DaysGraph_InsertLinebreaks:function(d){
		let el = d3.select(this);
		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] d: "+JSON.stringify(d)+"\r\n");
		let words = d.day_str.split('|');
		el.text('');

		for (let i = 0; i < words.length; i++) {
			let tspan = el.append('tspan').text(words[i]);
			if (i > 0){
				tspan.attr('x', el.attr('x')).attr('dy', el.attr('dy')+15).attr('dx', el.attr('dx'));
			}
		}
	},

	draw7DaysGraph:function(element_id_txt,data_array){
		let margin = {top: 5, right: 0, bottom: 40, left: 30};
		let barWidth = 50;
		let w = ((barWidth + 15) * 7) - margin.left - margin.right;
		let h = 220 - margin.top - margin.bottom;

		//data_array=JSON.parse('[{"day":1425337200,"day_str":"03/03/15","num":11},{"day":1425423600,"day_str":"04/03/15","num":78},{"day":1425510000,"day_str":"05/03/15","num":55},{"day":1425596400,"day_str":"06/03/15","num":2},{"day":1425682800,"day_str":"07/03/15","num":0},{"day":1425769200,"day_str":"08/03/15","num":21},{"day":1425855600,"day_str":"09/03/15","num":5}]');

		let x = d3.scale.linear().domain([0, data_array.length]).range([0, w]);
		let y = d3.scale.linear().domain([0, Math.ceil((d3.max(data_array, function(datum) { return datum.num; })+1)/10)*10]).rangeRound([h, 0]);

		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab draw7DaysGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

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
		  .attr("dy", function(datum) { return y(0) - y(datum.num) > 24 ? "1.7em":"-1em"; })
		  .attr("text-anchor", "middle")
		  .text(function(datum) { return datum.num;})
		  .attr("class", function(datum) { return y(0) - y(datum.num) > 24 ? "data_label":"zero_data_label"; });

		//x axis labels
		chart.selectAll("text.xAxis")
			.data(data_array)
			.enter().append("svg:text")
			.attr("x", function(datum, index) { return x(index) + barWidth; })
			.attr("y", h)
			.attr("dx", -barWidth/2)
			.attr("text-anchor", "middle")
			.text(function(datum) { return datum.day_str; })
			.attr("transform", "translate(0, "+(margin.bottom/2)+")")
			.attr("class", "xAxis");

		//x axis
		let xAxis = d3.svg.axis().scale(x).orient("bottom")
				.tickValues([0.4,1.4,2.4,3.4,4.4,5.4,6.4])
				.outerTickSize(0);
		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis);

		//break x axis labels in new lines
		chart.selectAll('text.xAxis').each(miczThunderStatsTab.ui.util7DaysGraph_InsertLinebreaks);

		//y axis
		let num_ticks = (d3.max(data_array, function(datum) { return datum.num; })>10 ? 10 : d3.max(data_array, function(datum) { return datum.num; }));
		let yAxis = d3.svg.axis().tickFormat(d3.format('0:d')).ticks(num_ticks).scale(y).orient("left");
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis);
	},

	drawInbox0DateSpreadGraph:function(element_id_txt,data_array){
		let margin = {top: 10, right: 0, bottom: 10, left: 70};
		let barWidth = 80;
		let w = (barWidth + 15 + margin.left + margin.right) - margin.left - margin.right;
		let h = 220 - margin.top - margin.bottom;

		//calculating total elements
		let data_sum=0;
		for(let key in data_array){
			data_sum+=data_array[key].Num;
		}

		//adding normalized data
		let incr_num=0;
		let incr_norm=0;
		for(let key in data_array){
			data_array[key].incremental=data_array[key].Num+incr_num;
			incr_num+=data_array[key].Num;
			data_array[key].normalized=data_array[key].Num/data_sum;
			data_array[key].incremental_normalized=data_array[key].normalized+incr_norm;
			incr_norm+=data_array[key].normalized;
		}

		//data_array=JSON.parse('[{"Date":"2010-09-21","Num":3,"incremental":3,"normalized":0.1875,"incremental_normalized":0.1875},{"Date":"2012-01-26","Num":1,"incremental":4,"normalized":0.0625,"incremental_normalized":0.25},{"Date":"2015-03-02","Num":3,"incremental":7,"normalized":0.1875,"incremental_normalized":0.4375},{"Date":"2015-03-08","Num":1,"incremental":8,"normalized":0.0625,"incremental_normalized":0.5},{"Date":"2015-03-13","Num":3,"incremental":11,"normalized":0.1875,"incremental_normalized":0.6875},{"Date":"2015-03-14","Num":5,"incremental":16,"normalized":0.3125,"incremental_normalized":1}]');

		let x = d3.scale.linear().domain([0, 1]).range([0, w]);
		let y = d3.scale.linear().domain([0, 1]).range([h, 0]);
		let color = d3.scale.category20();

		dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

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
		  .attr("x", 0)
		  .attr("y", function(datum) { return y(datum.incremental_normalized); })
		  .attr("height", function(datum) { return y(0) - y(datum.normalized); })
		  .attr("width", barWidth)
		  .attr("fill", function(d) { return color(d.Date); });

		//data labels
		chart.selectAll("text")
		  .data(data_array)
		  .enter()
		  .append("svg:text")
		  .attr("x", 0)
		  .attr("y", function(datum) { return y(datum.incremental_normalized); })
		  .attr("dx", barWidth/2)
		  .attr("dy", function(datum) { return margin.top/2 + (y(0) - y(datum.normalized))/2; })
		  .attr("text-anchor", "middle")
		  .text(function(datum) { return miczThunderStatsUtils.getDateStringYY(moment(datum.Date),false)+" ("+(datum.normalized*100).toFixed(0)+"%)";});
		  //.text(function(datum) { return datum.Date+'|1:'+y(datum.incremental_normalized)+'|2:'+(y(0) - y(datum.normalized))+'d:'+datum.Num;});

		//y axis
		let yAxis = d3.svg.axis().tickFormat(d3.format(".0%")).ticks(5).scale(y).orient("left");
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
		let arc_group = chart.append("svg:g")
		  .attr("class", "arc")
		  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

		//GROUP FOR LABELS
		let label_group = chart.append("svg:g")
		  .attr("class", "label_group")
		  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

		//GROUP FOR CENTER TEXT
		let center_group = chart.append("svg:g")
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
