/* Front-end/Wrapper for a particular tree builder, in this case the
 * parser/tree builder from the node 'html5' module. Feed it tokens using
 * processToken, and it will build you a DOM tree retrievable using .document
 * or .body(). */

var events = require('events');
var HTML5 = require('./html5/index');

FauxHTML5 = {};


FauxHTML5.TreeBuilder = function ( ) {
	// The parser we are going to emit our tokens to
	this.parser = new HTML5.Parser();

	// Sets up the parser
	this.parser.parse(this);
	this.document = this.parser.document;
	return this;
};

FauxHTML5.TreeBuilder.prototype = new events.EventEmitter();

// Adapt the token format to internal HTML tree builder format, call the actual
// html tree builder by emitting the token.
FauxHTML5.TreeBuilder.prototype.processToken = function (token) {
	var att = function (maybeAttribs) {
		if ( $.isArray(maybeAttribs) ) {
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
			break;
		case "COMMENT":
			this.emit('token', {type: 'Comment', 
				data: token.value});
			break;
		case "END":
			this.emit('end');
			break;
		case "NEWLINE":
			//this.emit('end');
			break;
		default:
			console.log("Unhandled token: " + JSON.stringify(token));
			break;
	}
};

FauxHTML5.TreeBuilder.prototype.body = function () {
	return this.parser.document.getElementsByTagName('body')[0];
}


if (typeof module == "object") {
	module.exports.FauxHTML5 = FauxHTML5;
}
