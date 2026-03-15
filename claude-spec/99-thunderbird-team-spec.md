# Thunderbird Team Guidelines for ThunderStats

This document adapts the official Thunderbird WebExtensions development guidelines for the ThunderStats project. Only sections relevant to this codebase are included.

---

## Documented Deviations from General Guidelines

ThunderStats intentionally deviates from some general Thunderbird WebExtension recommendations. These are known, accepted deviations — do not attempt to "fix" them:

| Deviation | General guideline | ThunderStats choice | Reason |
|---|---|---|---|
| Manifest version | Use MV3 for new extensions | **Manifest V2** | Thunderbird compatibility requirement |
| Build tools | Avoid build tools for beginners | **Vite 6.4** | Vue 3 SFC components require a bundler |
| Background page | Use `"type": "module"` in background scripts array | **`background.html`** (page-based) | MV2 pattern |
| Dependencies | Use VENDOR.md + direct file inclusion | **npm + package.json** | Build pipeline manages dependencies |
| UI framework | Plain JavaScript | **Vue 3 Composition API** | Full rewrite architectural decision |

---

## Important Guidelines for AI Assistants

### 1. Use `browser_specific_settings`, not `applications`

The `applications` manifest entry is deprecated. Always use `browser_specific_settings`:

```json
{
    "browser_specific_settings": {
        "gecko": {
            "id": "thunderstats@micz.it",
            "strict_min_version": "115.0"
        }
    }
}
```

ThunderStats already uses this correctly.

### 2. Do not guess APIs using Try-Catch

```javascript
// WRONG - Never do this!
try {
  await browser.someApi.method({ guessedParam: value });
} catch (e) {
  try {
    await browser.someApi.method({ differentGuess: value });
  } catch (e2) {
    // Giving up silently — makes debugging impossible
  }
}
```

**The correct approach:**
1. Read the API documentation FIRST
2. Use the exact parameter names and types specified
3. Only use try-catch for expected error conditions with proper handling
4. Never suppress errors without logging or handling them

### 3. Do not use Experiments unnecessarily

```javascript
// WRONG — Using Experiment when standard API exists
// RIGHT — Check if standard API can do it first
const folders = await browser.folders.query({ name: "Inbox" });
```

### 4. Verify API return types — do not assume array access

Many Thunderbird APIs return wrapped objects, not direct arrays. Always verify the return type before accessing data.

**Common pitfall — MessageList:**
```javascript
// WRONG — getDisplayedMessages() returns MessageList, not an array
const [message] = await browser.messageDisplay.getDisplayedMessages(tabId);

// RIGHT — MessageList has a .messages array property
const { messages: [message] } = await browser.messageDisplay.getDisplayedMessages(tabId);
```

**Common pitfall — HeadersDictionary:**
```javascript
// WRONG — keys might not match case, values are arrays
let returnPath = headers["Return-Path"];

// RIGHT — keys are lowercase, values are always arrays
const returnPath = headers["return-path"]?.[0] ?? null;
```

**APIs that return wrapped objects (NOT direct arrays):**

| API | Returns | Access Pattern |
|---|---|---|
| `messageDisplay.getDisplayedMessages()` | `MessageList` | `result.messages[0]` |
| `messages.list()` | `MessageList` | `result.messages[0]` |
| `messages.query()` | `MessageList` | `result.messages[0]` |
| `messages.getHeaders()` | `HeadersDictionary` | `result["header-name"][0]` |
| `messages.getFull()` | `MessagePart` | `result.headers["header-name"][0]` |

**APIs that return direct arrays:**

| API | Returns | Access Pattern |
|---|---|---|
| `tabs.query()` | `array of Tab` | `result[0]` |
| `mailTabs.query()` | `array of MailTab` | `result[0]` |
| `addressBooks.list()` | `array of AddressBookNode` | `result[0]` |
| `contacts.list()` | `array of ContactNode` | `result[0]` |
| `folders.query()` | `array of MailFolder` | `result[0]` |

**MV2 → MV3 API changes (relevant if ThunderStats ever migrates):**

| MV2 (old) | MV3 (new) | Return Type Change |
|---|---|---|
| `getDisplayedMessage()` | `getDisplayedMessages()` | `MessageHeader` → `MessageList` |
| `onMessageDisplayed` | `onMessagesDisplayed` | `(tab, message)` → `(tab, messageList)` |

### 5. Do not use async listeners for `runtime.onMessage`

See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage

### 6. Set correct `strict_min_version`

Ensure `manifest.json` has a `strict_min_version` matching the minimum Thunderbird version that supports all used APIs. ThunderStats currently targets `115.0`.

### 7. Parse Mailbox Strings using `messengerUtilities`

