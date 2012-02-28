var dumpReader = require('./dumpReader.js'),
	events = require('events'),
	optimist = require('optimist'),
	colors = require('colors');

function DumpGrepper ( regexp ) {
	// inherit from EventEmitter
	//events.EventEmitter.call(this);
	this.re = regexp;
}

DumpGrepper.prototype = new events.EventEmitter();
DumpGrepper.prototype.constructor = DumpGrepper;

DumpGrepper.prototype.grepRev = function ( revision ) {
	var bits = revision.text.split( this.re );
	if ( bits.length > 1 ) {
		this.emit( 'match', revision, bits );
	}
};

module.exports.DumpGrepper = DumpGrepper;

if (module === require.main) {
	var argv = optimist.usage( 'Usage: $0 <regexp>', {
		'i': {
			description: 'Case-insensitive matching',
			'boolean': true,
			'default': false
		},
		'color': {
			description: 'Highlight matched substring using color',
			'boolean': true,
			'default': true
		}
	} ).argv;
	
	var flags = '';
	if(argv.i) {
		flags += 'i';
	}

	var re = new RegExp( '(' + argv._[0] + ')', flags );

	var reader = new dumpReader.DumpReader(),
		grepper = new DumpGrepper( re );

	reader.on( 'revision', grepper.grepRev.bind( grepper ) );
	grepper.on( 'match', function ( revision, bits ) {
		for ( var i = 0, l = bits.length; i < l-1; i += 2 ) {
			console.log( '== Match: [[' + revision.page.title + ']] ==' );
			var m = bits[i+1];
			if ( argv.color ) {
				console.log( bits[i].substr(-40) + m.green + bits[i+2].substr( 0, 40 ) );
			} else {
				console.log( bits[i].substr(-40) + m + bits[i+2].substr( 0, 40 ) );
			}
		}
	} );
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', reader.push.bind(reader) );
	process.stdin.resume();
}

