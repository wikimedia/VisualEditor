/**
 * Tokenizer for wikitext, using PEG.js and a separate PEG grammar file
 * (pegTokenizer.pegjs.txt)
 *
 * Use along with a HTML5TreeBuilder and the DOMPostProcessor(s) for HTML
 * output.
 *
 */

var PEG = require('pegjs'),
	path = require('path'),
	fs = require('fs'),
	$ = require('jquery'),
	events = require('events'),
	defines = require('./mediawiki.parser.defines.js');

function PegTokenizer() {
}



// Inherit from EventEmitter
PegTokenizer.prototype = new events.EventEmitter();
PegTokenizer.prototype.constructor = PegTokenizer;

PegTokenizer.src = false;

/*
 * The main worker. Sets up event emission ('chunk' and 'end' events).
 * Consumers are supposed to register with PegTokenizer before calling
 * process().
 */
PegTokenizer.prototype.process = function( text ) {
	var out, err;
	if ( !this.tokenizer ) {
		// Construct a singleton static tokenizer.
		var pegSrcPath = path.join( __dirname, 'pegTokenizer.pegjs.txt' );
		this.src = fs.readFileSync( pegSrcPath, 'utf8' );
		var tokenizerSource = PEG.buildParser(this.src).toSource();

		/* We patch the generated source to assign the arguments array for the
		* parse function to a function-scoped variable. We use this to pass
		* in callbacks and other information, which can be used from actions
		* run when matching a production. In particular, we pass in a
		* callback called for a chunk of tokens in toplevelblock. Setting this
		* callback per call to parse() keeps the tokenizer reentrant, so that it
		* can be reused to expand templates while a main parse is ongoing.
		* PEG tokenizer construction is very expensive, so having a single
		* reentrant tokenizer is a big win.
		*
		* We could also make modules available to the tokenizer by prepending
		* requires to the source.
		*/
		tokenizerSource = tokenizerSource.replace( 'parse: function(input, startRule) {',
					'parse: function(input, startRule) { var __parseArgs = arguments;' );
		//console.warn( tokenizerSource );
		PegTokenizer.prototype.tokenizer = eval( tokenizerSource );
		// alias the parse method
		this.tokenizer.tokenize = this.tokenizer.parse;
	}

	// Some input normalization: force a trailing newline
	if ( text.substring(text.length - 1) !== "\n" ) {
		text += "\n";
	}

	// XXX: Commented out exception handling during development to get
	// reasonable traces.
	//try {
		this.tokenizer.tokenize(text, 'start', 
				// callback
				this.emit.bind( this, 'chunk' ),
				// inline break test
				this
				);
		this.emit('end');
	//} catch (e) {
		//err = e;
		//console.trace();
	//} finally {
		return { err: err };
	//}
};

PegTokenizer.prototype.processImageOptions = function( text ) {
		return this.tokenizer.tokenize(text, 'img_options', null, this );
};

/**
 * Tokenize a URL
 */
PegTokenizer.prototype.tokenizeURL = function( text ) {
	try {
		return this.tokenizer.tokenize(text, 'url', null, this );
	} catch ( e ) {
		return false;
	}
};

/*
 * Inline breaks, flag-enabled production which detects end positions for
 * active higher-level productions in inline and other nested productions.
 * Those inner productions are then exited, so that the outer production can
 * handle the end marker.
 */
PegTokenizer.prototype.inline_breaks = function (input, pos, syntaxFlags ) {
	switch( input[pos] ) {
		case '=':
			return ( syntaxFlags.equalAttrib && 
					(syntaxFlags.equalTemplate || ! syntaxFlags.template ) ) ||
				(syntaxFlags.equalTemplate && 
				 (syntaxFlags.equalAttrib || syntaxFlags.template)) ||
				( syntaxFlags.h &&
				  input.substr( pos + 1, 200)
				  .match(/[ \t]*[\r\n]/) !== null ) || null;
		case '|':
			return syntaxFlags.pipe ||
					syntaxFlags.template ||
				( syntaxFlags.table &&
				  ( input[pos + 1].match(/[|}]/) !== null ||
					syntaxFlags.tableCellArg
				  ) 
				) || null;
		case "!":
			return syntaxFlags.table && input[pos + 1] === "!" ||
				null;
		case "}":
			return syntaxFlags.template && input[pos + 1] === "}" || null;
		case ":":
			return syntaxFlags.colon &&
				! syntaxFlags.extlink &&
				! syntaxFlags.linkdesc || null;
		case "\r":
			return syntaxFlags.table &&
				input.substr(pos, 4).match(/\r\n?[!|]/) !== null ||
				null;
		case "\n":
			return syntaxFlags.table &&
				input[pos + 1] === '!' ||
				input[pos + 1] === '|' ||
				null;
		case "]":
			return syntaxFlags.extlink ||
				( syntaxFlags.linkdesc && input[pos + 1] === ']' ) ||
				null;
		case "<":
			return syntaxFlags.pre &&  input.substr( pos, 6 ) === '</pre>' || null;
		default:
			return null;
	}
};

// Alternate version of the above. The hash is likely faster, but the nested
// function calls seem to cancel that out.
PegTokenizer.prototype.breakMap = {
	'=': function(input, pos, syntaxFlags) { 
		return syntaxFlags.equal ||
			( syntaxFlags.h &&
			  input.substr( pos + 1, 200)
			  .match(/[ \t]*[\r\n]/) !== null ) || null;
	},
	'|': function ( input, pos, syntaxFlags ) {
		return syntaxFlags.template ||
			   syntaxFlags.linkdesc ||
			( syntaxFlags.table &&
			  ( input[pos + 1].match(/[|}]/) !== null ||
				syntaxFlags.tableCellArg
			  ) 
			) || null;
	},
	"!": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.table && input[pos + 1] === "!" ||
			null;
	},
	"}": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.template && input[pos + 1] === "}" || null;
	},
	":": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.colon &&
			! syntaxFlags.extlink &&
			! syntaxFlags.linkdesc || null;
	},
	"\r": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.table &&
			input.substr(pos, 4).match(/\r\n?[!|]/) !== null ||
			null;
	},
	"\n": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.table &&
			input[pos + 1] === '!' ||
			input[pos + 1] === '|' ||
			null;
	},
	"]": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.extlink ||
			( syntaxFlags.linkdesc && input[pos + 1] === ']' ) ||
			null;
	},
	"<": function ( input, pos, syntaxFlags ) {
		return syntaxFlags.pre &&  input.substr( pos, 6 ) === '</pre>' || null;
	}
};

PegTokenizer.prototype.inline_breaks_hash = function (input, pos, syntaxFlags ) {
	return this.breakMap[ input[pos] ]( input, pos, syntaxFlags);
	//console.warn( 'ilbn res: ' + JSON.stringify( [ res, input.substr( pos, 4 ) ] ) );
	//return res;
};



if (typeof module == "object") {
	module.exports.PegTokenizer = PegTokenizer;
}
