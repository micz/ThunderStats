// cleidigh

let fs = require('fs');
const _7z = require('7zip-min');

// Configuration args

let targetBaseName = process.env.npm_package_name;
let targetVersion = process.env.npm_package_version;
let targetSuffix = process.env.npm_package_config_target_suffix;
let targetExtension = process.env.npm_package_config_target_extension;

let sourceDir = process.env.npm_package_config_source_dir;
let targetDir = process.env.npm_package_config_target_dir;

let targetName = '';

// console.log(process.env);

try {
	if (typeof targetBaseName !== 'string') {
		throw 'No targetBasedName';
	}
	if (typeof targetVersion !== 'string') {
		throw 'No targetVersion';
	}
	if (typeof sourceDir !== 'string') {
		throw 'No Source Directory';
	}
	if (typeof targetDir !== 'string') {
		throw 'No targetDir';
	}
	if (typeof targetSuffix !== 'string') {
		targetSuffix = '';
	}
	if (typeof targetExtension !== 'string') {
		targetExtension = '.xpi';
	}


	targetName = `${targetBaseName}-${targetVersion}${targetSuffix}${targetExtension}`;
} catch (error) {
	console.error(error);
	return 1;
}

console.log(targetName);

// Create xpi archive using exclude file
_7z.cmd(['a', `${targetDir}/${targetName}`, `${sourceDir}/*`, '-x@./src/.tb-hybrid-ignore'], err => {
    // done
	console.log('Archive done: '+err);

});


function handleError(err) {
	console.error('Archive Error: '+err);
}
