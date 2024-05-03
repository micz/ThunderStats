Synchronous read: <?xml version="1.0"?>
<?xml-stylesheet href="chrome://global/skin/" type="text/css"?>
<?xml-stylesheet href="chrome://messenger/skin/preferences/preferences.css" type="text/css" ?>
<?xml-stylesheet href="chrome://thunderstats/content/css/mzts-settings.css" type="text/css"?>
<!DOCTYPE dialog SYSTEM "chrome://thunderstats/locale/settings.dtd">


<dialog id="ThunderStats_Settings"
  xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
  title="&ThunderStats.SettingsTitle; Test 5" >

  <!-- onload="miczThunderStatsPrefPanel.onLoad();"> -->


  <prefpane id="ThunderStats_PrefPane">

  <!-- 
  	<preferences>
		<preference id="ThunderStats.identities_selector"
        name="extensions.ThunderStats.identities_selector"
        type="bool"/>
        <preference id="ThunderStats.inbox_search_only_curr_account"
        name="extensions.ThunderStats.inbox_search_only_curr_account"
        type="bool"/>
        <preference id="ThunderStats.global_update"
        name="extensions.ThunderStats.global_update"
        type="bool"/>
      	<preference id="ThunderStats.debug"
        name="extensions.ThunderStats.debug"
        type="bool"/>
        <preference id="ThunderStats.debug_warn_show"
        name="extensions.ThunderStats.debug_warn_show"
        type="bool"/>
        <preference id="ThunderStats.folderspreadgraph_openinfirsttab"
        name="extensions.ThunderStats.folderspreadgraph_openinfirsttab"
        type="bool"/>
        <preference id="ThunderStats.today_time_graph_show_yesterday"
        name="extensions.ThunderStats.today_time_graph_show_yesterday"
        type="bool"/>
        <preference id="ThunderStats.today_time_graph_progressive"
        name="extensions.ThunderStats.today_time_graph_progressive"
        type="bool"/>
        <preference id="ThunderStats.aggregate_average_not_rounded"
        name="extensions.ThunderStats.aggregate_average_not_rounded"
        type="bool"/>
        <preference id="ThunderStats.many_days"
        name="extensions.ThunderStats.many_days"
        type="int"/>
        <preference id="ThunderStats.many_days_small_labels"
        name="extensions.ThunderStats.many_days_small_labels"
        type="bool"/>
        <preference id="ThunderStats.bday.use_last_business_day"
        name="extensions.ThunderStats.bday.use_last_business_day"
        type="bool"/>
        <preference id="ThunderStats.bday.easter"
        name="extensions.ThunderStats.bday.easter"
        type="bool"/>
        <preference id="ThunderStats.bday.weekday0"
        name="extensions.ThunderStats.bday.weekday0"
        type="bool"/>
        <preference id="ThunderStats.bday.weekday1"
        name="extensions.ThunderStats.bday.weekday1"
        type="bool"/>
        <preference id="ThunderStats.bday.weekday2"
        name="extensions.ThunderStats.bday.weekday2"
        type="bool"/>
        <preference id="ThunderStats.bday.weekday3"
        name="extensions.ThunderStats.bday.weekday3"
        type="bool"/>
        <preference id="ThunderStats.bday.weekday4"
        name="extensions.ThunderStats.bday.weekday4"
        type="bool"/>
        <preference id="ThunderStats.bday.weekday5"
        name="extensions.ThunderStats.bday.weekday5"
        type="bool"/>
        <preference id="ThunderStats.bday.weekday6"
        name="extensions.ThunderStats.bday.weekday6"
        type="bool"/>
	<preference id="ThunderStats.customquery_bookmark_immediate_update"
        name="extensions.ThunderStats.customquery_bookmark_immediate_update"
        type="bool"/>
    <preference id="ThunderStats.customquery_default_only_bd"
        name="extensions.ThunderStats.customquery_default_only_bd"
        type="bool"/>
	<preference id="ThunderStats.involved_num"
        name="extensions.ThunderStats.involved_num"
        type="int"/>
	<preference id="ThunderStats.involvedtable_forceidentityname"
        name="extensions.ThunderStats.involvedtable_forceidentityname"
        type="bool"/>
    </preferences>
 -->
 
     <tabbox id="ts_tabbox">
      <tabs>
        <tab label="&ThunderStats.TabSettings.label;"/>
        <tab label="&ThunderStats.TabAdvanced.label;"/>
        <tab label="&ThunderStats.TabBusinessDays.label;"/>
        <tab label="&ThunderStats.TabCustomIdentities.label;"/>
        <tab label="&ThunderStats.TabInfo.label;"/>
      </tabs>
      <tabpanels>
        <tabpanel id="tstab" orient="vertical">
          <label control="symbol" value="&ThunderStats.GlobalDescSettingTab;"/>
          <label control="symbol" value=" "/>
            <grid flex="1">
			  <columns>
				<column flex="1"/>
				<column flex="10"/>
			  </columns>
			  <rows>
				<row align="center">
				  <label control="symbol" value="&ThunderStats.StartupAccount;:"/>
				  <menulist id="ts_strt_accnt" value="&ThunderStats.ChooseAccount;" oncommand="miczThunderStatsPrefPanel.onDefaultAccountChange();">
					  <menupopup>
					 </menupopup>
					</menulist>
				</row>
				<label control="symbol" value=" "/>
				 <checkbox id="ThunderStats.identities_selector_checkbox" label="&ThunderStats.ShowIdentitiesAccountsSelector; (*)"
            		preference="ThunderStats.identities_selector" />
            	<hbox><checkbox class="mzts-checkbox_no_border" id="ThunderStats.inbox_search_only_curr_account_checkbox" preference="ThunderStats.inbox_search_only_curr_account" />
            		<vbox><label control="symbol" class="mzts-label_no_border" value="&ThunderStats.InboxSearchOnlyCurrAccount;"/>
            		<label control="symbol" class="mzts-label_no_border mzts-warn" value="&ThunderStats.InboxSearchOnlyCurrAccount.GlobaInboxWarn;"/></vbox></hbox>
				<checkbox id="ThunderStats.global_update_checkbox" label="&ThunderStats.GlobalUpdate;"
            		preference="ThunderStats.global_update" />
            	<checkbox id="ThunderStats.today_time_graph_show_yesterday_checkbox" label="&ThunderStats.TodayTimeGraphShowYesterday;"
            		preference="ThunderStats.today_time_graph_show_yesterday" />
            	<checkbox id="ThunderStats.today_time_graph_progressive_checkbox" label="&ThunderStats.TodayTimeGraphProgressive;"
            		preference="ThunderStats.today_time_graph_progressive" />
            	<checkbox id="ThunderStats.aggregate_average_not_rounded_checkbox" label="&ThunderStats.AggregateAverageNotRounded;"
            		preference="ThunderStats.aggregate_average_not_rounded" />
            	<checkbox id="ThunderStats.folderspreadgraph_openinfirsttab_checkbox" label="&ThunderStats.folderspreadgraph_openinfirsttab;"
            		preference="ThunderStats.folderspreadgraph_openinfirsttab" />
            	<checkbox id="ThunderStats.involvedtable_forceidentityname_checkbox" label="&ThunderStats.involvedtable_forceidentityname;"
            		preference="ThunderStats.involvedtable_forceidentityname" />
			  </rows>
		</grid>
          <label control="symbol" value=" "/>
          <label control="symbol" value=" "/>
          <label control="symbol" value="* &ThunderStats.ReopenTabDesc;"/>
        </tabpanel>
		<tabpanel id="tstab_advanced" orient="vertical">
          <label control="symbol" value="&ThunderStats.GlobalDescSettingTab;"/>
          <label control="symbol" value=" "/>
            <grid flex="1">
			  <columns>
				<column flex="1"/>
				<column flex="10"/>
			  </columns>
			  <rows>
            	<groupbox>
  				<caption label="&ThunderStats.ManyDaysGraph;"/>
					<hbox align="center">
						<textbox id="ThunderStats.many_days_textfield" maxlength="2" class="mzts-tbox" preference="ThunderStats.many_days"/>
						<label control="symbol" value="&ThunderStats.ManyDays;"/>
					</hbox>
					<checkbox id="ThunderStats.many_days_small_labels_checkbox" label="&ThunderStats.ManyDaysSmallLabels;"
            		preference="ThunderStats.many_days_small_labels" />
            		<label control="symbol" value="(&ThunderStats.ManyDaysSmallLabels_2;)"/>
            		<hbox align="center">
						<textbox id="ThunderStats.involved_num_textfield" maxlength="2" class="mzts-tbox" preference="ThunderStats.involved_num"/>
						<label control="symbol" value="&ThunderStats.InvolvedNum;"/>
					</hbox>
				</groupbox>
				<groupbox>
  				<caption label="&ThunderStats.CustomQryTabGroupbox;"/>
					<checkbox id="ThunderStats.customquery_default_only_bd" label="&ThunderStats.CustomQueryDefaultOnlyBD;"
            		preference="ThunderStats.customquery_default_only_bd" />
            		<checkbox id="ThunderStats.customquery_bookmark_immediate_update" label="&ThunderStats.CustomQueryBookmarkImmediateUpdate;"
            		preference="ThunderStats.customquery_bookmark_immediate_update" />
				</groupbox>
            <label control="symbol" value=" "/>
			  </rows>
		</grid>
		    <checkbox id="ThunderStats.debug_checkbox" label="&ThunderStats.ActivateDebug;" preference="ThunderStats.debug" />
		    <checkbox id="ThunderStats.debug_warn_show_checkbox" label="&ThunderStats.DebugWarnShow;" preference="ThunderStats.debug_warn_show" />
		     <button id="runDebuggerBtn"
                  label="&ThunderStats.runDebuggerBtn.label;"
                  oncommand="miczThunderStatsUtils.runDebugger(window,'settings');"/>
          <label control="symbol" value=" "/>
          <label control="symbol" value=" "/>
          <label control="symbol" value="* &ThunderStats.ReopenTabDesc;"/>
        </tabpanel>
        <tabpanel id="tstab_bdays" orient="vertical">
			<checkbox id="ThunderStats.bday.use_last_business_day_checkbox" preference="ThunderStats.bday.use_last_business_day" label="&ThunderStats.UseLastBusinessDay;"/>
			<label control="symbol" value=" "/>
			<groupbox>
  				<caption label="&ThunderStats.WeekDays.groupbox;"/>
  				<label control="symbol" value="&ThunderStats.WeekDays.desc;"/>
  			<hbox>
			<vbox>
				<checkbox id="weekday1" preference="ThunderStats.bday.weekday1" label="&ThunderStats.WeekDayMon;"/>
				<checkbox id="weekday2" preference="ThunderStats.bday.weekday2" label="&ThunderStats.WeekDayTue;"/>
				<checkbox id="weekday3" preference="ThunderStats.bday.weekday3" label="&ThunderStats.WeekDayWed;"/>
			</vbox>
			<vbox>
				<checkbox id="weekday4" preference="ThunderStats.bday.weekday4" label="&ThunderStats.WeekDayThu;"/>
				<checkbox id="weekday5" preference="ThunderStats.bday.weekday5" label="&ThunderStats.WeekDayFri;"/>
				<checkbox id="weekday6" preference="ThunderStats.bday.weekday6" label="&ThunderStats.WeekDaySat;"/>
				<checkbox id="weekday0" preference="ThunderStats.bday.weekday0" label="&ThunderStats.WeekDaySun;"/>
			</vbox>
			</hbox>
			</groupbox>
			<groupbox>
  				<caption label="&ThunderStats.NoBusinessDaysList.groupbox;"/>
			 <hbox>
			<listbox id="ThunderStats.NoBusinessDaysList" flex="1" height="200px" onselect="miczThunderStatsPrefPanel.updateNBDButtons(window);" seltype="single">
			 <listcols>
				<listcol flex="1"/>
				<listcol flex="1"/>
			</listcols>
            <listhead>
              <listheader id="NoBusinessDayDate" label="&ThunderStats.ListHeader.Date;"/>
              <listheader id="NoBusinessDayDesc" label="&ThunderStats.ListHeader.Desc;"/>
            </listhead>
          </listbox>
          <vbox>
			  <button id="newButtonNBD"
                  label="&ThunderStats.newButtonNBD.label;"
                  oncommand="miczThunderStatsPrefPanel.onNewNBDDate();"/>
          <button id="editButtonNBD" label="&ThunderStats.editButtonNBD.label;"
                  oncommand="miczThunderStatsPrefPanel.onEditNBDDate();" disabled="true"/>
          <button id="deleteButtonNBD"
                  label="&ThunderStats.deleteButtonNBD.label;"
                  oncommand="miczThunderStatsPrefPanel.onDeleteNBDDate();" disabled="true"/>
          </vbox>
          </hbox>
          <checkbox id="ThunderStats.EasterNoBusinessDay" preference="ThunderStats.bday.easter" label="&ThunderStats.EasterNoBusinessDay.label;"/>
          </groupbox>
		</tabpanel>
        <tabpanel id="tstab_cstmids" orient="vertical">
		  <label control="symbol" value="&ThunderStats.ManageCustomIdentitites;"/>
          <description class="mzts-desc">&ThunderStats.ManageCustomIdentititesDesc;</description>
          <label control="symbol" value=" "/>
          <grid flex="1">
			  <columns>
				<column flex="1"/>
				<column flex="10"/>
			  </columns>
			  <rows>
				<row align="center">
				  <label control="symbol" value="&ThunderStats.Account;:"/>
				  <menulist id="ts_accnt_lst" value="&ThunderStats.ChooseAccount;" oncommand="miczThunderStatsPrefPanel.onCIAccountChange();">
					<menupopup>
					  <menuitem label="&ThunderStats.ChooseAccount;" value="0" />
					 </menupopup>
					</menulist>
				</row>
			<vbox><label control="symbol" value="&ThunderStats.CustomIdentititesAccount;"/>
		  		<textbox id="ts_cstmids" value="" multiline="true" rows="5" onblur="miczThunderStatsPrefPanel.onCIAccountTextbox();"/>
		  		<label control="symbol" value="&ThunderStats.CustomIdentititesAccount.Info;"/>
		  	</vbox>
			  </rows>
		</grid>
		  <label control="symbol" value="&ThunderStats.ChangesSavedWarn;"/>
          <label control="symbol" value="&ThunderStats.ReopenTabDesc;"/>
        </tabpanel>
        <tabpanel id="tstab_info" orient="vertical">
	  <description class="mzts-desc-big">&ThunderStats.InfoMainDesc;</description>
        <label control="symbol" value=" "/>
	  	<label value="&ThunderStats.DonateLink;" class="text-link mzts-donate" href="http://micz.it/thunderdbird-addon-thunderstats-your-thunderbird-statistics/donate/"/>
	  	<label control="symbol" value=" "/>
		<hbox align="right"><button label="&ThunderStats.ReleaseNotes;" oncommand="miczThunderStatsPrefPanel.loadInfoFile('release_notes');" type="radio" group="btn_info_tab" checked="true"/> <button label="&ThunderStats.License;" oncommand="miczThunderStatsPrefPanel.loadInfoFile('license');" type="radio" group="btn_info_tab"/></hbox>
	  	<textbox id="mzts-release-notes" class="release-notes-text" value="Loading..." multiline="true" readonly="true" flex="7"/>
        </tabpanel>
      </tabpanels>
    </tabbox>
  </prefpane>
  <script type="application/x-javascript" src="chrome://thunderstats/content/mzts-settings.js" />
  <script type="application/x-javascript" src="chrome://thunderstats/content/jslib/moment-with-locales.js" />
