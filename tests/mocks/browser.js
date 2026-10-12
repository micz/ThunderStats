// In-memory stand-in for the Thunderbird WebExtension API (globalThis.browser / messenger).
// Only the parts used by statslib are implemented; tests fill the data through the returned object.

export function createBrowserMock() {
  const storage = {};

  const mock = {
    storage: {
      sync: {
        // Same contract as the real API: an object argument gives the defaults for the missing keys
        async get(keys) {
          if (keys == null) return structuredClone(storage);
          if (typeof keys === 'string') keys = [keys];
          let output = {};
          if (Array.isArray(keys)) {
            for (let key of keys) {
              if (key in storage) output[key] = structuredClone(storage[key]);
            }
          } else {
            for (let key in keys) {
              output[key] = key in storage ? structuredClone(storage[key]) : keys[key];
            }
          }
          return output;
        },
        async set(values) {
          Object.assign(storage, structuredClone(values));
        },
      },
      onChanged: { addListener() {}, removeListener() {} },
    },
    i18n: {
      // "key" or "key[sub1|sub2]", so the assertions stay readable without the locale files
      getMessage(key, subs) {
        if (subs === undefined || subs === null) return key;
        let list = Array.isArray(subs) ? subs : [subs];
        return key + '[' + list.join('|') + ']';
      },
      getUILanguage() {
        return 'en-US';
      },
    },
  };

  return mock;
}
