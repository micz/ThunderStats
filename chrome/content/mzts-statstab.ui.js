"use strict";

Components.utils.import("chrome://thunderstats/content/mzts-statstab.i18n.jsm");

miczThunderStatsTab.ui={

	last_pos0:0,
	last_pos1:0,
	label_height:15,
	_tmp_i:-1,

	showLoadingElement:function(element){
		$jQ("#"+element).show();
	},

	hideLoadingElement:function(element){
		$jQ("#"+element).hide();
	},

	loadIdentitiesSelector:function(selector_id,custom_account_key){
		$jQ("select#"+selector_id).find('option').remove();
		let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
		$jQ("#"+selector_id).append('<option value="0">'+_bundleCW.GetStringFromName("ThunderStats.AllAccounts")+'</option>');
		for(let key in miczThunderStatsCore.accounts){
			let debug_txt='';
			if(miczThunderStatsPrefs.isDebug){
				debug_txt="["+miczThunderStatsCore.accounts[key].key+':'+miczThunderStatsCore.accounts[key].identities.join(',')+"] ";
			}
			let item_css_class='mzts-sel-account';
			let show_identities=miczThunderStatsPrefs.showIdentitiesSelector||(key==custom_account_key);
			/*if(!show_identities){
				item_css_class='';
			}*/
			$jQ("#"+selector_id).append('<option class="'+item_css_class+'" value="'+miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key+'">'+miczThunderStatsUtils.escapeHTML(debug_txt+miczThunderStatsCore.accounts[key].name)+'</option>');
			if(show_identities){
				for(let ikey in miczThunderStatsCore.accounts[key].identities){
					let curr_idn=miczThunderStatsCore.accounts[key].identities[ikey];
					let debug_txt_idn='';
					if(miczThunderStatsPrefs.isDebug){
						debug_txt_idn="["+miczThunderStatsCore.identities[curr_idn]["id"]+":"+miczThunderStatsCore.identities[curr_idn]["key"]+"] ";
					}
					$jQ("#"+selector_id).append('<option class="mzts-sel-identity" value="'+miczThunderStatsCore.identities[curr_idn]["id"]+'">'+miczThunderStatsUtils.escapeHTML(debug_txt_idn+miczThunderStatsCore.identities[curr_idn]["fullName"]+" ("+miczThunderStatsCore.identities[curr_idn]["email"]+")")+'</option>');
				}
			}
			if(Object.keys(miczThunderStatsCore.accounts).length==1){	//If there is only one account, autochoose it
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] id_selector autochoosing.\r\n");
				$jQ("#"+selector_id).val(miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[key].key);
				$jQ("#"+selector_id).change();
			}else{	//choose the chosen startup account from prefs
				let strt_acc=miczThunderStatsPrefs.getCharPref_TS('strt_acc');
				if(strt_acc!=0){
					$jQ("#"+selector_id).val(miczThunderStatsCore._account_selector_prefix+miczThunderStatsCore.accounts[strt_acc].key);
					$jQ("#"+selector_id).change();
				}
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
	},

	formatInvolvedTable: function(involvedData){	//data columns ["ID","Name","Mail","Num"]
		let outString="<table class='mzts-tinvolved'>";
		let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");
		outString+="<tr class='mzts-thead'><td class='mzts-row-num'>#</td><td>"+_bundleCW.GetStringFromName("ThunderStats.Name")+"</td><td>"+_bundleCW.GetStringFromName("ThunderStats.Mail")+"</td><td>"+_bundleCW.GetStringFromName("ThunderStats.Total")+"</td></tr>";

		let ind=1;
		for (let key in involvedData){
			outString+="<tr class='mzts-trow'><td class='mzts-row-num'>"+ind+"</td><td>"+involvedData[key]["Name"]+"</td><td>"+involvedData[key]["Mail"]+"</td><td>"+involvedData[key]["Num"]+"</td></tr>";
			ind++;
		}

		outString+="</table>";
		return outString;
	},

	showGlobalIndexingWarning:function(show){
		if(!show){
			$jQ('#mzts-main-error').show();
			$jQ('#mzts-idnt_sel').hide();
			$jQ('#mzts-last_msg').hide();
			$jQ('#mzts-idx_update').hide();
		}else{
			$jQ('#mzts-main-error').hide();
			$jQ('#mzts-idnt_sel').show();
			$jQ('#mzts-last_msg').show();
			$jQ('#mzts-idx_update').show();
		}
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

		//remove old graph
		$jQ("#"+element_id_txt+"_svg_graph").remove();

		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0DateSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");
		if(Object.keys(data_array).length==0){
			return;
		}

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

		let chart = d3.select("#"+element_id_txt)
			.append("svg:svg")
			.attr("id",element_id_txt+"_svg_graph")
			.attr("width", w + margin.left + margin.right)
			.attr("height", h + margin.top + margin.bottom)
			.attr("transform", "translate("+margin.left+","+margin.top+")");

		let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");

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
		  .attr("title",function(datum) { return (datum.aggregate?_bundleCW.GetStringFromName("ThunderStats.Before")+'<br/>':'')+miczThunderStatsUtils.getDateStringYY(moment(datum.Date),false)+"<br/>"+_bundleCW.GetStringFromName("ThunderStats.Mails")+": "+datum.Num+" ("+(datum.normalized*100).toFixed(0)+"%)";})
		  .attr("fill", function(d) { return color(d.Date); });

		  $jQ('rect.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true,arrow:false,position:'left'});

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
		miczThunderStatsTab.ui.last_pos0=0;
		miczThunderStatsTab.ui.last_pos1=0;

		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] data_array: "+JSON.stringify(data_array)+"\r\n");

		//data_array=JSON.parse('[{"Folder":"All Mail","Num":10},{"Folder":"Inbox","Num":21},{"Folder":"test1","Num":21},{"Folder":"test2","Num":21},{"Folder":"test3","Num":21},{"Folder":"test4","Num":21},{"Folder":"test5","Num":21},{"Folder":"test6","Num":21},{"Folder":"test7","Num":2},{"Folder":"test8","Num":3},{"Folder":"test________________9","Num":14},{"Folder":"test_____________10","Num":14},{"Folder":"test11","Num":14},{"Folder":"test12","Num":14}]');

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

		let arc_width = 350,
			arc_height = 200,
			width = 450,
			height = 250,
			radius = Math.min(arc_width, arc_height) / 2;

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

			let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");

			text.enter()
				.append("text")
				.attr("dy", ".35em")
				.text(function(d) {
					return d.data.label+" ("+d.data.value+")";
				})
				.attr("class","tooltip")
				.attr("title",function(d){ return d.data.label+"<br/>"+_bundleCW.GetStringFromName("ThunderStats.Mails")+": "+d.data.value+" ("+(d.data.normalized*100).toFixed(0)+"%)";});

			  $jQ('text.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true,arrow:false});

			function midAngle(d){
				return d.startAngle + (d.endAngle - d.startAngle)/2;
			}

			text.attr("transform", function(d) {
						let pos = outerArc.centroid(d);
						pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
						pos[1] = miczThunderStatsTab.ui.utilInbox0FolderSpreadGraph_LabelPosition(pos);
						//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] "+d.data.label+" "+JSON.stringify(pos)+"\r\n");
						return "translate("+ pos +")";
				})
				.style("text-anchor", function(d){
					return midAngle(d) < Math.PI ? "start":"end";
				});

			text.exit()
				.remove();

			/* ------- SLICE TO TEXT POLYLINES -------*/
			miczThunderStatsTab.ui.last_pos0=0;
			miczThunderStatsTab.ui.last_pos1=0;

			var polyline = svg.select(".lines").selectAll("polyline")
				.data(pie(norm_data), key);

			polyline.enter()
				.append("polyline");

			polyline.attr("points", function(d){
					let pos = outerArc.centroid(d);
					pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
					pos[1] = miczThunderStatsTab.ui.utilInbox0FolderSpreadGraph_LabelPosition(pos);
					return [arc.centroid(d), outerArc.centroid(d), pos];
				});

			polyline.exit()
				.remove();
	},

	utilInbox0FolderSpreadGraph_LabelPosition:function(pos){

		if((miczThunderStatsTab.ui.last_pos0==0)||(miczThunderStatsTab.ui.last_pos1==0)){
			miczThunderStatsTab.ui.last_pos0=pos[0];
			miczThunderStatsTab.ui.last_pos1=pos[1];
			//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] first label\r\n");
			return pos[1];
		}	//first label
		if(pos[0]>0){	//starting from 12 hours CW...
			if(pos[1]<0){ //first quarter
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] first quarter\r\n");
				let label_diff=pos[1]-miczThunderStatsTab.ui.last_pos1;
				if(label_diff<miczThunderStatsTab.ui.label_height){
					pos[1]+=miczThunderStatsTab.ui.label_height-label_diff;
				}
			}else{	//second quarter
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] second quarter\r\n");
				let label_diff=Math.abs(pos[1]-miczThunderStatsTab.ui.last_pos1);
				if(label_diff<miczThunderStatsTab.ui.label_height){
					pos[1]+=miczThunderStatsTab.ui.label_height-label_diff;
				}
			}
		}else{	//second half
			if(miczThunderStatsTab.ui.last_pos0>0){	//first label in the second half
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] first label in the second half\r\n");
				miczThunderStatsTab.ui.last_pos0=pos[0];
				miczThunderStatsTab.ui.last_pos1=pos[1];
				return pos[1];
			}
			if(pos[1]>0){ //third quarter
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] third quarter\r\n");
				let label_diff=Math.abs(pos[1]-miczThunderStatsTab.ui.last_pos1);
				if(label_diff<miczThunderStatsTab.ui.label_height){
					pos[1]-=miczThunderStatsTab.ui.label_height-label_diff;
				}
			}else{	//fourth quarter
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] fourth quarter\r\n");
				let label_diff=miczThunderStatsTab.ui.last_pos1-pos[1];
				//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] label_diff: "+label_diff+"\r\n");
				if(label_diff<miczThunderStatsTab.ui.label_height){
					//dump(">>>>>>>>>>>>>> [miczThunderStatsTab drawInbox0FolderSpreadGraph] fixing position\r\n");
					pos[1]-=miczThunderStatsTab.ui.label_height-label_diff;
				}
			}
		}
		miczThunderStatsTab.ui.last_pos0=pos[0];
		miczThunderStatsTab.ui.last_pos1=pos[1];
		return pos[1];
	},

	utilDrawTimeGraph_ArrangeData:function(data_array,is_today){
		let data_output=new Array();
		let _data_handles;
		if(is_today){
			_data_handles=['today_sent','today_rcvd','yesterday_sent','yesterday_rcvd'];
		}else{
			_data_handles=['yesterday_sent','yesterday_rcvd'];
		}

		for(let h_el in _data_handles){
			let current_data={};
			current_data['type']=_data_handles[h_el];
			current_data['data']=new Array();
			//rearrange actual data
			for(let el in data_array[_data_handles[h_el]]){
				if(data_array[_data_handles[h_el]][el]['mHour']>=0){
					current_data['data'].push({'type':_data_handles[h_el],'hour':data_array[_data_handles[h_el]][el]['mHour'],'value':data_array[_data_handles[h_el]][el]['Num']});
				}
			}

			//add missing hours
			if(current_data['data'].length<24){
				for(this._tmp_i=0;this._tmp_i<=23;this._tmp_i++){
					if(!current_data['data'].some(this.utilDrawTimeGraph_CheckRecord,this)){
						//current_data['data'].push({'type':_data_handles[h_el],'hour':this._tmp_i,'value':0});
						current_data['data'].push({'type':_data_handles[h_el],'hour':this._tmp_i,'value':Math.floor(Math.random() * (42 - 0)) + 0});
					};
				}
			}

			current_data.data.sort(this.utilDrawTimeGraph_ArrayCompare);
			data_output.push(current_data);
		}

		return data_output;
	},

	utilDrawTimeGraph_ArrayCompare:function(a,b){
		if(a.hour < b.hour){
			return -1;
		}
		if(a.hour > b.hour){
			return 1;
		}
		return 0;
	},

	utilDrawTimeGraph_CheckRecord:function(currentValue){
		if(currentValue.hour===this._tmp_i){
			return true;
		}
		return false;
	},

	drawTimeGraph:function(element_id_txt,data_array,is_today){

		let margin = {
			top: 10,
			right: 150,
			bottom: 40,
			left: 40
		};
		let full_width=600;
		let full_height=150;
		let width = full_width - margin.left - margin.right;
		let height = full_height - margin.top - margin.bottom;

		let legendRectSize = 10;
		let legendSpacing = 8;

		let _bundleCW = miczThunderStatsI18n.createBundle("mzts-statstab.ui");

		let data=this.utilDrawTimeGraph_ArrangeData(data_array,is_today);
		let data_types=new Array();

		for(let eel in data){
			data_types.push(data[eel]["type"]);
		}

		let bar_width=(width/(23*data_types.length));

		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] drawTimeGraph data_types: "+JSON.stringify(data_types)+"\r\n");

		//let data = [{"type": "today_sent","data": [{"type": "today_sent","hour": "11","value": "63"},{"type": "today_sent","hour": "18","value": "18"},{"type": "today_sent","date": "21","value": "53"}]}];

		//dump(">>>>>>>>>>>>>> [miczThunderStatsTab] drawTimeGraph data: "+JSON.stringify(data)+"\r\n");

		//remove old graph
		$jQ("#"+element_id_txt+"_svg_graph").remove();

		let x = d3.scale.linear().domain([0,24]).range([0, width]);
		let y = d3.scale.linear().range([height, 0]);

		//let color = d3.scale.category10();
		let color = d3.scale.ordinal().range(['#1f77b4','#ff7f0e','#1f773a','#610eff']);

		let xAxis = d3.svg.axis()
			.ticks(13)
			.outerTickSize(1)
			.tickValues([0,2,4,6,8,10,12,14,16,18,20,22])
			.scale(x)
			.orient("bottom");

		let y_num_ticks = d3.max(data, function (kv) { return d3.max(kv.data, function (d) { return d.value; })})<10?d3.max(data, function (kv) { return d3.max(kv.data, function (d) { return d.value; })}):d3.max(data, function (kv) { return d3.max(kv.data, function (d) { return d.value; })})<80 ? 4 : 8;

		let yAxis = d3.svg.axis()
			.scale(y)
			.outerTickSize(1)
			.ticks(y_num_ticks)
			.tickFormat(d3.format('0'))
			.orient("left");

		/*let line = d3.svg.line()
			.interpolate("linear")	/*linear basis step-before step-after cardinal monotone*//*
			.x(function (d) {
			return x(d.hour);
		})
			.y(function (d) {
			return y(d.value);
		});*/

		let svg = d3.select("#"+element_id_txt).append("svg")
			.attr("width", full_width)
			.attr("height", full_height)
			.attr("id",element_id_txt+"_svg_graph")
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		color.domain(data.map(function (d) { return d.type; }));

		let minY = d3.min(data, function (kv) { return d3.min(kv.data, function (d) { return d.value; }) });
		let maxY = d3.max(data, function (kv) { return d3.max(kv.data, function (d) { return d.value; })<10?d3.max(kv.data, function (d) { return d.value; }):Math.ceil((d3.max(kv.data, function (d) { return d.value; })+1)/10)*10 });

		y.domain([minY, maxY]);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.attr("dx", bar_width*2)
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end");

		let serie = svg.selectAll(".serie")
			.data(data)
			.enter().append("g")
			.attr("class", "serie");

		serie.selectAll("rect")
			.data(function(d) { return d.data; })
			.enter().append("rect")
			.attr("width", bar_width)
			.attr("x", function(d) { return x(d.hour)+(bar_width*data_types.indexOf(d.type)); })
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return height - y(d.value); })
			.style("fill", function(d) { return color(d.type); })
			.attr("class","tooltip")
			.attr("title",function(d){
					let mh_from=moment().hours(d.hour).minutes(0).format("LT");
					let mh_to=moment().hours(d.hour).minutes(59).format("LT");
					let mh_str=" "+mh_from+" - "+mh_to;
					let yt_str="";
					let ii=data_types.indexOf(d.type);
					if((ii<=1)&&is_today){
						yt_str=_bundleCW.GetStringFromName("ThunderStats.TimeGraph.today")
					}else{
						if((ii>1)||(!is_today)){
							yt_str=_bundleCW.GetStringFromName("ThunderStats.TimeGraph.yesterday")
						}
					}
					return yt_str+mh_str+"<br/>"+_bundleCW.GetStringFromName("ThunderStats.TimeGraph."+d.type)+": "+d.value;
                })
		    .on('mouseover',function() {
				d3.select(this)
				  .transition()
				  .duration(500)
				  .style('fill','red')
			  })
			  .on('mouseout',function () {
				d3.select(this)
				  .transition()
				  .duration(500)
				  .style("fill", function(d) { return color(d.type); })
			  });

			$jQ('.serie rect.tooltip').tooltipster({debug:false,theme:'tooltipster-light',contentAsHTML:true,arrow:false,position:'top'});

		//Legend
		let legend = svg.selectAll('.legend')
			  .data(data_types)
			  .enter()
			  .append('g')
			  .attr('class', 'legend')
			  .attr('transform', function(d, i) {
				let l_height = legendRectSize + legendSpacing;
				let horz = full_width - legendRectSize - margin.right - 10;
				let vert = i * l_height + 15 + (i>=2?15:0);
				return 'translate(' + horz + ',' + vert + ')';
			  });

		legend.append('rect')
		  .attr('width', legendRectSize)
		  .attr('height', legendRectSize)
		  .style('fill', color)
		  .style('stroke', color)
		  /*.attr('class',function(d,i){
			  	return (i>=2?"yday_hours":"tday_hours");
			  })*/;

		legend.append('text')
		  .text(function(d) {
				return _bundleCW.GetStringFromName("ThunderStats.TimeGraph."+d);
			  })
		  .attr('transform', function(d, i) {
				let l_height = legendRectSize + legendSpacing;
				let horz = legendRectSize + 3;
				let vert = l_height/2;
				return 'translate(' + horz + ',' + vert + ')';
			  })
			.attr('height', legendRectSize);

		//Legend "Today" title
		let legend_day_title_today=svg.selectAll('.legend_day_title')
			.data(color.domain())
			.enter()
			.append('g')
			.attr('class', 'legend_day_title')
			.append('text')
			.text(
			 function(d, i) {
				if((i==0)&&is_today){
					return _bundleCW.GetStringFromName("ThunderStats.TimeGraph.today")
				}else{
					if((i==2)||(!is_today&&i==0)){
						return _bundleCW.GetStringFromName("ThunderStats.TimeGraph.yesterday")
					}
				}
				return "";
			 })
			.attr('transform',
				function(d,i){
					let ldt_horz = full_width - legendRectSize - margin.right - 10;
					let ldt_vert = i * (legendRectSize + legendSpacing) + 10 + (i>=2?15:0);
					return 'translate(' + ldt_horz + ',' + ldt_vert + ')'
				}
			);

/*		 let focus = svg.append("g")
					  .attr("class", "focus")
					  .style("display", "none");

		  focus.append("circle")
			  .attr("r", 2.5);

		  focus.append("text")
			  .attr("x", 9)
			  .attr("dy", ".35em");

		  svg.append("rect")
			  .attr("class", "overlay")
			  .attr("width", width)
			  .attr("height", height)
			  .on("mouseover", function() { focus.style("display", null); })
			  .on("mouseout", function() { focus.style("display", "none"); })
			  .on("mousemove", mousemove);

		let bisectDate = d3.bisector(function(d) { return d.hour; }).left;

		  function mousemove() {
			let x0 = x.invert(d3.mouse(this)[0]),
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = x0 - d0.value > d1.value - x0 ? d1 : d0;
			focus.attr("transform", "translate(" + x(d.data.hour) + "," + y(d.data.value) + ")");
			focus.select("text").text(d.data.value);
		  }*/

	},

};
