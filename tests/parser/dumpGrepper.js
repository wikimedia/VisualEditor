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
		console.log( 'Match:' + revision.page.title );
		for ( var i = 0, l = bits.length; i < l-1; i++ ) {
			var m = bits[i+1].match( re )[0];
			console.log( 'm: ' + m );
			console.log( bits[i].substr(-40) + m.green + bits[i+1].substr( m.length, 40 ) );
		}
		//console.log( bits.map( function ( s ) { return s.substr(0, 40) } ) );
	} );
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', reader.push.bind(reader) );
	process.stdin.resume();
}

