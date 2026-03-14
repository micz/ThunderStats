# Thunderbird Team Guidelines

## Source

The official Thunderbird WebExtension development team guidelines are available in the official skill document provided by the team. This file extracts the rules relevant to ThunderJira, documents motivated deviations, and adds requirements not covered by the other specs.

**Official API documentation:** https://webextension-api.thunderbird.net/en/mv3/

---

## Rules Applicable to ThunderJira

### 1. Do not use `async` listeners for `runtime.onMessage`

The `runtime.onMessage` listener **must not be declared `async`**. An `async` listener implicitly returns a `Promise` that the Thunderbird/Firefox WebExtension engine does not recognise as a valid message response, causing undefined behaviour and hard-to-reproduce bugs.

**Correct pattern:** the listener is synchronous and delegates to an `async` function, returning its `Promise` explicitly.

```js
// CORRECT — non-async listener that returns an explicit Promise
browser.runtime.onMessage.addListener((message) => {
  // Returns a Promise — Thunderbird recognises it as an async response
  return handleMessage(message)
})

async function handleMessage(message) {
  const { type, payload } = message
  try {
    const client = await getJiraClient()
    switch (type) {
      case JIRA_GET_PROJECTS:
        return { data: await client.getProjects() }
      // ...
      default:
        return { error: `Unknown message type: ${type}` }
    }
  } catch (err) {
    return { error: err.message ?? String(err) }
  }
}
```

See also: [05-messaging.md](05-messaging.md) for the full message catalog.

---

### 2. Safe background initialisation pattern

The background (Event Page) in MV3 can be re-executed for any registered event, not only at startup. To prevent `init()` from running more than once per session, use a flag in `storage.session`:

```js
// CORRECT — init() runs only once per session
async function init() {
  const { initialized } = await browser.storage.session.get({ initialized: false })
  if (initialized) return
  await browser.storage.session.set({ initialized: true })

  // ... set up JiraClient, etc.
}

// Register a NOOP listener on onStartup to activate the background at startup
browser.runtime.onStartup.addListener(() => {})

// Always call init() (it will be blocked by the flag if already run)
init()
```

---

### 3. Verify the return type of Thunderbird APIs

Many Thunderbird APIs return "wrapped" objects, not plain arrays. Always check the documentation before accessing data.

| API | Returns | Access pattern |
|-----|---------|----------------|
| `messageDisplay.getDisplayedMessages()` | `MessageList` | `result.messages[0]` |
| `messages.list()` | `MessageList` | `result.messages[0]` |
| `messages.query()` | `MessageList` | `result.messages[0]` |
| `messages.getHeaders()` | `HeadersDictionary` | `result["header-name"][0]` |
| `tabs.query()` | `array of Tab` | `result[0]` |
| `folders.query()` | `array of MailFolder` | `result[0]` |

**Important:** `HeadersDictionary` uses lowercase keys and values that are always arrays — access with `headers["return-path"]?.[0]`.

---

### 4. Mandatory API audit before using new Thunderbird APIs

Before adding any call to a new Thunderbird API, verify in the official documentation:
- Exact parameter names and types
- Actual return type of the Promise
- Result access pattern (wrapped object vs plain array)
- Permission required in the manifest

Never make assumptions. Never use try-catch to "guess" parameters.

---

### 5. `VENDOR.md` — third-party dependency documentation

Every third-party library manually vendored in the project must be documented in `VENDOR.md` at the project root (npm dependencies tracked in `package.json` do not belong here). Use this format:

```
local/path/to/file.js:
 - Version: exact version (not "latest" or "main")
 - URL: direct URL to the release/download page
```

Example VENDOR.md entry:
```
local/path/to/ical.min.js:
 - Version: 2.2.1
 - URL: https://github.com/kewisch/ical.js/releases/download/v2.2.1/ical.min.js
```

---

### 6. i18n — no hardcoded user-facing strings

All strings visible to the user must be localised via the Thunderbird i18n API. Never use hardcoded string literals in Vue components or HTML files.

