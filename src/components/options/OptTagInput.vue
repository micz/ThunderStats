<!--
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
-->

<!-- Tag (chip) input: Enter, comma or leaving the field adds the typed entries; pasted text is split
     on commas and whitespace; duplicates are ignored. Invalid entries stay in the field with a message,
     invalid stored entries are shown with a warning border. -->
<template>
  <div class="opt-tags" :class="'opt-tags-' + variant" @click="input_el.focus()">
    <span class="opt-tag" v-for="item in modelValue" :key="item" :class="{ 'is-invalid': !validate(item) }" :title="validate(item) ? '' : invalidMessage">
      {{ item }}
      <button type="button" class="opt-tag-remove" :title="remove_label" :aria-label="remove_label + ' ' + item" @click.stop="remove(item)">
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg>
      </button>
    </span>
    <input type="text" ref="input_el" v-model="text" :placeholder="placeholder" :aria-label="placeholder" :disabled="disabled" @keydown="onKeydown" @paste="onPaste" @blur="add(text)"/>
  </div>
  <div class="opt-tags-error" v-if="error">{{ error }}</div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  // 'accent' (identities) or 'good' (domains)
  variant: {
    type: String,
    default: 'accent'
  },
  validate: {
    type: Function,
    default: () => true
  },
  invalidMessage: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const remove_label = browser.i18n.getMessage("Remove");

let input_el = ref(null);
let text = ref('');
let error = ref('');

function add(raw) {
  let entries = String(raw).split(/[,\s]+/).map(v => v.trim()).filter(v => v !== '');
  if(entries.length == 0) {
    text.value = '';
    error.value = '';
    return;
  }
  let invalid = entries.filter(v => !props.validate(v));
  let current = [...props.modelValue];
  let current_lower = current.map(v => v.toLowerCase());
  for(let entry of entries) {
    if(!props.validate(entry)) continue;
    if(current_lower.includes(entry.toLowerCase())) continue;
    current.push(entry);
    current_lower.push(entry.toLowerCase());
  }
  if(current.length != props.modelValue.length) emit('update:modelValue', current);
  text.value = invalid.join(', ');
  error.value = invalid.length > 0 ? props.invalidMessage : '';
}

function remove(item) {
  emit('update:modelValue', props.modelValue.filter(v => v !== item));
}

function onKeydown(e) {
  if(e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    add(text.value);
  } else if(e.key === 'Backspace' && text.value === '' && props.modelValue.length > 0) {
    remove(props.modelValue[props.modelValue.length - 1]);
  }
}

function onPaste(e) {
  let pasted = e.clipboardData ? e.clipboardData.getData('text') : '';
  if(!/[,\s]/.test(pasted.trim())) return;
  e.preventDefault();
  add(text.value + pasted);
}
</script>

<style scoped>
.opt-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 7px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  cursor: text;
}

.opt-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 5px 4px 11px;
  border-radius: 14px;
  border: 1px solid transparent;
  font-size: 13px;
  background: var(--accentSoft);
}

.opt-tags-good .opt-tag {
  background: var(--goodSoft);
}

.opt-tag.is-invalid {
  border-color: var(--warn);
}

.opt-tag-remove {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.opt-tag-remove:hover {
  color: var(--warn);
}

.opt-tag-remove svg {
  width: 11px;
  height: 11px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
}

.opt-tags input {
  flex: 1 1 200px;
  min-width: 160px;
  border: 0;
  outline: none;
  padding: 5px 6px;
  font-size: 13px;
  background: transparent;
  color: var(--text);
}

.opt-tags:focus-within {
  border-color: var(--accent);
}

.opt-tags-error {
  font-size: 12.5px;
  color: var(--warn);
}
</style>
