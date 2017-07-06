#!/usr/bin/env node --harmony
var fs = require('fs');
var inquirer = require('inquirer');
var request = require('request');
var shell = require('shelljs');
var tmp = require('tmp');

var tmpDir = tmp.dirSync();
shell.cd(tmpDir.name);
const file = '.npmrc';

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
	var options = {
	    url: 'https://api.bintray.com/npm/unity/unity/auth',
	    auth: {
	        'user': answers.username,
	        'pass': answers.apikey
	    }
	};

	request(options, authCallback);

	function authCallback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	try {
	    		fs.writeFileSync(file, body);
	    	} catch (err) {
	    		console.error(err);
	    		process.exit(1);
	    	}
	    } else {
	    	console.error(response.body);
	    	process.exit(1);
	    }
	    fetchPackage();
	}

	function fetchPackage() {
		shell.exec('npm pack ' + answers.package +
			'@' + answers.version +
			' --registry http://staging-packages.unity.com',
			{silent:true, async:true}, function(code, stdout, stderr) {
			if (code !== 0) {
			  console.error(stderr);
			  process.exit(1);
			}
			publishPackage();
		});
	}

	function publishPackage() {
		shell.exec('npm publish ' + answers.package +
			'-' + answers.version +
			'.tgz' + ' --registry https://packages.unity.com',
			{silent:true, async:true}, function(code, stdout, stderr) {
			if (code !== 0) {
			  console.error(stderr);
			  process.exit(1);
			} else {
			  process.exit(0);
			}
		});
	}
});
