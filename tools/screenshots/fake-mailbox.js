// Fake but realistic mailbox for the store screenshots: two accounts, about 14 months of mail.
// Every name and address is fictional: all the domains use the reserved .example and .invalid TLDs (RFC 2606), so none can exist.
// The generator is seeded, so every run gives the same data for the same "now".

const ME_WORK = 'alex.morgan@contoso.example';
const ME_HOME = 'alex.morgan@litware.example';

function folder(account_id, path, special_use = [], sub_folders = []) {
  return {
    id: account_id + '://' + path,
    accountId: account_id,
    name: path.split('/').at(-1),
    path: '/' + path,
    specialUse: special_use,
    subFolders: sub_folders,
  };
}

// [name, email, weight]: the weight drives how often the contact writes / is written to
const WORK_CONTACTS = [
  ['Laura Bianchi', 'laura.bianchi@contoso.example', 30],
  ['Daniel Kim', 'daniel.kim@contoso.example', 26],
  ['Priya Raman', 'priya.raman@fabrikam.example', 22],
  ['Marco Esposito', 'marco.esposito@contoso.example', 19],
  ['Sofia Lindqvist', 'sofia.lindqvist@northwindtraders.example', 17],
  ['James O\'Connor', 'james.oconnor@adventure-works.example', 15],
  ['Chen Wei', 'chen.wei@fabrikam.example', 13],
  ['Hannah Weber', 'hannah.weber@contoso.example', 12],
  ['Lucas Martin', 'lucas.martin@wingtiptoys.example', 10],
  ['Amara Okafor', 'amara.okafor@alpineskihouse.example', 9],
  ['Tomás Ruiz', 'tomas.ruiz@northwindtraders.example', 8],
  ['Elena Petrova', 'elena.petrova@contoso.example', 7],
  ['Noah Fischer', 'noah.fischer@adventure-works.example', 6],
  ['Yuki Tanaka', 'yuki.tanaka@fabrikam.example', 5],
  ['Grace Liu', 'grace.liu@wingtiptoys.example', 4],
  ['Omar Haddad', 'omar.haddad@alpineskihouse.example', 4],
  ['Isabel Costa', 'isabel.costa@contoso.example', 3],
  ['Ravi Patel', 'ravi.patel@northwindtraders.example', 3],
];

// Automatic senders: they write but are never written to
const WORK_ROBOTS = [
  ['Build Server', 'ci@contoso.example', 14],
  ['Contoso IT Helpdesk', 'helpdesk@contoso.example', 4],
  ['Project Tracker', 'tracker@contoso.example', 10],
  ['Lucerne Weekly Digest', 'digest@lucernepublishing.example', 3],
];

const HOME_CONTACTS = [
  ['Sam Morgan', 'sam.morgan@litware.example', 20],
  ['Julia Romano', 'julia.romano@woodgrovebank.example', 6],
  ['Ben Carter', 'ben.carter@litware.example', 9],
  ['Mia Schneider', 'mia.schneider@litware.example', 7],
  ['Fourth Coffee', 'orders@fourthcoffee.example', 5],
  ['Margie\'s Travel', 'booking@margiestravel.example', 4],
  ['Woodgrove Bank', 'statements@woodgrovebank.example', 3],
  ['Graphic Design Institute', 'news@graphicdesigninstitute.example', 6],
];

const SUBJECTS = [
  'Q4 roadmap review', 'Re: Budget proposal', 'Meeting notes', 'Re: Release candidate', 'Contract draft v3',
  'Re: Invoice #4821', 'Weekly status', 'Re: Design feedback', 'Quick question', 'Re: Travel plans',
  'Kick-off call agenda', 'Re: Test results', 'Updated timeline', 'Fwd: Customer request', 'Lunch on Friday?',
];

