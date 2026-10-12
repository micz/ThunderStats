// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive, nextTick } from 'vue';
import OptSwitch from '@/components/options/OptSwitch.vue';
import OptRow from '@/components/options/OptRow.vue';
import OptNumber from '@/components/options/OptNumber.vue';
import OptTagInput from '@/components/options/OptTagInput.vue';

// The 'optPrefs' object provided by OptionsView
function optPrefs(values) {
  let prefs = { values: reactive(values), set: vi.fn((key, value) => { prefs.values[key] = value; }) };
  return prefs;
}

function withPrefs(prefs) {
  return { global: { provide: { optPrefs: prefs } } };
}

describe('OptSwitch', () => {
  it('toggles the value and exposes it as a switch', async () => {
    let wrapper = mount(OptSwitch, { props: { modelValue: false, label: 'Dark' } });
    let button = wrapper.get('button');
    expect(button.attributes()).toMatchObject({ role: 'switch', 'aria-checked': 'false', 'aria-label': 'Dark' });
    await button.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
    await wrapper.setProps({ modelValue: true });
    expect(button.classes()).toContain('is-on');
    await button.trigger('click');
    expect(wrapper.emitted('update:modelValue')[1]).toEqual([false]);
  });

  it('does nothing when disabled', async () => {
    let wrapper = mount(OptSwitch, { props: { modelValue: false, disabled: true } });
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});

describe('OptRow', () => {
  it('a boolean pref renders a switch bound to the option', async () => {
    let prefs = optPrefs({ show_tags: true });
    let wrapper = mount(OptRow, { props: { label: 'Show tags', hint: 'In every tab', pref: 'show_tags' }, ...withPrefs(prefs) });
    expect(wrapper.get('.opt-row-label').text()).toBe('Show tags');
    expect(wrapper.get('.opt-row-hint').text()).toBe('In every tab');
    expect(wrapper.get('button').attributes('aria-checked')).toBe('true');
    await wrapper.get('button').trigger('click');
    expect(prefs.set).toHaveBeenCalledWith('show_tags', false);
    expect(wrapper.emitted('change')).toEqual([[false]]);
    expect(wrapper.get('button').attributes('aria-checked')).toBe('false');
  });

  it('without a pref the control comes from the slot', () => {
    let wrapper = mount(OptRow, {
      props: { label: 'Days' },
      slots: { default: '<input class="custom"/>', hint: '<b>bold hint</b>' },
      ...withPrefs(optPrefs({})),
    });
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.find('.opt-row-control .custom').exists()).toBe(true);
    expect(wrapper.get('.opt-row-hint').html()).toContain('<b>bold hint</b>');
  });

  it('shows the disabled state', () => {
    let wrapper = mount(OptRow, { props: { label: 'x', pref: 'a', disabled: true }, ...withPrefs(optPrefs({ a: false })) });
    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.get('button').attributes()).toHaveProperty('disabled');
  });
});

describe('OptNumber', () => {
  function mountNumber(value = 7) {
    let prefs = optPrefs({ _many_days: value });
    let wrapper = mount(OptNumber, { props: { pref: '_many_days', min: 2, max: 30, label: 'Days' }, ...withPrefs(prefs) });
    return { prefs, wrapper, input: wrapper.get('input') };
  }

  it('shows the stored value', () => {
    let { input } = mountNumber();
    expect(input.element.value).toBe('7');
    expect(input.attributes()).toMatchObject({ min: '2', max: '30', 'aria-label': 'Days' });
  });

  it('saves the valid values while typing, debounced', async () => {
    let { prefs, input } = mountNumber();
    await input.setValue('12');
    expect(prefs.set).toHaveBeenCalledWith('_many_days', 12, true);
  });

  it('does not save the invalid values while typing', async () => {
    let { prefs, input } = mountNumber();
    for (let value of ['1', '31', '4.5', '']) {
      input.element.value = value;
      await input.trigger('input');
    }
    expect(prefs.set).not.toHaveBeenCalled();
  });

  it.each([
    ['99', 30],
    ['0', 2],
    ['4.6', 5],
    ['', 7],     // empty field: back to the stored value
  ])('on blur "%s" is saved as %i', async (typed, saved) => {
    let { prefs, input } = mountNumber();
    input.element.value = typed;
    await input.trigger('change');
    expect(prefs.set).toHaveBeenLastCalledWith('_many_days', saved);
    expect(input.element.value).toBe(String(saved));
  });

  it('follows a value changed elsewhere', async () => {
    let { prefs, input } = mountNumber();
    prefs.values._many_days = 21;
    await nextTick();
    expect(input.element.value).toBe('21');
  });
});

describe('OptTagInput', () => {
  const isEmail = (v) => /^[^@\s]+@[^@\s]+$/.test(v);

  function mountTags(modelValue = ['a@x.it']) {
    let wrapper = mount(OptTagInput, {
      props: {
        modelValue, validate: isEmail, invalidMessage: 'Not an address', placeholder: 'Add',
        'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }),
      },
    });
    return { wrapper, input: wrapper.get('input') };
  }

  const values = (wrapper) => wrapper.findAll('.opt-tag').map(t => t.text().trim());

  it('adds the typed entry on Enter and on comma', async () => {
    let { wrapper, input } = mountTags();
    await input.setValue('b@y.com');
    await input.trigger('keydown', { key: 'Enter' });
    await input.setValue('c@z.org');
    await input.trigger('keydown', { key: ',' });
    expect(values(wrapper)).toEqual(['a@x.it', 'b@y.com', 'c@z.org']);
    expect(input.element.value).toBe('');
  });

  it('adds on blur and ignores the duplicates, ignoring the case', async () => {
    let { wrapper, input } = mountTags();
    await input.setValue('A@X.IT b@y.com b@y.com');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a@x.it', 'b@y.com']]]);
  });

  it('keeps the invalid entries in the field with the message', async () => {
    let { wrapper, input } = mountTags();
    await input.setValue('b@y.com, nope, bad');
    await input.trigger('keydown', { key: 'Enter' });
    expect(values(wrapper)).toEqual(['a@x.it', 'b@y.com']);
    expect(input.element.value).toBe('nope, bad');
    expect(wrapper.get('.opt-tags-error').text()).toBe('Not an address');
  });

  it('splits a pasted list', async () => {
    let { wrapper, input } = mountTags([]);
    await input.trigger('paste', { clipboardData: { getData: () => 'b@y.com\nc@z.org' } });
    expect(values(wrapper)).toEqual(['b@y.com', 'c@z.org']);
  });

  it('removes with the button and with Backspace on the empty field', async () => {
    let { wrapper, input } = mountTags(['a@x.it', 'b@y.com', 'c@z.org']);
    await wrapper.findAll('.opt-tag-remove')[0].trigger('click');
    expect(values(wrapper)).toEqual(['b@y.com', 'c@z.org']);
    await input.trigger('keydown', { key: 'Backspace' });
    expect(values(wrapper)).toEqual(['b@y.com']);
    expect(wrapper.get('.opt-tag-remove').attributes('aria-label')).toBe('Remove b@y.com');
  });

  it('marks the stored invalid entries', () => {
    let { wrapper } = mountTags(['a@x.it', 'broken']);
    let invalid = wrapper.findAll('.opt-tag.is-invalid');
    expect(invalid.map(t => t.text().trim())).toEqual(['broken']);
    expect(invalid[0].attributes('title')).toBe('Not an address');
  });
});
