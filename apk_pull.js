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
	_progress;

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
		_progress.color = 'cyan', _progress.text = 'reading package: '+this._appid;
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

var getAndroidBackup = function(appid, cb) {
	console.log('Please unlock the device and accept the backup.'.green);
	var _ab = _run('bin/adb backup -apk '+appid);
	console.log('backup ready'.yellow);
	cb(true);
};

var androidBackup2apk = function(appid, appname, cb) {
	_progress = _ora({ text: 'Extracting APK from backup', spinner:'dots5' }).start();
	var _cvt = _run('dd if=backup.ab bs=1 skip=24 | python -c "import zlib,sys;sys.stdout.write(zlib.decompress(sys.stdin.read()))" | tar -xvf -');
	_progress.color = 'green', _progress.text = 'almost ready';
	var _src = 'apps/'+appid+'/a/' +  'base.apk';
	var _dst = appname + '.apk';
	_shell.mv(_src,_dst);
	// delete apps dir
	cb(true);
};

//test if there is an android device connected
var getPackages = function(cb) {
	var _is = _run('bin/adb shell pm list packages');
	_packages = {};
	if (_is.code==0) {
		connected = true;
		_progress.color = 'cyan', _progress.text = 'reading packages';
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
			//_progress.color = 'red', _progress.text = 'no android device detected';
			console.log('apk_pull -> no connected android device detected !'.red);
		} else {
			//_progress.color = 'red', _progress.text = 'error reading bin/adb';
			console.log('apk_pull -> error reading bin/adb'.red,_is);
		}
		cb([]);
	}
};


//CLI start
console.log('APK Pull - Get Any APK from Any Connected Android Device'.green);
_progress = _ora({ text: 'Detecting android devices', spinner:'dots5' }).start();
getPackages(function(data) {
	_progress.stop();
	var inquirer = require('inquirer');
	var choices = [];
	for (var _i in data) {
		choices.push({ name:data[_i], value:_i });
	}
	choices.push(new inquirer.Separator());
	choices.push({ name:':: Exit ::', value:'_exit_' });
	choices.push(new inquirer.Separator());
	inquirer.prompt([
		{	type:'list',	
			name:'appid',	
			message:'Please select an app of your device:',
			choices:choices
		}
	]).then(function(answer) {
		getAndroidBackup(answer, function(ready) {
			console.log('backup grabbed.');
		});
		//console.log(answer);
	});
	//console.log('programs:',data);
});























