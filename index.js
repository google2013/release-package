#!/usr/bin/env node --harmony
var shell = require('shelljs');
var inquirer = require('inquirer');
var tmp = require('tmp');

var tmpDir = tmp.dirSync();
console.log("Temporary directory: ", tmpDir.name);
shell.cd(tmpDir.name);

var questions = [
	{
		type: 'input',
		name: 'username',
		message: 'What is your BinTray username (i.e. username@unity)?'
	},
	{
		type: 'password',
		name: 'apikey',
		message: 'What is your BinTray API key?'
	},
	{
		type: 'input',
		name: 'package',
		message: 'Which package would you like to release?'
	},
	{
		type: 'input',
		name: 'version',
		message: 'Which package version would you like to release?'
	}
];

inquirer.prompt(questions).then(function (answers) {
	shell.exec('curl -u ' + Object.values(answers)[0] + ':' + Object.values(answers)[1] +
		' https://api.bintray.com/npm/unity/unity/auth > .npmrc', {silent:true});

	shell.exec('npm pack ' + Object.values(answers)[2] + '@' + Object.values(answers)[3] +
		' --registry http://staging-packages.unity.com', {silent:true}, function(code, stdout, stderr) {
		if (code !== 0) {
		  console.error(stderr);
		  process.exit(1);
		} else {
		  process.exit(0);
		}
	});

	shell.exec('npm publish ' + Object.values(answers)[2] + '-' + Object.values(answers)[3] + '.tgz' + 
		' --registry https://packages.unity.com', {silent:true}, function(code, stdout, stderr) {
		if (code !== 0) {
		  console.error(stderr);
		  process.exit(1);
		} else {
		  process.exit(0);
		}
	});
});
