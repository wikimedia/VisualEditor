var HTML5 = require('html5').HTML5;

// No instance properties 
function Parsoid() {}

function initParsoid() {
	var path = require('path');
	var fileDependencies = [];
	var basePath = path.join(path.dirname(path.dirname(process.cwd())), 'modules');

	function _require(filename) {
		var fullpath = path.join( basePath, filename );
		fileDependencies.push( fullpath );
		return require( fullpath );
	}

	function _import(filename, symbols) {
		var module = _require(filename);
		symbols.forEach(function(symbol) {
			global[symbol] = module[symbol];
		});
	}

	_import(path.join('parser', 'mediawiki.parser.environment.js'), ['MWParserEnvironment']);
	_import(path.join('parser', 'mediawiki.parser.js'), ['ParserPipelineFactory']);
	_import(path.join('parser', 'mediawiki.WikitextSerializer.js'), ['WikitextSerializer']);

	var mwEnv = new MWParserEnvironment({ 
		fetchTemplates: false,
		debug: false,
		trace: false,
		wgUploadPath: 'http://example.com/images'
	});

	// "class" properties
	Parsoid.html5 = new HTML5.Parser();
	Parsoid.serializer = new WikitextSerializer({env: mwEnv});
}

initParsoid();

if (typeof module == "object") {
	module.exports.Parsoid = Parsoid;
}