- Strings go in `public/_locales/en/messages.json` (and in any other supported languages)
- The manifest must have the `"default_locale"` entry when the `_locales` folder exists
- In Vue components use `browser.i18n.getMessage('keyName')`

Reference: https://github.com/thunderbird/webext-examples/tree/master/manifest_v3/i18n

---

### 7. Background type: always `"module"`

The background must always declare `"type": "module"` in the manifest. This is already correct in our spec (see [02-manifest-and-permissions.md](02-manifest-and-permissions.md)).

```json
"background": {
  "scripts": ["background/background.js"],
  "type": "module"
}
```

---

### 8. `browser_specific_settings` (not `applications`)

Always use `browser_specific_settings` in the manifest. The `applications` entry is deprecated and not supported in MV3. Already correct in our spec.

---

### 9. Use optional host permissions with URL-specific runtime grants

**Source:** Thunderbird extension reviewer feedback (John).

Never request `<all_urls>` as a blanket optional host permission for user-entered URLs. Instead, declare `["https://*/*", "http://*/*"]` (and `"<all_urls>"` for the localhost edge case) as `optional_host_permissions` in the manifest, and request only the specific origin the user entered — at the moment they save it.

**Manifest:**
```json
"optional_host_permissions": [
  "https://*/*",
  "http://*/*",
  "<all_urls>"
]
```

The broad patterns stay disabled. Only the explicitly entered origin is ever granted.

**Runtime request:** `requestSitePermission(url)` in `src/options/permissions.js` — see [02-manifest-and-permissions.md](02-manifest-and-permissions.md) for the full implementation.

**localhost / 127.0.0.1 exception:** `localhost` and `127.0.0.1` have no TLD and do not match `https://*/*` or `http://*/*`. For these hosts, request `<all_urls>` instead of the URL-specific origin. The `isLocalhost()` check in `requestSitePermission` handles this automatically.

**`strict_min_version`:** must be `"140.0"` (improved optional permission prompt introduced in Thunderbird 140).

**`"permissions"` permission:** must be declared in the manifest `permissions` array to call `browser.permissions.contains()` and `browser.permissions.request()`.

---

## Documented Deviations

### Deviation A — Build tool (Vite)

The Thunderbird team recommends avoiding build tools for beginners. ThunderJira is an **advanced** project using Vue 3 + Pinia, which necessarily requires a build tool (Vite with native multi-entry configuration — no third-party web extension plugin).

**Consequence:** ThunderJira falls under the "Advanced developers" category of the ATN review process and requires:
- **Source code submission** when publishing to ATN
- A `DEVELOPER.md` file at the source root with build instructions:
  ```
  npm ci
  npm run build
  ```
- The source archive must not include `node_modules/` or build artefacts (`dist/`)
- The generated XPI file must exactly match the one uploaded

Policy reference: https://thunderbird.github.io/atn-review-policy/

---

### Deviation B — Regex for Jira URL detection

The Thunderbird team prefers parsing libraries over regex. Our spec ([07-content-script-and-popup.md](07-content-script-and-popup.md)) uses a regex to detect Jira URLs in the email DOM:

```js
const JIRA_LINK_REGEX = /(https?:\/\/[^\s"<>]+\/browse\/([A-Z]+-\d+))/g
```

**Rationale for the deviation:** the pattern is specific and well-defined (Jira URL structure `/browse/ISSUEKEY` with a key in the `LETTERS-NUMBER` format). Using a general URL parsing library would be overengineering for this use case. The regex is maintainable because it matches a stable, documented Jira API pattern.

This deviation does not apply to other cases: parsing of vCards, iCal, email addresses, etc. must always use the libraries recommended by the Thunderbird team.

---

## Official Channels

- **Documentation:** https://developer.thunderbird.net/
- **Forum:** https://thunderbird.topicbox.com/groups/addons
- **Matrix:** #tb-addon-developers:mozilla.org
- **Official examples:** https://github.com/thunderbird/webext-examples
- **Support libraries:** https://github.com/thunderbird/webext-support
