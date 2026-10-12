// Conversion of the Thunderbird WebExtension objects to the dump format (see README.md), with the
// anonymization when an anonymizer (anonymize.js) is given. Used by dump.js and by the synthetic dump
// generator of the tests (tests/real/make-sample-dump.js).

export const FORMAT = 'thunderstats-mailbox-dump';
export const FORMAT_VERSION = 1;

const IDENTITY = { email: v => v, text: v => v, messageId: v => v, tagKey: v => v, tagName: v => v, vCard: v => v };

export function flattenFolders(folders, output = []) {
  for (let folder of folders) {
    output.push(folder);
    flattenFolders(folder.subFolders || [], output);
  }
  return output;
}

// Folder tree as returned by folders.getSubFolders. folder_ids maps the original id to the dumped one
// (the messages refer to their folder by id)
export function dumpFolder(folder, anon, folder_ids) {
  let path = folder.path;
  let name = folder.name;
  let id = folder.id;
  if (anon) {
    let special = (folder.specialUse || []).length > 0;
    path = path.split('/').map((segment, i, all) => {
      if (segment == '') return segment;
      // a special folder keeps its own name (its ancestors do not)
      if (special && i == all.length - 1) return segment;
      return anon.folderSegment(segment);
    }).join('/');
    name = special ? name : anon.folderSegment(name);
    id = folder.id.endsWith(folder.path) ? folder.id.slice(0, folder.id.length - folder.path.length) + path : folder.accountId + ':/' + path;
  }
  folder_ids.set(folder.id, id);
  return {
    id,
    accountId: folder.accountId,
    name,
    path,
    specialUse: folder.specialUse || [],
    subFolders: (folder.subFolders || []).map(sub => dumpFolder(sub, anon, folder_ids)),
  };
}

export function dumpAccount(account, index, anon, folder_ids) {
  let folders = account.rootFolder ? (account.rootFolder.subFolders || []) : (account.folders || []);
  return {
    id: account.id,
    name: anon ? 'Account ' + (index + 1) : account.name,
    type: account.type,
    identities: (account.identities || []).map(identity => ({ email: (anon || IDENTITY).email(identity.email) })),
    folders: folders.map(folder => dumpFolder(folder, anon, folder_ids)),
  };
}

export function dumpMessage(message, folder_id, anon) {
  let a = anon || IDENTITY;
  return {
    id: message.id,
    headerMessageId: a.messageId(message.headerMessageId),
    date: message.date ? new Date(message.date).toISOString() : null,
    author: a.text(message.author),
    recipients: (message.recipients || []).map(a.text),
    ccList: (message.ccList || []).map(a.text),
    bccList: (message.bccList || []).map(a.text),
    subject: a.text(message.subject),
    read: !!message.read,
    flagged: !!message.flagged,
    tags: (message.tags || []).map(a.tagKey),
    folder: folder_id,
  };
}

export function dumpTag(tag, anon) {
  let a = anon || IDENTITY;
  return { key: a.tagKey(tag.key), tag: a.tagName(tag.tag), color: tag.color, ordinal: tag.ordinal };
}

export function dumpContact(vCard, anon) {
  return (anon || IDENTITY).vCard(vCard);
}
