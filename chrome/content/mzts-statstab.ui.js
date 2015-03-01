"use strict";

miczThunderStatsTab.ui={

	showLoadingElement:function(element){
		$jQ("#"+element).show();
	},

	hideLoadingElement:function(element){
		$jQ("#"+element).hide();
	},

	updateTab:function(tab_id){
		switch(tab_id){
			case '#tab_today':
				miczThunderStatsDB.init();
				miczThunderStatsTab.getTodayStats(miczThunderStatsTab.getCurrentIdentityId());
				miczThunderStatsDB.close();
			break;
			case '#tab_yesterday':
				miczThunderStatsDB.init();
				miczThunderStatsTab.getYesterdayStats(miczThunderStatsTab.getCurrentIdentityId());
				miczThunderStatsDB.close();
			break;
		}
	},

	openPrefWindow: function () {
		window.openDialog('chrome://thunderstats/content/mzts-settings.xul','ThunderStats_Settings','non-private,chrome,titlebar,dialog=no,resizable,centerscreen').focus();
	} ,

	tooltip: function(aEvent, aShow) {
		// Need to handle tooltips manually in xul-embedded-in-xhtml; tooltip
		// element cannot be in the xhtml document either.
		var tooltip = document.getElementById("mztsXulInXhtmlTooltip");
		var tooltipdelay = parseInt(aEvent.target.getAttribute("tooltipdelay"));
		tooltipdelay = isNaN(tooltipdelay) ? 800 : tooltipdelay;
		if (aShow == 'show') {
		  this.tiptimer = window.setTimeout(function() {
							tooltip.label = aEvent.target.getAttribute("tooltiptext");
							tooltip.openPopup(aEvent.target,
											  "after_start",
											  0, 0, false, false);
						  }, tooltipdelay);
		}
		else if (aShow == 'hide') {
		  window.clearTimeout(this.tiptimer);
		  delete this.tiptimer;
		  tooltip.label = "";
		  tooltip.hidePopup();
		  // Remove focus (for header button, arrow key binding issue).
		  aEvent.target.blur();
		}
	},
};