// Relative weight of each hour of the day
const HOURS_WORK = [0, 0, 0, 0, 0, 0, 1, 3, 9, 14, 15, 13, 7, 6, 11, 13, 12, 9, 5, 3, 2, 1, 1, 0];
const HOURS_SENT = [0, 0, 0, 0, 0, 0, 0, 1, 5, 12, 14, 12, 4, 5, 10, 13, 12, 10, 4, 2, 1, 1, 0, 0];
const HOURS_HOME = [0, 0, 0, 0, 0, 0, 1, 3, 4, 3, 2, 2, 4, 3, 2, 2, 2, 3, 6, 9, 10, 8, 4, 1];
const HOURS_ROBOT = [2, 2, 1, 1, 1, 2, 3, 4, 5, 5, 4, 4, 3, 4, 4, 4, 4, 4, 3, 3, 2, 2, 2, 2];

const TAGS = [
  { key: '$label1', tag: 'Important', color: '#FF0000', ordinal: '' },
  { key: '$label2', tag: 'Work', color: '#FF9900', ordinal: '' },
  { key: '$label3', tag: 'Personal', color: '#009900', ordinal: '' },
  { key: '$label4', tag: 'To Do', color: '#3333FF', ordinal: '' },
  { key: '$label5', tag: 'Later', color: '#993399', ordinal: '' },
];

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function vCard(name, email) {
  return ['BEGIN:VCARD', 'VERSION:4.0', 'FN:' + name, 'EMAIL;PREF=1:' + email, 'END:VCARD'].join('\r\n');
}

