// cleidigh - build Thunderbird add-on - Use package configuration for XUL or hybrid with manifest

const fs = require('fs');
const _7z = require('7zip-min');
const xml_util = require('./xml-util.js');
const loadJsonFile = require('load-json-file');

// Configuration args

let targetName = '';

const targetBaseName = process.env.npm_package_name;
const targetVersion = process.env.npm_package_version;
const targetSuffix = process.env.npm_package_config_target_suffix;
const targetExtension = process.env.npm_package_config_target_extension;
const includeManifest = (process.env.npm_package_config_target_include_manifest === 'true') ? true : false;

const sourceDir = process.env.npm_package_config_source_dir;
const targetDir = process.env.npm_package_config_target_dir;

// Validate configuration properties

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
	console.error('Build Error: ' + error);
	return 1;
}

console.log('Building Target::\n');
console.log('TargetName:\t\t' + targetName + ` [ manifest: ${includeManifest} ]`);

// 7z adds to existing archive - must delete old first
if (fs.existsSync(`${targetDir}/${targetName}`)) {
	console.log('Target Exists:\t\tRemoving old target');
	fs.unlinkSync(`${targetDir}/${targetName}`);
}

const installRDFVersion = xml_util.rdfGetValue(`${sourceDir}/install.rdf`, 'Description[\"em:version\"]');
const manifestVersion = loadJsonFile.sync(`${sourceDir}/manifest.json`).version;
const manifestName = loadJsonFile.sync(`${sourceDir}/manifest.json`).name;
const ignoreFile = (includeManifest ? null : `-x!${sourceDir}/manifest.json`);

console.log('\nVersioning:\n  Target:\t\t' + targetVersion + '\n  install.rdf:\t\t' + installRDFVersion + '\n  manifest.json:\t' + manifestVersion);

if (installRDFVersion !== targetVersion) {
	console.log(`\nVersion Mismatch: [Error]\n  install.rdf: ${installRDFVersion} != package.json: ${targetVersion}`);
	return 1;
}

if (includeManifest && manifestVersion !== targetVersion) {
	console.log(`\nVersion Mismatch:\n  manifest.json: ${manifestVersion} != package.json: ${targetVersion}`);
	return 1;
}

if (includeManifest && (manifestName + targetExtension) !== targetName) {
	console.log(`\nName Mismatch:\n  manifest.json: ${manifestName} != package.json: ${targetName}`);
	return 1;
}

let _7zCommand = ['a', `${targetDir}/${targetName}`, `${sourceDir}/*`, `-x@./src/.tb-hybrid-ignore`];

if (ignoreFile) {
	_7zCommand.push(`${ignoreFile}`);
}

// Create xpi archive using exclude file
_7z.cmd(_7zCommand, err => {
	if (err) {
		console.log('\nArchive Error: ' + err);
		return 1;
	}
	console.log('\nArchive Complete: ' + targetName + ` [ manifest: ${includeManifest} ]`);

});
