// init globals
var	_shell 		= 	require('shelljs'),
	_colors 	=	require('colors'),
	_cur_dir 	= 	process.cwd(),
	_path 		= 	require('path'),
	args 		= 	process.argv.slice(2),
	connected 	= 	false,
	_packages 	= 	[];
var _omit_packages = [
	'com.monotype.*',
	'com.sec.*',
	'com.samsung.*',
	'org.simalliance.*',
	'com.android.*',
	'com.google.android.*',
	'com.gd.mobicore.pa',
	'android',
	'com.fmm.*',
	'com.visionobjects.*',
	'com.wssnps',
	'com.policydm',
	'com.wssyncmldm'
];

//shell run
var _run = function(cmd) {
	var _r = _shell.exec(cmd, { silent:true });
	return { out: _r.stdout, code: _r.code, error: _r.stderr };
};

//test if there is an android device connected
var isConnected = function() {
	var _is = _run('bin/adb shell pm list packages');
	_packages = [];
	if (_is.code==0) {
		connected = true;
		var _lines = _is.out.split('\n');
		for (var line_f in _lines) {
			var line = _lines[line_f].split('package:').join('').trim();
			// check this package isn't within omit_packages
			var _inc = true;
			for (var _om in _omit_packages) {
				var _omit = _omit_packages[_om];
				if (_omit.indexOf('*')>-1) {
					// test if omit in inside line
					var _omit_s = _omit.split('*').join('');
					if (line.indexOf(_omit_s)!==-1) {
						_inc = false;
					}
				} else {
					// test if omit is exactly the same as line
					if (line==_omit) {
						_inc = false;
					}
				}
			}
			if (_inc && line!='') {
				_packages.push(line);
			}
		}
		console.log('programs:',_packages);
		//console.log('this is text:'+_is.out);
	} else {
		if (_is.error.indexOf('no devices found')!=-1) {
			connected = false;
			console.log('apk_pull -> no connected android device detected !'.red);
		} else {
			console.log('apk_pull -> error reading bin/adb'.red,_is);
		}
	}
};

isConnected();
