var xmlpoke = require('xmlpoke');

xmlpoke('./src/install.rdf', function(xml) { 
	xml.errorOnNoMatches;
	console.log('in function')
	try {
		xml.set('oDF/Description/em:id', 'cleidigh');
		
	} catch (e) {
		console.log('catch error')
	}
});
 