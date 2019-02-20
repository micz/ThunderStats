var convert = require('xml-js');
var xml = require('fs').readFileSync('./src/install.rdf', 'utf8');
var options = {ignoreComment: true, alwaysChildren: true, compact: true};
var result = convert.xml2js(xml, options); // or convert.xml2json(xml, options)

if (process.argv[2] === '-get' && process.argv[3]) {
	var p = process.argv[3];
	p = p.replace(/^"|"$/g, '');
	var rdfXMLPath = 'result.RDF.' + process.argv[3] + '._text';
	console.log(eval(rdfXMLPath));
} else {
	console.log(result.RDF.Description["em:id"]._text);
}



