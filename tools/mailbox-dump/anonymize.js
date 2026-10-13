// Anonymizer of the mailbox dump. It keeps what the stats engine looks at:
// - the same value always gets the same replacement (identities, duplicates, correspondents, domains);
// - an address matches tsUtils.regexEmail after the anonymization only if it matched before, at the same place;
// - the domain structure (subdomains, top level domain) and the public webmail domains (the duplicates
//   filter default looks for gmail.com) are kept, so are the upper case letters of addresses and domains;
// - empty values stay empty.
// Used by the dump page (dump.js) and by the tests (tests/unit/anonymize.test.js).

// Same regex as tsUtils.regexEmail
const REGEX_EMAIL = /[\p{L}\p{N}._%+-][\p{L}\p{N}._%+'-]*@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu;
// Words of a display name or a subject: everything but spaces, separators and quotes
const REGEX_WORD = /[^\s<>"'(),;:[\]]+/gu;

export const PUBLIC_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'outlook.it', 'hotmail.com', 'hotmail.it', 'live.com', 'live.it',
  'msn.com', 'yahoo.com', 'yahoo.it', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'gmx.com', 'gmx.de', 'gmx.net',
  'web.de', 'proton.me', 'protonmail.com', 'libero.it', 'virgilio.it', 'alice.it', 'tim.it', 'tiscali.it',
  'fastwebnet.it', 'pec.it', 'legalmail.it', 'mail.com', 'zoho.com', 'fastmail.com', 'tutanota.com',
]);

// 53 bit string hash (cyrb53) with a seed
function hash(text, seed) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) {
    let ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Upper case replacement when the original value has upper case letters
function sameCase(original, value) {
  return original == original.toLowerCase() ? value : value.toUpperCase();
}

export function createAnonymizer(seed = Math.floor(Math.random() * 2 ** 31)) {
  // kind -> (value -> token), kind -> used tokens: a collision gets a suffix, so different values never merge
  const tokens = new Map();
  const used = new Map();

  function token(kind, value, length = 6) {
    if (!tokens.has(kind)) { tokens.set(kind, new Map()); used.set(kind, new Set()); }
    let map = tokens.get(kind);
    if (map.has(value)) return map.get(value);
    let output = hash(kind + '\u0000' + value, seed).toString(36).padStart(length, '0').slice(-length);
    let taken = used.get(kind);
    for (let i = 2; taken.has(output); i++) output = output.replace(/_\d+$/, '') + '_' + i;
    taken.add(output);
    map.set(value, output);
    return output;
  }

  function domain(value) {
    let lower = value.toLowerCase();
    if (PUBLIC_DOMAINS.has(lower)) return value;
    let labels = lower.split('.');
    let tld = labels.pop();
    return sameCase(value, [...labels.map(label => 'd' + token('domain', label, 5)), tld].join('.'));
  }

  function email(value) {
    if (!value) return value;
    let at = value.lastIndexOf('@');
    if (at < 0) return 'u' + token('local', value.toLowerCase());
    let local = value.slice(0, at);
    return sameCase(local, 'u' + token('local', local.toLowerCase())) + '@' + domain(value.slice(at + 1));
  }

  // A word of a text that is not a valid address. A word with '@' (e.g. "root@localhost") keeps it, without
  // a dot after it, so it never becomes an address matched by regexEmail
  function word(value) {
    let at = value.indexOf('@');
    if (at >= 0) {
      return 'n' + token('word', value.slice(0, at).toLowerCase(), 5) + '@n' + token('word', value.slice(at + 1).toLowerCase(), 5);
    }
    return 'w' + token('word', value.toLowerCase(), 5);
  }

  // A text with addresses inside (an address header, a display name, a subject): the addresses are
  // replaced in place, the other words one by one, the separators are kept
  function text(value) {
    if (!value) return value;
    let output = '';
    let last = 0;
    for (let match of value.matchAll(REGEX_EMAIL)) {
      output += value.slice(last, match.index).replace(REGEX_WORD, word) + email(match[0]);
      last = match.index + match[0].length;
    }
    return output + value.slice(last).replace(REGEX_WORD, word);
  }

  function messageId(value) {
    return value ? 'h' + token('msgid', value, 10) + '@dump' : value;
  }

  function folderSegment(value) {
    return value.toUpperCase() == 'INBOX' ? value : 'f' + token('folder', value, 5);
  }

  // '$label1'...'$label5' and the other '$' keywords are Thunderbird's own keys
  function tagKey(value) {
    return value.startsWith('$') ? value : 't' + token('tag', value, 5);
  }

  function tagName(value) {
    return 'Tag ' + token('tagname', value, 5);
  }

  // Keeps only the name and the addresses, which are what the stats read
  function vCard(value) {
    if (!value) return value;
    let unfolded = value.replace(/\r?\n[ \t]/g, '');
    let lines = ['BEGIN:VCARD', 'VERSION:4.0'];
    let fn = unfolded.match(/^(?:[^:\r\n]*\.)?FN[^:\r\n]*:(.*)$/im);
    if (fn) lines.push('FN:' + text(fn[1].trim()));
    for (let match of unfolded.matchAll(/^((?:[^:\r\n]*\.)?EMAIL[^:\r\n]*):(.*)$/gim)) {
      lines.push(match[1] + ':' + email(match[2].trim()));
    }
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }

  return { seed, email, domain, text, messageId, folderSegment, tagKey, tagName, vCard };
}
