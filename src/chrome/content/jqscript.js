var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');

// Services.console.logStringMessage("JQ script start 2");

    function jq_ready() {
// $jQ(document).ready(function() {
    // Services.console.logStringMessage("JQ script ready ");
    $jQ('.tooltip').tooltipster({
        debug: false,
        theme: 'tooltipster-light'
    });

    $jQ('#cssmenu').prepend('<div id="menu-button">Menu</div>');
    
    $jQ('#cssmenu #menu-button').on('click', function() {
        var menu = $jQ(this).next('ul');
        if (menu.hasClass('open')) {
            menu.removeClass('open');
        } else {
            menu.addClass('open');
        }
    });
    $jQ('.tabs .tab-links a').on('click', function(e) {
        miczThunderStatsTab.currentTab = $jQ(this).attr('href');

        // Show/Hide Tabs
        //$jQ('.tabs ' + miczThunderStatsTab.currentTab).show().siblings().hide();
        let update_tab_callback;
        let _global_update = miczThunderStatsPrefs.getBoolPref_TS('global_update');
        if (_global_update) {
            update_tab_callback = function() {};
        } else {
            update_tab_callback = miczThunderStatsTab.ui.updateTab;
        }
        $jQ('.tabs ' + miczThunderStatsTab.currentTab).fadeIn(400, update_tab_callback).siblings().hide();

        // Change/remove current tab to active
        $jQ(this).parent('li').addClass('active').siblings().removeClass('active');

        //update value
        //miczThunderStatsTab.ui.updateTab(miczThunderStatsTab.currentTab);

        e.preventDefault();
    });
    $jQ('#cssmenu a').on('click', function(e) { //custom query view menu command
        let tscommand = $jQ(this).attr('href');

        if (tscommand != '#nil') {
            miczThunderStatsTab.ui.customQueryViewSelect(tscommand);
        }

        e.preventDefault();
    });

    $jQ('img.tooltip').tooltipster({
        debug: false,
        theme: 'tooltipster-light',
        contentAsHTML: true,
        arrow: false,
        position: 'top'
    });

    // cleidigh
// });
    // Services.console.logStringMessage("JQ script end");
};

function test() {
    Services.console.logStringMessage("JQ script test start");
    const selector_id = "identities_selector";
    let o = document.createElement('option');
        o.setAttribute('value', '3');
        o.textContent = "All Accounts Test"
        document.getElementById(selector_id).appendChild(o);
        
}

function onLoad(e) {
    // Services.console.logStringMessage("stat page ready event handler");
    // test();
    jq_ready();
}
window.addEventListener("load", function(e) { onLoad(e); }, false);