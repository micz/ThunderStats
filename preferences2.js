var fs = require("fs");

var infile = ".\\src\\chrome\\content\\mzts-settings.xul"

// Synchronous read
var data = fs.readFileSync(infile);

var fileText = data.toString();
console.log("Synchronous read: " + data.toString());

const prefLineRe = /<preference[.="\-@\w\s]+\/>/g
    // id = re.search(r'id[\s]*="([\w.\-_]*)"', p0).group(1)
const idRe = /id[\s]*="([\w.\-_]*)"/;
const nameRe = /name[\s]*="([\w.\-_]*)"/;
const typeRe = /type[\s]*="([\w.\-_]*)"/;


var prefArrayConverted = [];
var ps = fileText.match(prefLineRe);

ps.forEach(p => {
    p = p.replace(/\s+/g, ' ');
    prefArrayConverted.push({ id: p.match(idRe)[1], name: p.match(nameRe)[1], type: p.match(typeRe)[1] });
});

console.debug('Preferences.addAll([');
prefArrayConverted.forEach(pref => {
    var prefLineTemplate = `{ id: "${pref.id}" name: "${pref.name}" type: "${pref.type}" },`;

    console.debug(prefLineTemplate);
});

console.debug('];\n');