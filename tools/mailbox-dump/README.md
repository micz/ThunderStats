# ThunderStats Mailbox Dump (development tool)

A small, separate Thunderbird extension that exports the local mailbox as a JSON **mailbox dump** for the
ThunderStats real data tests (`npm run test:real`, see `claude-spec/04-build.md`). It is not part of the
ThunderStats build and is never shipped.

## Use

1. In Thunderbird: Add-ons Manager → gear → *Debug Add-ons* → *Load Temporary Add-on* → `tools/mailbox-dump/manifest.json`.
2. Click the *ThunderStats Mailbox Dump* toolbar button: a tab opens.
3. Choose how many months of messages to export (0 = all) and leave *Anonymize* on unless the dump stays on your machine only.
4. *Create the dump*, then save `mailbox-dump-YYYYMMDD.json` into `tests/real/data/` (ignored by git), or point `TS_DUMP` to it.
5. Run `npm run test:real` (set `TS_TZ` to the `time_zone` of the dump if it is not `Europe/Rome`).

The dump reads only headers (no message bodies) with the same APIs used by ThunderStats:
`accounts.list(true)`, `messages.query` per folder (`includeSubFolders: false`), `messages.tags.list`, `addressBooks.list(true)`.
Messages that Thunderbird has not synchronized yet (IMAP folders never opened) are not in the dump.

## Format (version 1)

```js
{
  format: 'thunderstats-mailbox-dump', version: 1,
  created: ISO date,            // the tests fix the clock here
  time_zone: 'Europe/Rome',     // of the machine that created the dump
  thunderbird: '140.3.0',
  anonymized: true,
  from_date: ISO date | null,   // oldest message date asked (null = all)
  accounts: [{ id, name, type, identities: [{ email }],
               folders: [{ id, accountId, name, path, specialUse: [], subFolders: [...] }] }],
  tags: [{ key, tag, color, ordinal }],
  contacts: [vCard],
  messages: [{ id, headerMessageId, date: ISO, author, recipients: [], ccList: [], bccList: [],
               subject, read, flagged, tags: [keys], folder: folder id }],
  errors: [{ folder, error }],  // folders that could not be read
}
```

## Anonymization (`anonymize.js`)

The replacement of a value is always the same within a dump (random seed per dump), so the stats do not change:

- addresses → `u<token>@d<token>.<tld>`: subdomains and top level domain kept, webmail domains (`gmail.com`, `libero.it`, ...) kept, upper case kept;
- the other words of headers, display names and subjects → `w<token>` (`é<token>` when the word had non-ASCII letters);
  a word with `@` that is not a valid address stays not valid, so the authors without an address are still without one;
- folder names → `f<token>`, except the special folders and `INBOX`; folder ids are rebuilt like Thunderbird (`accountId:/path`);
- account names → `Account N`; tag names → `Tag <token>`, custom tag keys → `t<token>` (`$label1`... kept);
- Message-IDs → `h<token>@dump` (duplicates stay duplicates, empty stays empty);
- vCards → only the name and the addresses.

The token is a seeded hash, not a cryptographic one: anonymized dumps are fit for sharing with a developer, not for publishing.
