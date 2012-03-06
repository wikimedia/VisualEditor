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
		href = token.attribs[0].v,
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
			content = token.attribs.slice(1, -1);
		//console.warn('content: ' + JSON.stringify( content, null, 2 ) );
		// XXX: handle trail
		if ( content.length ) {
			var out = [];
			for ( var i = 0, l = content.length; i < l ; i++ ) {
				out = out.concat( content[i].v );
				if ( i < l - 1 ) {
					out.push( '|' );
				}
			}
			content = out;
		} else {
			content = [ env.decodeURI( env.tokensToString( href ) ) ];
		}
		if ( tail ) {
			content.push( tail );
		}
		
		obj.attribs.push( new KV('data-mw-type', 'internal') );
		return { 
			tokens: [obj].concat( content, new EndTagTk( 'a' ) )
		};
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
	
	var content = token.attribs.slice(1, -1);

	// TODO: get /wiki from config!
	var a = new TagTk( 'a', [ new KV( 'href', '/wiki' + title.makeLink() ) ] );
	a.dataAttribs = token.dataAttribs;

	var MD5 = new jshashes.MD5(),
		hash = MD5.hex( title.key ),
		// TODO: Hackhack.. Move to proper test harness setup!
		path = 'http://example.com/images/' + 
			[ hash[0], hash.substr(0, 2) ].join('/') + '/' + title.key;
	
	

	// extract options
	var options = [],
		caption = null;
	for( var i = 0, l = content.length; i<l; i++ ) {
		var oContent = content[i],
			oText = manager.env.tokensToString( oContent, true );
		if ( oText.constructor === String ) {
			oText = oText.trim();
			if ( this._simpleImageOptions[ oText ] ) {
				options.push( new KV( this._simpleImageOptions[ oText ], 
							oText ) );
				continue;
			} 
		} else {
			var bits = oText[0].split( '=', 2 );
			if ( bits.length > 1 && this._prefixImageOptions[ bits[0].trim() ] ) {
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


function ExternalLinkHandler( manager, isInclude ) {
	this.manager = manager;
	this.manager.addTransform( this.onUrlLink.bind( this ), this.rank, 'tag', 'urllink' );
	this.manager.addTransform( this.onExtLink.bind( this ), 
			this.rank - 0.001, 'tag', 'extlink' );
	// create a new peg parser for image options..
	if ( !this.imageParser ) {
		// Actually the regular tokenizer, but we'll call it with the
		// img_options production only.
		ExternalLinkHandler.prototype.imageParser = new PegTokenizer();
	}
}

ExternalLinkHandler.prototype.rank = 1.15;
ExternalLinkHandler.prototype._imageExtensions = {
	'jpg': true,
	'png': true,
	'gif': true
};

ExternalLinkHandler.prototype._isImageLink = function ( href ) {
	var bits = href.split( '.' );
	return bits.length > 1 && 
		this._imageExtensions[ bits[bits.length - 1] ] &&
		href.match( /^https?:\/\// );
};

ExternalLinkHandler.prototype.onUrlLink = function ( token, manager, cb ) {
	var href = this.manager.env.sanitizeURI( 
			this.manager.env.lookupKV( token.attribs, 'href' ).v 
			);
	if ( this._isImageLink( href ) ) {
		return { token: new SelfclosingTagTk( 'img', 
				[ 
					new KV( 'alt', href.split('/').last() ),
					new KV( 'src', href )
				] 
			) 
		};
	} else {
		return { 
			tokens: [
				new TagTk( 'a', [ new KV( 'href', href ) ] ),
				href,
				new EndTagTk( 'a' )
			] 
		};
	}
};

// Bracketed external link
ExternalLinkHandler.prototype.onExtLink = function ( token, manager, cb ) {
	var href = this.manager.env.lookupKV( token.attribs, 'href' ).v,
		content=  this.manager.env.lookupKV( token.attribs, 'content' ).v;
	href = this.manager.env.sanitizeURI( href );
	console.warn('extlink href: ' + href );
	//console.warn( 'content: ' + JSON.stringify( content, null, 2 ) );
	// validate the href
	if ( this.imageParser.parseURL( href ) ) {
		if ( content.length === 1 && 
				content[0].constructor === String &&
				this.imageParser.parseURL( content[0] ) &&
				this._isImageLink( content[0] ) )
		{
			var src = content[0];
			content = [ new SelfclosingTagTk( 'img', 
					[ 
					new KV( 'alt', src.split('/').last() ),	
					new KV( 'src', src )
					] )
				];
		}

		return { 
			tokens:
				[
					
					new TagTk( 'a', [
								new KV('href', href),
								new KV('data-mw-type', 'external')
							] )
				].concat( content, [ new EndTagTk( 'a' )])
		};
	} else {
		return {
			tokens: ['[', href, ' ' ].concat( content, [']'] )
		};
	}
};


if (typeof module == "object") {
	module.exports.WikiLinkHandler = WikiLinkHandler;
	module.exports.ExternalLinkHandler = ExternalLinkHandler;
}
