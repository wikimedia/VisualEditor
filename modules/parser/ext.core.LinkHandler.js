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
	var env = this.manager.env,
		href = env.lookupKV( token.attribs, 'href' ).v,
		tail = env.lookupKV( token.attribs, 'tail' ).v;
	var title = this.manager.env.makeTitleFromPrefixedText( 
					env.tokensToString( href )
				);

	if ( title.ns.isFile() ) {
		return this.renderFile( token, manager, cb, title );
	} else if ( title.ns.isCategory() ) {
		// TODO: implement
		return [];
	} else {
		// Check if page exists
		// 
		//console.warn( 'title: ' + JSON.stringify( title ) );
		var obj = new TagTk( 'a', [ new KV( 'href', title.makeLink() ) ] ),
			content = this.manager.env.lookupKV( token.attribs, 'content' ).v;
		//console.warn('content: ' + JSON.stringify( content, null, 2 ) );
		// XXX: handle trail
		if ( content.length ) {
			var out = []
			for ( var i = 0, l = content.length; i < l ; i++ ) {
				out = out.concat( content[i] );
				if ( i < l - 1 ) {
					out.push( '|' );
				}
			}
			content = out;
		} else {
			content = href;
		}
		if ( tail ) {
			content.push( tail );
		}
		
		obj.attribs.push( new KV('data-mw-type', 'internal') );
		var out = [obj].concat( content, new EndTagTk( 'a' ) );
		//console.warn( JSON.stringify( out, null, 2 ) );
		return { tokens: out };
	}
};

WikiLinkHandler.prototype._simpleImageOptions = {
	// halign
	'left': 'halign',
	'right': 'halign',
	'center': 'halign',
	'none': 'halign',
	// valign
	'baseline': 'valign',
	'sub': 'valign',
	'super': 'valign',
	'top': 'valign',
	'text-top': 'valign',
	'middle': 'valign',
	'bottom': 'valign',
	'text-bottom': 'valign',
	// format
	'border': 'format',
	'frameless': 'format',
	'frame': 'format',
	'thumbnail': 'format',
	'thumb': 'format'
};

WikiLinkHandler.prototype._prefixImageOptions = {
	'link': 'link',
	'alt': 'alt',
	'page': 'page',
	'thumbnail': 'thumb',
	'thumb': 'thumb'
};

WikiLinkHandler.prototype.renderFile = function ( token, manager, cb, title ) {
	var env = manager.env;
	// distinguish media types
	// if image: parse options
	
	var content = env.lookupKV( token.attribs, 'content' ).v;

	// XXX: get /wiki from config!
	var a = new TagTk( 'a', [ new KV( 'href', '/wiki' + title.makeLink() ) ] );
	a.dataAttribs = token.dataAttribs;

	var MD5 = new jshashes.MD5(),
		hash = MD5.hex( title.key ),
		// XXX: Hackhack..
		path = 'http://example.com/images/' + 
			[ hash[0], hash.substr(0, 2) ].join('/') + '/' + title.key;
	
	

	// XXX: extract options
	var options = [],
		caption = null;
	for( var i = 0, l = content.length; i<l; i++ ) {
		var oContent = content[i],
			oText = manager.env.tokensToString( oContent, true );
		if ( oText.constructor === String ) {
			var oText = oText.trim();
			if ( this._simpleImageOptions[ oText ] ) {
				options.push( new KV( this._simpleImageOptions[ oText ], 
							oText ) );
				continue;
			} 
		} else {
			var bits = oText[0].split( '=', 2 );
			if ( bits.length > 1 && this._prefixImageOptions[ bits[0].strip ] ) {
				console.log('handle prefix ' + bits );
			} else {
				caption = oContent;
			}
		}
	}
	

	//var contentPos = token.dataAttribs.contentPos;
	//var optionSource = token.source.substr( contentPos[0], contentPos[1] - contentPos[0] );
	//console.log( 'optionSource: ' + optionSource );
	// XXX: The trouble with re-parsing is the need to re-expand templates.
	// Figure out how often non-image links contain image-like parameters!
	//var options = this.imageParser.processImageOptions( optionSource );
	//console.log( JSON.stringify( options, null, 2 ) );
	// XXX: check if the file exists, generate thumbnail, get size
	// XXX: render according to mode (inline, thumb, framed etc)
	var img = new SelfclosingTagTk( 'img', 
			[ 
				// FIXME!
				new KV( 'height', options.height || '220' ),
				new KV( 'width', options.width || '1941' ),
				new KV( 'src', path ),
				new KV( 'alt', options.alt || title.key )
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