export function createFakeMailbox(now, days_back = 430) {
  const rnd = mulberry32(20261103);
  const pick = (list) => {
    let total = list.reduce((sum, item) => sum + item[2], 0);
    let r = rnd() * total;
    for (let item of list) { r -= item[2]; if (r < 0) return item; }
    return list.at(-1);
  };
  const pickHour = (weights) => {
    let total = weights.reduce((a, b) => a + b, 0);
    let r = rnd() * total;
    for (let h = 0; h < 24; h++) { r -= weights[h]; if (r < 0) return h; }
    return 12;
  };
  // Poisson-like count around mean
  const count = (mean) => Math.max(0, Math.round(mean * (0.7 + rnd() * 0.6)));

  const work_folders = [
    folder('acc1', 'INBOX', ['inbox'], [folder('acc1', 'INBOX/Projects'), folder('acc1', 'INBOX/Clients')]),
    folder('acc1', 'Sent', ['sent']),
    folder('acc1', 'Archives', ['archives'], [folder('acc1', 'Archives/2025'), folder('acc1', 'Archives/2026')]),
    folder('acc1', 'Drafts', ['drafts']),
    folder('acc1', 'Trash', ['trash']),
    folder('acc1', 'Junk', ['junk']),
  ];
  const home_folders = [
    folder('acc2', 'INBOX', ['inbox']),
    folder('acc2', 'Sent', ['sent']),
    folder('acc2', 'Archives', ['archives']),
    folder('acc2', 'Trash', ['trash']),
  ];
  const all = new Map();
  const index = (folders) => folders.forEach(f => { all.set(f.id, f); index(f.subFolders); });
  index(work_folders);
  index(home_folders);
  const folderInfo = (id) => { let { subFolders, ...info } = all.get(id); return info; };

  const mailbox = {
    accounts: [
      { id: 'acc1', name: 'Work', type: 'imap', identities: [{ email: ME_WORK, name: 'Alex Morgan' }], folders: work_folders },
      { id: 'acc2', name: 'Personal', type: 'imap', identities: [{ email: ME_HOME, name: 'Alex Morgan' }], folders: home_folders },
    ],
    messages: [],
  };

  let next_id = 1;
  const add = (m) => {
    let id = next_id++;
    mailbox.messages.push({
      id,
      headerMessageId: 'fake' + id + '@screenshots.invalid',
      subject: SUBJECTS[Math.floor(rnd() * SUBJECTS.length)],
      flagged: rnd() < 0.04,
      tags: rnd() < 0.12 ? [TAGS[Math.floor(rnd() * TAGS.length)].key] : [],
      ccList: [],
      bccList: [],
      ...m,
      folder: folderInfo(m.folder),
    });
  };

  // Where a received mail is now: recent ones are still in the inbox, older ones were archived
  const placeReceived = (account, age_days, date) => {
    let inbox = account + '://INBOX';
    let keep = age_days == 0 ? 1 : age_days == 1 ? 0.5 : age_days <= 5 ? 0.15 : age_days <= 30 ? 0.03 : age_days <= 120 ? 0.006 : 0.001;
    if (rnd() < 0.02) return { folder: account + '://Trash', read: true };
    if (rnd() < keep) {
      let sub = account == 'acc1' && rnd() < 0.25 ? (rnd() < 0.5 ? '/Projects' : '/Clients') : '';
      let unread = age_days == 0 ? 0.55 : age_days <= 2 ? 0.3 : 0.12;
      return { folder: inbox + sub, read: rnd() >= unread };
    }
    if (account == 'acc2') return { folder: 'acc2://Archives', read: true };
    return { folder: 'acc1://Archives/' + date.getFullYear(), read: true };
  };

  for (let back = days_back; back >= 0; back--) {
    let day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
    let dow = day.getDay();
    let weekend = dow == 0 || dow == 6;
    // Quieter in August and at the end of December
    let season = day.getMonth() == 7 ? 0.35 : (day.getMonth() == 11 && day.getDate() > 22) ? 0.3 : 1;
    // Slow growth over the year, so the long ranges are not flat
    let trend = 0.8 + 0.2 * (1 - back / days_back);

    let jobs = [
      // [how many, account, kind]
      [count((weekend ? 4 : 48) * season * trend), 'acc1', 'in'],
      [count((weekend ? 1 : 19) * season * trend), 'acc1', 'out'],
      [count(6), 'acc1', 'robot'],
      [count(weekend ? 9 : 6), 'acc2', 'in'],
      [count(weekend ? 4 : 2), 'acc2', 'out'],
      [rnd() < 0.5 ? 1 : 0, 'acc1', 'junk'],
    ];

    for (let [n, account, kind] of jobs) {
      for (let i = 0; i < n; i++) {
        let hours = kind == 'robot' || kind == 'junk' ? HOURS_ROBOT : account == 'acc2' ? HOURS_HOME : kind == 'out' ? HOURS_SENT : HOURS_WORK;
        let date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), pickHour(hours), Math.floor(rnd() * 60), Math.floor(rnd() * 60));
        if (date > now) continue;
        let me = account == 'acc1' ? ME_WORK : ME_HOME;
        let pool = account == 'acc1' ? WORK_CONTACTS : HOME_CONTACTS;

        if (kind == 'out') {
          let to = pick(pool);
          let cc = rnd() < 0.3 ? [pick(pool)].filter(c => c != to).map(c => c[0] + ' <' + c[1] + '>') : [];
          add({ date, author: 'Alex Morgan <' + me + '>', recipients: [to[0] + ' <' + to[1] + '>'], ccList: cc, read: true, folder: account + '://Sent' });
        } else if (kind == 'junk') {
          add({ date, author: 'Prize Desk <winner@prizes.invalid>', recipients: [me], read: false, folder: 'acc1://Junk', tags: [] });
        } else {
          let from = kind == 'robot' ? pick(WORK_ROBOTS) : pick(pool);
          let cc = kind != 'robot' && account == 'acc1' && rnd() < 0.25 ? [pick(WORK_CONTACTS)].filter(c => c != from).map(c => c[0] + ' <' + c[1] + '>') : [];
          let age_days = back;
          add({ date, author: from[0] + ' <' + from[1] + '>', recipients: ['Alex Morgan <' + me + '>'], ccList: cc, ...placeReceived(account, age_days, date) });
        }
      }
    }
  }

  return {
    mailbox,
    tags: TAGS,
    contactCards: [...WORK_CONTACTS, ...HOME_CONTACTS].map(([name, email]) => vCard(name, email)),
  };
}
