// init globals
var	_shell 		= 	require('shelljs'),
	_colors 	=	require('colors'),
	_ora 		= 	require('ora'),
	_path 		= 	require('path'),
	_cheerio 	=	require('cheerio'),
	_cur_dir 	= 	process.cwd(),
	args 		= 	process.argv.slice(2),
	connected 	= 	false,
	_packages 	= 	{},
	_loading;

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

//get appname from appid
var getName = function(appid, cb) {
	var request = require('request'), _resp='', res, body='', $;
	//console.log('requesting name for '.green+appid.yellow);
	request({ timeout:3000, url:'https://play.google.com/store/apps/details?id='+appid.toLowerCase() }, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		_loading.color = 'cyan', _loading.text = 'reading package: '+this._appid;
		try {
		  	$ = _cheerio.load(body);
		  	_resp = $('div[class=id-app-title]').text();
	  	} catch(_i) {
	  	}
	  } else {
	  	_resp = this._appid; // if app-title is not found, return appid
	  }
	  cb(_resp);
	}.bind({ _appid:appid }))
};

//test if there is an android device connected
var getPackages = function(cb) {
	var _is = _run('bin/adb shell pm list packages');
	_packages = {};
	if (_is.code==0) {
		connected = true;
		_loading.color = 'cyan', _loading.text = 'reading packages';
		var _lines = _is.out.split('\n');
		// get real packages from device
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
				_packages[line]='';
			}
		}
		// get packages realnames
		var _completed = 0;
		var _total = Object.keys(_packages).length;
		for (var _id in _packages) {
			getName(_id, function(real) {
				_packages[this._id] = real;
				_completed++;
				if (_completed == _total) {
					cb(_packages);
				}
			}.bind({ _id:_id }));
		}
		//
	} else {
		if (_is.error.indexOf('no devices found')!=-1) {
			connected = false;
			//_loading.color = 'red', _loading.text = 'no android device detected';
			console.log('apk_pull -> no connected android device detected !'.red);
		} else {
			//_loading.color = 'red', _loading.text = 'error reading bin/adb';
			console.log('apk_pull -> error reading bin/adb'.red,_is);
		}
		cb([]);
	}
};

//CLI start
console.log('APK Pull - Get Any APK from Any Connected Android Device'.green);
_loading = _ora({ text: 'Detecting android devices', spinner:'dots5' }).start();
getPackages(function(data) {
	_loading.stop();
	var Menu = require('terminal-menu');
	var menu = Menu({ width: 50 }); // , x: 4, y: 2
	menu.reset();
	menu.write('APK PULL - SELECT APP TO RETRIEVE\n');
	menu.write('---------------------------------\n');
	for (var _item in data) {
		if (_item != data[_item]) menu.add(data[_item]);
	}
	menu.add('EXIT');
	menu.on('select', function (label) {
    	menu.close();
    	console.log('SELECTED: ' + label);
	});
	process.stdin.pipe(menu.createStream()).pipe(process.stdout);
	process.stdin.setRawMode(true);
	menu.on('close', function () {
	    process.stdin.setRawMode(false);
	    process.stdin.end();
	});
	//console.log('programs:',data);
});
