// cleidigh

let fs = require('fs');
// import Seven from 'node-7z'
let Seven = require('node-7z');

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

// exclude: [`@${sourceDir}/.jpmignore`],
// $raw: [`-x@${sourceDir}\\.jpmignore`],
let archive = Seven.add( `${targetDir}\\${targetName}`, `${sourceDir}\\*`, {
	// exclude: [`${sourceDir}\\.jpmignore`],
	// $raw: [`-x .src\\manifest.json`],
	recursive: true
  })

archive.on('end', function () {
    // end of the operation, get the number of folders involved in the operation
  archive.info.get('Folders') //? '4'
  console.error(archive.info);
  console.error('Archive Done Folders:Files - '+ archive.info.get('Folders')+ ' : '+archive.info.get('Files'));
})
 
// const archive2 = Seven.delete( `${targetDir}\\${targetName}`, `${sourceDir}/manifest.json`);

archive.on('error', (err) => handleError(err))

function handleError(err) {
	console.error('Archive Error: '+err);
}
