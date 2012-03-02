/**
 * Simple link handler. Registers after template expansions, as an
 * asynchronous transform.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * 
 * TODO: keep round-trip information in meta tag or the like
 */

var jshashes = require('jshashes'),
	PegTokenizer = require('./mediawiki.tokenizer.peg.js').PegTokenizer;

function WikiLinkHandler( manager, isInclude ) {
	this.manager = manager;
	this.manager.addTransform( this.onWikiLink.bind( this ), this.rank, 'tag', 'wikilink' );
	// create a new peg parser for image options..
	if ( !this.imageParser ) {
		// Actually the regular tokenizer, but we'll call it with the
		// img_options production only.
		WikiLinkHandler.prototype.imageParser = new PegTokenizer();
	}
}

WikiLinkHandler.prototype.rank = 1.15; // after AttributeExpander

WikiLinkHandler.prototype.onWikiLink = function ( token, manager, cb ) {
	var env = this.manager.env;
	var title = this.manager.env.makeTitleFromPrefixedText( 
				env.tokensToString(
					env.lookupKV( token.attribs, 'href' ).v 
				)
			);

	if ( title.ns.isFile() ) {
		return this.renderFile( token, manager, cb, title );
	} else if ( title.ns.isCategory() ) {
		// TODO: implement
		return [];
	} else {
		// Check if page exists
		// 
		var obj = new TagTk( 'a', [ this.manager.env.lookupKV( token.attribs, 'href' ) ] );
		obj.attribs.push( new KV('data-mw-type', 'internal') );
		var out = [obj].concat( this.manager.env.lookupKV( token.attribs, 'content' ).v, 
								new EndTagTk( 'a' ) );
		//console.warn( JSON.stringify( out, null, 2 ) );
		return { tokens: out };
	}
};


WikiLinkHandler.prototype.renderFile = function ( token, manager, cb, title ) {
	var env = manager.env;
	// distinguish media types
	// if image: parse options
	
	var content = env.lookupKV( token.attribs, 'content' ).v;

	// XXX: get /wiki from config!
	var a = new TagTk( 'a', [ new KV( 'href', '/wiki' + title.makeLink() ) ] );

	var MD5 = new jshashes.MD5(),
		hash = MD5.hex( title.key ),
		// XXX: Hackhack..
		path = 'http://example.com/images/' + 
			[ hash[0], hash.substr(0, 2) ].join('/') + '/' + title.key;
	
	
	// XXX: parse options
	var contentPos = token.dataAttribs.contentPos;
	var optionSource = token.source.substr( contentPos[0], contentPos[1] - contentPos[0] );
	console.log( 'optionSource: ' + optionSource );
	var options = this.imageParser.processImageOptions( optionSource );
	//console.log( JSON.stringify( options, null, 2 ) );
	// XXX: check if the file exists, generate thumbnail
	// XXX: render according to mode (inline, thumb, framed etc)
	var img = new SelfclosingTagTk( 'img', 
			[ 
				// FIXME!
				new KV( 'height', '220' ),
				new KV( 'width', '1941' ),
				new KV( 'src', path ),
				new KV( 'alt', title.key )
			] );

	return { tokens: [ a, img, new EndTagTk( 'a' )] };
};

WikiLinkHandler.prototype.parseImageOptions = function ( tokens ) {
	var out = [],
		s = '';

	for ( var i = 0, l = tokens.length; i < l; i++ ) {
		var token = tokens[i];
		if ( token.constructor === String ) {
			s += token;
		} else if ( token.type === 'NEWLINE' ) {
			s += '\n'; // XXX: preserve original newline
		} else if ( token.type === 'COMMENT' ) {
			// strip it
		} else {
			var res = this.imageParser.processImageOptions( s, 'img_options' ),
				last = res.last();

			if ( res.last().k !== 'caption' ) {
				last.v.push = [last.v, token];
			}
			out.push( s );
			s = '';
			out.push(token);
		}
	}
};

if (typeof module == "object") {
	module.exports.WikiLinkHandler = WikiLinkHandler;
}
