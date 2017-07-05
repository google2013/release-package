#!/usr/bin/env node --harmony
var fs = require('fs');
var inquirer = require('inquirer');
var request = require('request');
var shell = require('shelljs');
var tmp = require('tmp');

var tmpDir = tmp.dirSync();
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
	var options = {
	    url: 'https://api.bintray.com/npm/unity/unity/auth',
	    auth: {
	        'user': Object.values(answers)[0],
	        'pass': Object.values(answers)[1]
	    }
	};

	var file = '.npmrc';

	function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	try {
	    		fs.writeFile(file, body);
	    	} catch (err) {
	    		console.error(err);
	    		process.exit(1);
	    	}
	    } else {
	    	console.error(response.body);
	    	process.exit(1);
	    }

	    afterRequest();
	}

	request(options, callback);

	function afterRequest() {
		shell.exec('npm pack ' + Object.values(answers)[2] + '@' + Object.values(answers)[3] +
			' --registry http://staging-packages.unity.com',
			{silent:true, async:true}, function(code, stdout, stderr) {
			if (code !== 0) {
			  console.error(stderr);
			  process.exit(1);
			} else {
			  process.exit(0);
			}
		});

		shell.exec('npm publish ' + Object.values(answers)[2] + '-' + Object.values(answers)[3] +
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
