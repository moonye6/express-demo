var fs = require('fs');
var request = require('request');
var path = require('path');
var url = require('url');
var config = require('../config/config')

module.exports = function(req, res, next) {
	console.log('current url is: ' + url.parse(req.url).pathname);
	var pathname = url.parse(req.url).pathname

	if(!/^\/cgi-bin/.test(pathname))  {
		next();
	} else {
		var tPath = pathname.replace(/-/g, '');
		console.log("local" + JSON.stringify(config))
		if(config.cgi.local) {
			local(req, res, next);
		} else {
			redirect(req, res, next);
		}
	}
}

function redirect(req, res, next) {
	var opt = {
		method: req.method,
		url: 'http://' + config.host.ip + req.url,
		host: config.host.domain,
		headers: {
			host: config.host.domain,
			origin: config.host.origin
		}
	}
	request(opt).pipe(res);

	var pathname = url.parse(req.url).pathname;
	var cgiPath = path.join(__dirname, "../", pathname);

	makeDir(cgiPath, function() {
		request(opt).pipe(fs.createWriteStream(cgiPath));
	})
}

function local(req, res, next) {
	var pathname = url.parse(req.url).pathname;
	var cgiPath = path.join(__dirname, "../", pathname);

	fs.exists(cgiPath, function(exists) {
		if(exists) {
			console.log('use local');
			fs.createReadStream(cgiPath).pipe(res);
		} else {
			redirect(req, res, next)
		}
	})
	
}

function makeDir(dir, cb) {
	var n = 3;
	while((n = dir.indexOf('\\', n)) && n >= 0) {
		var d = dir.substring(0, n);
		!fs.existsSync(d) && fs.mkdirSync(d);
		n += 1;
	}

	cb();
}
