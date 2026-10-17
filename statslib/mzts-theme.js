/*
 *  ThunderStats [https://micz.it/thunderbird-addon-thunderstats-your-thunderbird-statistics/]
 *  Copyright (C) 2024 - 2026 Mic (m@micz.it)

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

import { tsStore } from "./mzts-store.js";
import { tsPrefs } from "./mzts-options.js";

// Theme handling: the 'theme_mode' pref is 'auto' (follow the system color scheme),
// 'light' or 'dark'. The effective theme is written to tsStore.darkmode and to the
// data-theme attribute of the root element, which drives all the CSS color tokens.

const THEME_MODES = ['auto', 'light', 'dark'];

export const tsTheme = {

    // the system color scheme query, read at the first use (so the module can be imported without a DOM)
    _media: undefined,
    get media() {
        if(this._media === undefined) {
            this._media = (typeof window !== 'undefined' && window.matchMedia) ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        }
        return this._media;
    },

    async init() {
        let mode = await tsPrefs.getPref("theme_mode");
        this.apply(mode);
        if(this.media) {
            this.media.addEventListener('change', () => {
                if(tsStore.theme_mode === 'auto') this.apply('auto');
            });
        }
        // Keep every open ThunderStats page in sync when the pref changes elsewhere
        browser.storage.onChanged.addListener((changes, area) => {
            if((area === 'sync') && changes.theme_mode) {
                this.apply(changes.theme_mode.newValue);
            }
        });
    },

    apply(mode) {
        if(!THEME_MODES.includes(mode)) mode = 'auto';
        let is_dark = (mode === 'dark') || ((mode === 'auto') && !!this.media && this.media.matches);
        tsStore.theme_mode = mode;
        tsStore.darkmode = is_dark;
        document.documentElement.setAttribute('data-theme', is_dark ? 'dark' : 'light');
    },

    async setMode(mode) {
        this.apply(mode);
        await tsPrefs.setPref("theme_mode", tsStore.theme_mode);
    },
};
