<!--
/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024  Mic (m@micz.it)

 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
-->

<template>
<div class="square_container">
    <div class="square_item"><div class="list_heading_wrapper"><h2 class="list_heading cropped lowercase">__MSG_AboutTitle__</h2></div>
        <p>__MSG_AboutText_1__<br/>
            __MSG_AboutText_2__</p>
			<p><span class="info_subtitle">__MSG_HowDoesItWorkSubtitle__</span><br>
			__MSG_OtherInfoText_1__<br>
			__MSG_OtherInfoText_2b__</p>
			<p><span class="info_subtitle">__MSG_PrivacySubtitle__</span><br>
			__MSG_PrivacyInfoText_1__</p>
		<p><i>__MSG_AboutText_3__: <a href="https://github.com/micz/ThunderStats/issues">__MSG_clickhere__</a>!</i></p></div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_InboxZeroTitle__</h2>
					  </div>
					  <p>__MSG_InboxZeroText_1__</p>
						<p>__MSG_InboxZeroText_2__</p>
						<p><i><a href="http://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/what-is-inbox-0/">__MSG_clickheremoreinfo__</a></i></p>
						<p>&nbsp;</p>
						<h2 class="list_heading cropped">About ThunderStats 1.9 for Thunderbird 115</h2>
						<p>The new ThunderStats 2.0 was released in July 2024, exclusively for Thunderbird versions above 125. Since there are still many users using version 115, it was decided to release this version 1.9 compatible with Thunderbird 115. Please note that this version is slightly slower in processing statistics compared to version 2.0, which uses new Thunderbird features available only in the newer versions.</p>
					</div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_ImportantInfoTitle__</h2>
					  </div>
					  <p><span class="info_subtitle">__MSG_ImportantInfoSubtitle_1__</span><br>
						__MSG_ImportantInfoText_1__ __MSG_ImportantInfoText_1b__</p>
						<p><span class="info_subtitle">__MSG_ImportantInfoSubtitle_2__</span><br>
							__MSG_ImportantInfoText_2__<br>
						<i><a href="http://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/translate/">__MSG_ImportantInfoText_2b__</a></i></p></div>
    <div class="square_item"><div class="list_heading_wrapper">
						<h2 class="list_heading cropped">__MSG_DonationsTitle__</h2>
					  </div>
					  <p>__MSG_InfoMainDesc__</p>
					  <p><i><a class="outlink" href="http://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/donate/">__MSG_DonateLink__</a></i></p></div>
					  <div id="thstats_ver_info">__MSG_Version__: {{ thstats_version }}</div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'

const thstats_version = ref("");

onMounted(() => {
  const manifest = browser.runtime.getManifest();
  const version = manifest.version;
  thstats_version.value = version;
});

</script>


<style scoped>

</style>