</dialog>

Preferences.addAll([
{ id: "ThunderStats.identities_selector", name: "extensions.ThunderStats.identities_selector", type: "bool" },
{ id: "ThunderStats.inbox_search_only_curr_account", name: "extensions.ThunderStats.inbox_search_only_curr_account", type: "bool" },
{ id: "ThunderStats.global_update", name: "extensions.ThunderStats.global_update", type: "bool" },
{ id: "ThunderStats.debug", name: "extensions.ThunderStats.debug", type: "bool" },
{ id: "ThunderStats.debug_warn_show", name: "extensions.ThunderStats.debug_warn_show", type: "bool" },
{ id: "ThunderStats.folderspreadgraph_openinfirsttab", name: "extensions.ThunderStats.folderspreadgraph_openinfirsttab", type: "bool" },
{ id: "ThunderStats.today_time_graph_show_yesterday", name: "extensions.ThunderStats.today_time_graph_show_yesterday", type: "bool" },
{ id: "ThunderStats.today_time_graph_progressive", name: "extensions.ThunderStats.today_time_graph_progressive", type: "bool" },
{ id: "ThunderStats.aggregate_average_not_rounded", name: "extensions.ThunderStats.aggregate_average_not_rounded", type: "bool" },
{ id: "ThunderStats.many_days", name: "extensions.ThunderStats.many_days", type: "int" },
{ id: "ThunderStats.many_days_small_labels", name: "extensions.ThunderStats.many_days_small_labels", type: "bool" },
{ id: "ThunderStats.bday.use_last_business_day", name: "extensions.ThunderStats.bday.use_last_business_day", type: "bool" },
{ id: "ThunderStats.bday.easter", name: "extensions.ThunderStats.bday.easter", type: "bool" },
{ id: "ThunderStats.bday.weekday0", name: "extensions.ThunderStats.bday.weekday0", type: "bool" },
{ id: "ThunderStats.bday.weekday1", name: "extensions.ThunderStats.bday.weekday1", type: "bool" },
{ id: "ThunderStats.bday.weekday2", name: "extensions.ThunderStats.bday.weekday2", type: "bool" },
{ id: "ThunderStats.bday.weekday3", name: "extensions.ThunderStats.bday.weekday3", type: "bool" },
{ id: "ThunderStats.bday.weekday4", name: "extensions.ThunderStats.bday.weekday4", type: "bool" },
{ id: "ThunderStats.bday.weekday5", name: "extensions.ThunderStats.bday.weekday5", type: "bool" },
{ id: "ThunderStats.bday.weekday6", name: "extensions.ThunderStats.bday.weekday6", type: "bool" },
{ id: "ThunderStats.customquery_bookmark_immediate_update", name: "extensions.ThunderStats.customquery_bookmark_immediate_update", type: "bool" },
{ id: "ThunderStats.customquery_default_only_bd", name: "extensions.ThunderStats.customquery_default_only_bd", type: "bool" },
{ id: "ThunderStats.involved_num", name: "extensions.ThunderStats.involved_num", type: "int" },
{ id: "ThunderStats.involvedtable_forceidentityname", name: "extensions.ThunderStats.involvedtable_forceidentityname", type: "bool" },
]);

