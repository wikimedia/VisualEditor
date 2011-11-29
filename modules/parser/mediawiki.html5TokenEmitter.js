var events = require('events');


var HTML5 = require('./html5/index');

FauxHTML5 = {};


FauxHTML5.Tokenizer = function ( ) {
	this.parser = new HTML5.Parser();
	this.parser.parse(this);
	return this;
};

FauxHTML5.Tokenizer.prototype = new events.EventEmitter();

FauxHTML5.Tokenizer.prototype.processToken = function (token) {
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

if (typeof module == "object") {
	module.exports.FauxHTML5 = FauxHTML5;
}
