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

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

// CRC-32 lookup table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Zip a directory into destFile.
 * @param {string} sources - Source directory path
 * @param {string} destFile - Output zip file path
 * @param {string[]} [exclude=[]] - Relative paths to exclude (files or folders)
 * @param {{full: string, rel: string}[]} [extraFiles=[]] - Extra files to add with custom rel paths
 */
function zip(sources, destFile, exclude = [], extraFiles = []) {
  const files = [];
  const parentDir = path.dirname(destFile);
  if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

  function collect(full, rel) {
    if (exclude.some(e => rel === e || rel.startsWith(e + "/"))) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) collect(path.join(full, name), rel + "/" + name);
    } else {
      files.push({ full, rel });
    }
  }

  for (const name of fs.readdirSync(sources)) collect(path.join(sources, name), name);

  // Add extra files (e.g., VENDORS.md, DEVELOPER.md from project root)
  for (const extra of extraFiles) {
    files.push(extra);
  }

  const parts = [], centralDir = [];
  let offset = 0;

  for (const { full, rel } of files) {
    const data       = fs.readFileSync(full);
    const compressed = zlib.deflateRawSync(data);
    const useDeflate = compressed.length < data.length;
    const fileData   = useDeflate ? compressed : data;
    const method     = useDeflate ? 8 : 0;
    const crc        = crc32(data);
    const nameBytes  = Buffer.from(rel, "utf8");

    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);          local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);         local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);       local.writeUInt32LE(fileData.length, 18);
    local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    nameBytes.copy(local, 30);

    const cd = Buffer.alloc(46 + nameBytes.length);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4);  cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);          cd.writeUInt16LE(method, 10); cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);         cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(fileData.length, 20); cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBytes.length, 28); cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);         cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);         cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBytes.copy(cd, 46);

    parts.push(local, fileData);
    centralDir.push(cd);
    offset += local.length + fileData.length;
  }

  const cdBuf = Buffer.concat(centralDir);
  const eocd  = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);          eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10); eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);    eocd.writeUInt16LE(0, 20);

  fs.writeFileSync(destFile, Buffer.concat([...parts, cdBuf, eocd]));
}

export function createXpi() {
  const { version } = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // Read allowed languages from LANG.md (project root)
  const allowedLangs = fs.readFileSync('LANG.md', 'utf8')
    .split('\n').map(l => l.trim()).filter(Boolean);

  // Find all language folders in dist/_locales
  const allLangs = fs.existsSync('dist/_locales')
    ? fs.readdirSync('dist/_locales')
    : [];

  // Build exclusion list for languages not in LANG.md
  const exclude = allLangs
    .filter(lang => !allowedLangs.includes(lang))
    .map(lang => `_locales/${lang}`);

  // Collect extra root-level md files if they exist
  const extraFiles = [];
  for (const mdFile of ['VENDORS.md', 'DEVELOPER.md', 'LICENSE']) {
    if (fs.existsSync(mdFile)) {
      extraFiles.push({ full: mdFile, rel: mdFile });
    }
  }

  const xpiName = `../thunderstats-${version}.xpi`;
  zip('dist', xpiName, exclude, extraFiles);
  console.log(`\n✓ XPI created: ${xpiName}`);
}
