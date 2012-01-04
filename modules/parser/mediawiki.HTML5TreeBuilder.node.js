/* Front-end/Wrapper for a particular tree builder, in this case the
 * parser/tree builder from the node 'html5' module. Feed it tokens using
 * processToken, and it will build you a DOM tree retrievable using .document
 * or .body(). */

var events = require('events'),
	HTML5 = require('./html5/index');

FauxHTML5 = {};


FauxHTML5.TreeBuilder = function ( ) {
	// The parser we are going to emit our tokens to
	this.parser = new HTML5.Parser();

	// Sets up the parser
	this.parser.parse(this);

	// implicitly start a new document
	this.processToken({type: 'TAG', name: 'body'});
};

// Inherit from EventEmitter
FauxHTML5.TreeBuilder.prototype = new events.EventEmitter();
FauxHTML5.TreeBuilder.prototype.constructor = FauxHTML5.TreeBuilder;

/**
 * Register for (token) 'chunk' and 'end' events from a token emitter,
 * normally the TokenTransformDispatcher.
 */
FauxHTML5.TreeBuilder.prototype.listenForTokensFrom = function ( emitter ) {
	emitter.addListener('chunk', this.onChunk.bind( this ) );
	emitter.addListener('end', this.onEnd.bind( this ) );
};

FauxHTML5.TreeBuilder.prototype.onChunk = function ( tokens ) {
	for (var i = 0, length = tokens.length; i < length; i++) {
		this.processToken(tokens[i]);
	}
};

FauxHTML5.TreeBuilder.prototype.onEnd = function ( ) {
	//console.log('Fauxhtml5 onEnd');
	// FIXME HACK: For some reason the end token is not processed sometimes,
	// which normally fixes the body reference up.
	this.document = this.parser.document;
	this.document.body = this.parser
		.document.getElementsByTagName('body')[0];

	this.emit( 'document', this.document );

	// XXX: more clean up to allow reuse.
	this.parser.setup();
	this.processToken({type: 'TAG', name: 'body'});
};


// Adapt the token format to internal HTML tree builder format, call the actual
// html tree builder by emitting the token.
FauxHTML5.TreeBuilder.prototype.processToken = function (token) {
	var att = function (maybeAttribs) {
		if ( $.isArray( maybeAttribs ) ) {
			var atts = [];
			for(var i = 0, length = maybeAttribs.length; i < length; i++) {
				var att = maybeAttribs[i];
				atts.push({nodeName: att[0], nodeValue: att[1]});
			}
			return atts;
		} else {
			return [];
		}
	};

	switch (token.type) {
		case "TEXT":
			this.emit('token', {type: 'Characters', data: token.value});
			break;
		case "TAG":
			this.emit('token', {type: 'StartTag', 
				name: token.name, 
				data: att(token.attribs)});
			break;
		case "ENDTAG":
			this.emit('token', {type: 'EndTag', 
				name: token.name, 
				data: att(token.attribs)});
			break;
		case "SELFCLOSINGTAG":
			this.emit('token', {type: 'StartTag', 
				name: token.name, 
				data: att(token.attribs)});
			this.emit('token', {type: 'EndTag', 
				name: token.name, 
				data: att(token.attribs)});
			break;
		case "COMMENT":
			this.emit('token', {type: 'Comment', 
				data: token.value});
			break;
		case "END":
			this.emit('end');
			this.emit('token', { type: 'EOF' } );
			this.document = this.parser.document;
			if ( ! this.document.body ) {
				// HACK: This should not be needed really.
				this.document.body = this.parser.document.getElementsByTagName('body')[0];
			}
			// Emit the document to consumers
			this.emit('document', this.document);
			break;
		case "NEWLINE":
			//this.emit('end');
			//this.emit('token', {type: 'Characters', data: "\n"});
			break;
		default:
			console.log("Unhandled token: " + JSON.stringify(token));
			break;
	}
};



if (typeof module == "object") {
	module.exports.FauxHTML5 = FauxHTML5;
}
