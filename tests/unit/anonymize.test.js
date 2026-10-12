import { describe, it, expect } from 'vitest';
import { createAnonymizer } from '../../tools/mailbox-dump/anonymize.js';
import { dumpFolder } from '../../tools/mailbox-dump/dump-format.js';
import { tsUtils } from '@statslib/mzts-utils';
import { tsCoreUtils } from '@statslib/mzts-statscore.utils';

const firstAddress = (text) => (text.match(tsUtils.regexEmail) || [null])[0];

describe('mailbox dump anonymizer', () => {
  it('gives the same replacement to the same value, ignoring the case of the addresses', () => {
    let anon = createAnonymizer(7);
    expect(anon.email('mario@acme.it')).toBe(anon.email('mario@acme.it'));
    expect(anon.email('MARIO@ACME.IT').toLowerCase()).toBe(anon.email('mario@acme.it'));
    expect(anon.email('mario@acme.it')).not.toBe(anon.email('luca@acme.it'));
    expect(createAnonymizer(8).email('mario@acme.it')).not.toBe(anon.email('mario@acme.it'));
  });

  it('keeps the upper case letters, the subdomains, the top level domain and the webmail domains', () => {
    let anon = createAnonymizer(7);
    let [local, domain] = anon.email('Mario@acme.it').split('@');
    expect(local).toBe(local.toUpperCase());
    expect(domain).toMatch(/^d[0-9a-z]+\.it$/);
    expect(anon.domain('Acme.IT')).toBe(anon.domain('acme.it').toUpperCase());
    expect(anon.domain('mail.acme.it').endsWith('.' + anon.domain('acme.it'))).toBe(true);
    expect(anon.email('someone@gmail.com')).toMatch(/^u[0-9a-z]+@gmail\.com$/);
  });

  it('replaces the addresses of a header in place, so the core finds the same ones', () => {
    let anon = createAnonymizer(7);
    let header = anon.text('"Rossi, Mario" <mario@acme.it>');
    expect(header).toMatch(/^"w[0-9a-z]+, w[0-9a-z]+" <u[0-9a-z]+@d[0-9a-z]+\.it>$/);
    expect(firstAddress(header)).toBe(anon.email('mario@acme.it'));
    // the first address found is still the one in the display name
    let tricky = anon.text('"anna@acme.it" <mario@acme.it>');
    expect(firstAddress(tricky)).toBe(anon.email('anna@acme.it'));
    expect(tsCoreUtils.extractDomains([anon.text('"anna@other.com" <mario@acme.it>')])).toEqual([anon.domain('acme.it')]);
  });

  it('keeps the authors without a valid address without one', () => {
    let anon = createAnonymizer(7);
    for (let author of ['Mail Delivery System', 'undisclosed-recipients:;', 'José <josé@exämple.com>']) {
      expect(firstAddress(anon.text(author)), author).toBeNull();
    }
    expect(tsCoreUtils.extractDomains([anon.text('José <josé@exämple.com>')])).toHaveLength(1);
    expect(anon.text('')).toBe('');
  });

  it('keeps the special folder names and the INBOX, and the folder ids like Thunderbird', () => {
    let anon = createAnonymizer(7);
    let ids = new Map();
    let tree = dumpFolder({
      id: 'account1://INBOX', accountId: 'account1', name: 'INBOX', path: '/INBOX', specialUse: ['inbox'],
      subFolders: [{ id: 'account1://INBOX/Clienti', accountId: 'account1', name: 'Clienti', path: '/INBOX/Clienti', specialUse: [] }],
    }, anon, ids);
    let sub = tree.subFolders[0];
    expect([tree.id, tree.name]).toEqual(['account1://INBOX', 'INBOX']);
    expect(sub.path).toMatch(/^\/INBOX\/f[0-9a-z]+$/);
    expect(sub.id).toBe('account1:/' + sub.path);
    expect(sub.name).toBe(sub.path.split('/').at(-1));
    expect(ids.get('account1://INBOX/Clienti')).toBe(sub.id);
  });

  it('keeps the Thunderbird tag keys, the empty Message-IDs and the duplicates', () => {
    let anon = createAnonymizer(7);
    expect(anon.tagKey('$label1')).toBe('$label1');
    expect(anon.tagKey('clienti')).toMatch(/^t[0-9a-z]+$/);
    expect(anon.messageId('')).toBe('');
    expect(anon.messageId('a@b')).toBe(anon.messageId('a@b'));
  });

  it('keeps only the name and the addresses of a vCard', () => {
    let anon = createAnonymizer(7);
    let card = anon.vCard('BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Anna Bianchi\r\nTEL:123\r\nitem1.EMAIL;PREF=1:Anna@\r\n acme.it\r\nEND:VCARD');
    expect(card.split('\r\n')).toEqual(['BEGIN:VCARD', 'VERSION:4.0', 'FN:' + anon.text('Anna Bianchi'),
      'item1.EMAIL;PREF=1:' + anon.email('Anna@acme.it'), 'END:VCARD']);
  });

  it('never gives two values the same replacement', () => {
    let anon = createAnonymizer(7);
    let tokens = new Set();
    for (let i = 0; i < 20000; i++) tokens.add(anon.email('user' + i + '@acme.it'));
    expect(tokens.size).toBe(20000);
  });
});
