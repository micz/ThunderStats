// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { tsTheme } from '@statslib/mzts-theme.js';
import { tsStore } from '@statslib/mzts-store';

const root = () => document.documentElement.getAttribute('data-theme');

beforeEach(() => {
  tsTheme._media = { matches: false, addEventListener() {} };    // system in light mode
  tsTheme.apply('light');
});

describe('tsTheme', () => {
  it('applies the mode to the store and to the root element', () => {
    tsTheme.apply('dark');
    expect([tsStore.theme_mode, tsStore.darkmode, root()]).toEqual(['dark', true, 'dark']);
  });

  it('auto follows the system color scheme', () => {
    tsTheme.media.matches = true;
    tsTheme.apply('auto');
    expect([tsStore.theme_mode, tsStore.darkmode, root()]).toEqual(['auto', true, 'dark']);
  });

  it('an unknown mode falls back to auto', () => {
    tsTheme.apply('sepia');
    expect([tsStore.theme_mode, root()]).toEqual(['auto', 'light']);
  });

  it('setMode saves the pref', async () => {
    await tsTheme.setMode('dark');
    expect(await browser.storage.sync.get('theme_mode')).toEqual({ theme_mode: 'dark' });
  });
});

describe('ThemeToggle', () => {
  it('switches between light and dark and saves the choice', async () => {
    let wrapper = mount(ThemeToggle);
    let button = wrapper.get('button');
    expect(button.attributes('title')).toBe('ThemeDark');    // names the theme the click switches to

    await button.trigger('click');
    await flushPromises();
    expect(root()).toBe('dark');
    expect(button.classes()).toContain('is-dark');
    expect(button.attributes('title')).toBe('ThemeLight');
    expect((await browser.storage.sync.get('theme_mode')).theme_mode).toBe('dark');

    await button.trigger('click');
    expect(root()).toBe('light');
  });
});
