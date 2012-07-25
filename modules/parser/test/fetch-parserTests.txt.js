var fs = require('fs'),
	path = require('path'),
	https = require('https');

var url = {
	host: 'gerrit.wikimedia.org',
	path: '/r/gitweb?p=mediawiki/core.git;a=blob_plain;hb=HEAD;f=tests/parser/parserTests.txt',
};
var target_name = __dirname+"/parserTests.txt";

var fetch = function(url, target_name) {
	https.get(url, function(result) {
		var out = fs.createWriteStream(target_name);
		result.on('data', function(data) {
			out.write(data);
		});
		result.on('end', function() {
			if (out)
				out.end();
		});
	}).on('error', function(err) {
		console.error(err);
	});
};
path.exists(target_name, function(exists) {
	if (!exists) {
		fetch(url, target_name);
	}
});