```javascript
const parsed = await browser.messengerUtilities.parseMailboxString(
  "John Doe <john@example.com>, Jane <jane@example.com>"
);
// Result: [{ name: "John Doe", email: "john@example.com" }, ...]
const emails = parsed.map(p => p.email);
```

Documentation: https://webextension-api.thunderbird.net/en/mv3/messengerUtilities.html

---

## Official API Documentation

**Primary resource:** https://webextension-api.thunderbird.net/en/mv2/

Since ThunderStats uses Manifest V2, use the MV2 documentation:
- **Release (mv2):** https://webextension-api.thunderbird.net/en/mv2/
- **ESR (esr-mv2):** https://webextension-api.thunderbird.net/en/esr-mv2/

The MV3 docs are available at https://webextension-api.thunderbird.net/en/mv3/ for reference, but API signatures may differ.

---

## Experiment APIs

### What Are Experiment APIs?

Experiment APIs allow add-ons to access Thunderbird's core internals directly. They require updates for each major Thunderbird version.

### Rules for ThunderStats

1. **Avoid Experiments unless absolutely necessary.** Standard WebExtension APIs should always be the first choice.
2. **Experiments require updates for each major version** — monthly on the Release channel, yearly on ESR.
3. If an Experiment is genuinely needed, target the **ESR channel** and reference `esr-mv2` documentation.
4. Check the [webext-experiments](https://github.com/thunderbird/webext-experiments/) repository for semi-official Experiment APIs before writing a custom one.

### Available semi-official Experiment APIs

- **Calendar API** — for reading/writing calendar items. See https://github.com/thunderbird/webext-experiments/ for setup.

---

## Permission Requirements

Only request permissions that are actually needed. Unnecessary permissions may cause rejection during ATN review.

**Currently used by ThunderStats:**
```json
"permissions": [
    "addressBooks",
    "messagesRead",
    "accountsRead",
    "storage",
    "tabs",
    "messagesTagsList"
]
```

**Note on `tabs` permission:** This is needed in ThunderStats for tab management (opening the stats window). Do not add it if removing that functionality; do not remove it while it is still used.

**Anti-pattern — never request unused permissions:**
- `activeTab` — only needed to inject content scripts into the active tab
- Permissions for APIs you are not calling

---

## Add-on Review Requirements

**Review policy:** https://thunderbird.github.io/atn-review-policy/

### Source Code Submission (applies to ThunderStats)

ThunderStats uses Vite as a build tool, so it falls under the "advanced developer" path requiring source code submission:

- Upload the source code archive during the ATN submission process
- Include a `DEVELOPER.md` file in the root of the source archive with build instructions:
  ```
  npm ci
  npm run build
  ```
- The source archive must **not** include build artifacts (`dist/`) or downloaded modules (`node_modules/`)
- The generated XPI must exactly match the uploaded one

---

## Mandatory API Audit

Before finalizing any code that uses Thunderbird APIs, produce an audit table:

| API Method | Returns | Access Pattern | Required Permission |
|---|---|---|---|
| `browser.messageDisplay.getDisplayedMessages()` | `MessageList` | `result.messages[0]` | messagesRead |
| `browser.messages.query()` | `MessageList` | `result.messages[0]` | messagesRead |
| `browser.messages.getHeaders()` | `HeadersDictionary` | `result["header-name"][0]` | messagesRead |
| `browser.messages.getFull()` | `MessagePart` | `result.headers["header-name"][0]` | messagesRead |
| `browser.mailTabs.query()` | `array of MailTab` | `result[0]` | (none) |
| `browser.tabs.query()` | `array of Tab` | `result[0]` | (none) |
| `browser.folders.query()` | `array of MailFolder` | `result[0]` | accountsRead |
| `browser.storage.local.get()` | `object` | `result.keyName` | storage |
| `browser.i18n.getMessage()` | `string` | direct | (none) |

For each method used, verify:
- **Parameters:** Correct parameter names and types (consult docs, do not guess)
- **Return type:** Actual type returned by the Promise
- **Access pattern:** How to extract data from the return value
- **Required permission:** What permission is needed in `manifest.json`

---

## Troubleshooting

### "API not working"
1. Re-read the official API documentation for the exact method signature.
2. Check that the required permission is in `manifest.json`.
3. Verify the return type — do not assume it is a direct array (see Section 4 above).
4. Check the Thunderbird version — the API may not be available in `strict_min_version: 115.0`.

### "Experiment not loading"
1. Check `manifest.json` has the correct `experiment_apis` entry.
2. Ensure schema and implementation files are included and paths match.

### Getting Help
- Developer documentation: https://developer.thunderbird.net/
- Support forum: https://thunderbird.topicbox.com/groups/addons
- Matrix chat: #tb-addon-developers:mozilla.org
