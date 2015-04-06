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
		$jQ("#"+selector_id).append('<option value="0">All accounts</option>');
		for(let key in miczThunderStatsCore.accounts){
			$jQ("#"+selector_id).append('<option class="mzts-sel-account" value="'+miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.accounts[key].key+"] "+miczThunderStatsCore.accounts[key].name)+'</option>');
			for(let ikey in miczThunderStatsCore.accounts[key].identities){
				let curr_idn=miczThunderStatsCore.accounts[key].identities[ikey];
				$jQ("#"+selector_id).append('<option class="mzts-sel-identity" value="'+miczThunderStatsCore.identities[curr_idn]["id"]+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.identities[curr_idn]["id"]+":"+miczThunderStatsCore.identities[curr_idn]["key"]+"] "+miczThunderStatsCore.identities[curr_idn]["fullName"]+" ("+miczThunderStatsCore.identities[curr_idn]["email"]+")")+'</option>');
			}
			if(Object.keys(miczThunderStatsCore.accounts).length==1){	//If there is only one account, autochoose it
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
				$jQ("#"+selector_id).val(miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key);
				$jQ("#"+selector_id).change();
			}
		}
		/*for(let key in miczThunderStatsCore.identities){
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities.length "+Object.keys(miczThunderStatsCore.identities).length+"\r\n");
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] miczThunderStatsCore.identities "+miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")\r\n");
			if(tmp_account_key!=miczThunderStatsCore.identities[key]["account_key"]){	//it's a new account
				tmp_account_key=miczThunderStatsCore.identities[key]["account_key"];
				$jQ("#"+selector_id).append('<option class="mzts-sel-account" value="'+miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.identities[key]["account_key"]+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.identities[key]["account_key"]+"] "+miczThunderStatsCore.identities[key]["account_name"])+'</option>');
			}
			$jQ("#"+selector_id).append('<option class="mzts-sel-identity" value="'+miczThunderStatsCore.identities[key]["id"]+'">'+miczThunderStatsUtils.escapeHTML("["+miczThunderStatsCore.identities[key]["id"]+":"+miczThunderStatsCore.identities[key]["key"]+"] "+miczThunderStatsCore.identities[key]["fullName"]+" ("+miczThunderStatsCore.identities[key]["email"]+")")+'</option>');
			if(Object.keys(miczThunderStatsCore.identities).length==1){	//If there is only one identity, autochoose it
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
				$jQ("#"+selector_id).val(miczThunderStatsCore.identities[key]["id"]);
				$jQ("#"+selector_id).change();
			}
		}*/
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

	drawInbox0DateSpreadGraph:function(element_id_txt,data_array,aggregate){
		let margin = {top: 5, right: 0, bottom: 5, left: 43};
		let barWidth = 40;
		let w = barWidth;
		let h = 220 - margin.top - margin.bottom;
		let min_bar_height = 12;

		//calculating total elements
		let data_sum=0;
		for(let key in data_array){
			data_sum+=data_array[key].Num;
		}

		if(aggregate){		//we are going to aggregate old days
			//choose how much to aggregate
			let max_el=20;
			if(data_array.length>max_el){		// ok, we really need to aggregate
				let spin_day=moment(data_array[data_array.length - max_el].Date);
				let tmp_array=new Array();
				let aggregate_day={};
				aggregate_day.Num=0;
				aggregate_day.Date=moment('1900/01/01');
				aggregate_day.aggregate=true;
				for(let key in data_array){
					if(moment(data_array[key].Date) <= spin_day){	//aggregate day
						//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] aggregating: "+JSON.stringify(data_array[key])+"\r\n");
						aggregate_day.Num+=data_array[key].Num;
						aggregate_day.Date=Math.max(moment(aggregate_day.Date),moment(data_array[key].Date));
					}else{		//keep day
						data_array[key].aggregate=false;
						tmp_array.push(data_array[key]);
					}

				}
				tmp_array.unshift(aggregate_day);
				data_array=tmp_array;
			}
		}

		let x = d3.scale.linear().domain([0, 1]).range([0, w]);
		let y = d3.scale.linear().domain([0, 1]).range([h, 0]);
		let color = d3.scale.category20();

		//adding normalized data
		let incr_num=0;
		let incr_norm=0;
		let total_bar_height=0;
		let incr_bar_height=0;
		for(let key in data_array){
			data_array[key].incremental=data_array[key].Num+incr_num;
			incr_num+=data_array[key].Num;
			data_array[key].normalized=data_array[key].Num/data_sum;
			data_array[key].incremental_normalized=data_array[key].normalized+incr_norm;
			incr_norm+=data_array[key].normalized;
			data_array[key].bar_height=y(0) - y(data_array[key].normalized);
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] data_array[key].bar_height: "+JSON.stringify(data_array[key].bar_height)+"\r\n");
			total_bar_height+=data_array[key].bar_height;
			incr_bar_height+=data_array[key].bar_height;
			data_array[key].y=h-incr_bar_height;
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] total_bar_height: "+JSON.stringify(total_bar_height)+"\r\n");
		}

		//data_array=JSON.parse('[{"Date":"2010-09-21","Num":3,"incremental":3,"normalized":0.1875,"incremental_normalized":0.1875},{"Date":"2012-01-26","Num":1,"incremental":4,"normalized":0.0625,"incremental_normalized":0.25},{"Date":"2015-03-02","Num":3,"incremental":7,"normalized":0.1875,"incremental_normalized":0.4375},{"Date":"2015-03-08","Num":1,"incremental":8,"normalized":0.0625,"incremental_normalized":0.5},{"Date":"2015-03-13","Num":3,"incremental":11,"normalized":0.1875,"incremental_normalized":0.6875},{"Date":"2015-03-14","Num":5,"incremental":16,"normalized":0.3125,"incremental_normalized":1}]');

		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

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
		  //.attr("y", function(datum) { return datum.y; })
		  .attr("height", function(datum) { return y(0) - y(datum.normalized); })
		  //.attr("height", function(datum) { return datum.bar_height; })
		  .attr("width", barWidth)
		  .attr("class","tooltip")
		  .attr("title",function(datum) { return (datum.aggregate?'Before<br/>':'')+miczThunderStatsUtils.getDateStringYY(moment(datum.Date),false)+"<br/>Mails: "+datum.Num+" ("+(datum.normalized*100).toFixed(0)+"%)";})
		  .attr("fill", function(d) { return color(d.Date); });

		  $jQ('rect.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true,arrow:false});

		//data labels
		/*chart.selectAll("text")
		  .data(data_array)
		  .enter()
		  .append("svg:text")
		  .attr("x", 0)
		  //.attr("y", function(datum) { return y(datum.incremental_normalized); })
		  //.attr("y", function(datum) { return datum.y; })
		  .attr("y", function(datum) { return datum.label_y})
		  .attr("dx", 2*barWidth)
		  //.attr("dy", function(datum) { return margin.top/2 + datum.bar_height/2; })
		  .attr("class","tooltip")
		  .attr("title",function(datum) { return miczThunderStatsUtils.getDateStringYY(moment(datum.Date),false)+"<br/>Mails: "+datum.Num+" ("+(datum.normalized*100).toFixed(0)+"%)";})
		  .text(function(datum) { return miczThunderStatsUtils.getDateStringYY(moment(datum.Date),false);});

		$jQ('text.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true});

		//labels lines
		chart.selectAll("polyline")
			.data(data_array)
			.enter()
			.append("svg:polyline")
			.attr("points",function(datum){
				return [barWidth+1,y(datum.incremental_normalized)+(y(0) - y(datum.normalized))/2,
						barWidth+12,datum.label_y-5];
					});
*/
		//y axis
		let yAxis = d3.svg.axis().tickFormat(d3.format(".0%")).ticks(5).scale(y).orient("left");
		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis);
	},

	drawInbox0FolderSpreadGraph:function(element_id_txt,data_array){

		//remove old graph
		$jQ("#"+element_id_txt+"_svg_graph").remove();

		let svg = d3.select("#"+element_id_txt)
			.append("svg")
			.attr("id",element_id_txt+"_svg_graph")
			.append("g");

		svg.append("g")
			.attr("class", "slices");
		svg.append("g")
			.attr("class", "labels");
		svg.append("g")
			.attr("class", "lines");

		let width = 350,
			height = 200,
			radius = Math.min(width, height) / 2;

		//calculating total elements
		let data_sum=0;
		for(let key in data_array){
			data_sum+=data_array[key].Num;
		}

		//normalize data
		let norm_data=new Array();
		for(let key in data_array){
			let element={};
			element.value=data_array[key].Num;
			element.label=data_array[key].Folder;
			element.normalized=data_array[key].Num/data_sum;
			norm_data.push(element);
		}

		let pie = d3.layout.pie()
			.sort(null)
			.value(function(d) {
				return d.value;
			});

		let arc = d3.svg.arc()
			.outerRadius(radius * 0.8)
			.innerRadius(radius * 0.4);

		let outerArc = d3.svg.arc()
			.innerRadius(radius * 0.9)
			.outerRadius(radius * 0.9);

		svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		let key = function(d){ return d.data.label; };

		let color = d3.scale.category20();

			/* ------- PIE SLICES -------*/
			let slice = svg.select(".slices").selectAll("path.slice")
				.data(pie(norm_data), key);

			slice.enter()
				.insert("path")
				.style("fill", function(d) { return color(d.data.label); })
				.attr("class", "slice")
				.attr("class","tooltip")
				.attr("title",function(d){ return d.data.label+"<br/>Mails: "+d.data.value+" ("+(d.data.normalized*100).toFixed(0)+"%)";});

			slice
				.transition().duration(1000)
				.attrTween("d", function(d) {
					this._current = this._current || d;
					let interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						return arc(interpolate(t));
					};
				})

			slice.exit()
				.remove();

			  $jQ('path.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true,arrow:false});

			/* ------- TEXT LABELS -------*/

			let text = svg.select(".labels").selectAll("text")
				.data(pie(norm_data), key);

			text.enter()
				.append("text")
				.attr("dy", ".35em")
				.text(function(d) {
					return d.data.label+" ("+d.data.value+")";
				})
				.attr("class","tooltip")
				.attr("title",function(d){ return d.data.label+"<br/>Mails: "+d.data.value+" ("+(d.data.normalized*100).toFixed(0)+"%)";});

			  $jQ('text.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true,arrow:false});

			function midAngle(d){
				return d.startAngle + (d.endAngle - d.startAngle)/2;
			}

			text.transition().duration(1000)
				.attrTween("transform", function(d) {
					this._current = this._current || d;
					let interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						let d2 = interpolate(t);
						let pos = outerArc.centroid(d2);
						pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
						return "translate("+ pos +")";
					};
				})
				.styleTween("text-anchor", function(d){
					this._current = this._current || d;
					let interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						let d2 = interpolate(t);
						return midAngle(d2) < Math.PI ? "start":"end";
					};
				});

			text.exit()
				.remove();

			/* ------- SLICE TO TEXT POLYLINES -------*/

			var polyline = svg.select(".lines").selectAll("polyline")
				.data(pie(norm_data), key);

			polyline.enter()
				.append("polyline");

			polyline.transition().duration(1000)
				.attrTween("points", function(d){
					this._current = this._current || d;
					let interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						let d2 = interpolate(t);
						let pos = outerArc.centroid(d2);
						pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
						return [arc.centroid(d2), outerArc.centroid(d2), pos];
					};
				});

			polyline.exit()
				.remove();










		/*let width = 250,
			height = 250,
			radius = Math.min(width, height) / 2;

		//remove old graph
		$jQ("#"+element_id_txt+"_svg_graph").remove();

		//calculating total elements
		let data_sum=0;
		for(let key in data_array){
			data_sum+=data_array[key].Num;
		}

		//adding normalized data
		for(let key in data_array){
			data_array[key].normalized=data_array[key].Num/data_sum;
		}

		let color = d3.scale.category20();

		let arc = d3.svg.arc()
			.outerRadius(radius - 10)
			.innerRadius(0);

		let pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.Num; });

		let svg = d3.select("#"+element_id_txt).append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("id",element_id_txt+"_svg_graph")
		    .append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		  data_array.forEach(function(d) {
			d.Num = +d.Num;
		  });

		  //dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

		  let g = svg.selectAll(".arc")
			  	.data(pie(data_array))
				.enter().append("g")
			  	.attr("class", "arc");

		  g.append("path")
			  .attr("d", arc)
			  .style("fill", function(d) { return color(d.data.Folder); });

		  g.append("text")
			  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
			  .attr("dy", ".35em")
			  .style("text-anchor", "middle")
			  .attr("class","tooltip")
		  	  .attr("title",function(d) { return d.data.Folder+"<br/>Mails: "+d.data.Num+" ("+(d.data.normalized*100).toFixed(0)+"%)";})
			  .text(function(d) { return d.data.Folder; });

		$jQ('text.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true});

		/*let margin = {top: 5, right: 0, bottom: 20, left: 20};
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
