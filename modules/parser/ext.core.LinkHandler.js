/**
 * Simple link handler. Registers after template expansions, as an
 * asynchronous transform.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 *
 * TODO: keep round-trip information in meta tag or the like
 */

var jshashes = require('jshashes'),
	PegTokenizer = require('./mediawiki.tokenizer.peg.js').PegTokenizer,
	WikitextConstants = require('./mediawiki.wikitext.constants.js').WikitextConstants,
	Util = require('./mediawiki.Util.js').Util;

function WikiLinkHandler( manager, isInclude ) {
	this.manager = manager;
	this.manager.addTransform( this.onWikiLink.bind( this ), "WikiLinkHandler:onWikiLink", this.rank, 'tag', 'wikilink' );
	// create a new peg parser for image options..
	if ( !this.imageParser ) {
		// Actually the regular tokenizer, but we'll call it with the
		// img_options production only.
		WikiLinkHandler.prototype.imageParser = new PegTokenizer();
	}
}

WikiLinkHandler.prototype.rank = 1.15; // after AttributeExpander

WikiLinkHandler.prototype.onWikiLink = function ( token, frame, cb ) {
	var env = this.manager.env,
		href = env.tokensToString( 
					Util.lookup( token.attribs, 'href' ) ),
		title = env.makeTitleFromPrefixedText(env.normalizeTitle(href));

	if ( title.ns.isFile() ) {
		cb( this.renderFile( token, frame, cb, href, title ) );
	} else if ( title.ns.isCategory() ) {
		// Simply round-trip category links for now
		cb( { tokens: [
				new SelfclosingTagTk( 'meta',
					[new KV( 'typeof', 'mw:Placeholder' )],
					token.dataAttribs )
				]
		});
	} else {
		// Check if page exists
		//
		//console.warn( 'title: ' + JSON.stringify( title ) );
		var normalizedHref = title.makeLink(),
			obj = new TagTk( 'a',
					[
						new KV('rel', 'mw:WikiLink')
					], token.dataAttribs
				),
			content = token.attribs.slice(2);
		obj.addNormalizedAttribute( 'href', normalizedHref, env.wgScriptPath + href );
		//console.warn('content: ' + JSON.stringify( content, null, 2 ) );

		// XXX: handle trail
		if ( content.length > 0 ) {
			var out = [];
			for ( var i = 0, l = content.length; i < l ; i++ ) {
				out = out.concat( content[i].v );
				if ( i < l - 1 ) {
					out.push( '|' );
				}
			}
			content = out;
		} else {
			obj.dataAttribs.stx = 'simple';
			content = [ Util.decodeURI(href) ];
		}

		var tail = Util.lookupKV( token.attribs, 'tail' ).v;
		if ( tail ) {
			obj.dataAttribs.tail = tail;
			content.push( tail );
		}
		
		cb ( { 
			tokens: [obj].concat( content, [ new EndTagTk( 'a' ) ] )
		} );
	}
};

WikiLinkHandler.prototype.renderFile = function ( token, frame, cb, fileName, title ) {
	var env = this.manager.env;
	// distinguish media types
	// if image: parse options
	
	var content = token.attribs.slice(2);

	var MD5 = new jshashes.MD5(),
		hash = MD5.hex( title.key ),
		// TODO: Hackhack.. Move to proper test harness setup!
		path = [ this.manager.env.wgUploadPath, hash[0],
					hash.substr(0, 2), title.key ].join('/');
	
	

	// extract options
	var options = [],
		oHash = {},
		caption = [];
	for( var i = 0, l = content.length; i<l; i++ ) {
		var oContent = content[i],
			oText = this.manager.env.tokensToString( oContent.v, true );
		//console.log( JSON.stringify( oText, null, 2 ) );
		if ( oText.constructor === String ) {
			var origOText = oText;
			oText = oText.trim().toLowerCase();
			var imgOption = WikitextConstants.Image.SimpleOptions[oText];
			if (imgOption) {
				options.push( new KV(imgOption, origOText ) );
				oHash[imgOption] = oText;
				continue;
			} else {
				var maybeSize = oText.match(/^(\d*)(?:x(\d+))?px$/);
				//console.log( maybeSize );
				if ( maybeSize !== null ) {
					var x = maybeSize[1],
						y = maybeSize[2];
					if ( x !== undefined ) {
						options.push(new KV( 'width', x ) );
						oHash.width = x;
					}
					if ( y !== undefined ) {
						options.push(new KV( 'height', y ) );
						oHash.height = y;
					}
				} else {
					var bits = origOText.split( '=', 2 );
					var normalizedBit0 = bits[0].trim().toLowerCase();
					var key = WikitextConstants.Image.PrefixOptions[normalizedBit0];
					if ( bits[0] && key) {
						oHash[key] = bits[1];
						// Preserve white space
						// FIXME: But this doesn't work for the 'upright' key
						if (key === normalizedBit0) {
							key = bits[0];
						}
						options.push( new KV( key, bits[1] ) );
						//console.warn('handle prefix ' + bits );
					} else {
						// neither simple nor prefix option, add original
						// tokens to caption.
						caption = caption.concat( oContent.v );
					}
				}
			}
		} else {
			caption = caption.concat( oContent.v );
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
	
	if ( oHash.format && ( oHash.format === 'thumb' || oHash.format === 'thumbnail') ) {
		return this.renderThumb( token, this.manager, cb, title, fileName, path, caption, oHash, options );
	} else {
		// TODO: get /wiki from config!
		var a = new TagTk( 'a', [ 
					new KV( 'href', title.makeLink() ),
					new KV( 'rel', 'mw:Image' )
				] );
		a.dataAttribs = token.dataAttribs;

		var width, height;
		if ( ! oHash.height && ! oHash.width ) {
			width = '200px';
		} else {
			width = oHash.width;
			height = oHash.height;
		}

		var img = new SelfclosingTagTk( 'img', 
				[ 
					// FIXME!
					new KV( 'height', height || '' ),
					new KV( 'width', width || '' ),
					new KV( 'src', path ),
					new KV( 'alt', oHash.alt || title.key )
				] );

		return { tokens: [ a, img, new EndTagTk( 'a' )] };
	}
};

WikiLinkHandler.prototype.renderThumb = function ( token, manager, cb, title, fileName, path, caption, oHash, options ) {
	// TODO: get /wiki from config!
	var a = new TagTk( 'a', [ new KV( 'href', title.makeLink() ) ] );
	a.dataAttribs = token.dataAttribs;
	a.dataAttribs.optionHash = oHash;
	a.dataAttribs.optionList = options;
	// clear src string since we can serialize this
	a.dataAttribs.src = undefined;

	var width = 165;

	// Handle upright
	if ( 'aspect' in oHash ) {
		if ( oHash.aspect > 0 ) {
			width = width * oHash.aspect;
		} else {
			width *= 0.75;
		}
	}

	var figurestyle = "width: " + (width + 5) + "px;",
		figureclass = "thumb tright thumbinner";
	
	// set horizontal alignment
	if ( oHash.halign ) {
		if ( oHash.halign === 'left' ) {
			figurestyle += ' float: left;';
			figureclass = "thumb tleft thumbinner";
		} else if ( oHash.halign === 'center' ) {
			figureclass = "thumb center thumbinner";
		} else if ( oHash.halign === 'none' ) {
			figureclass = "thumb thumbinner";
		} else {
			figurestyle += ' float: right;';
		}
	} else {
		figurestyle += ' float: right;';
	}

	// XXX: set vertical alignment (valign)
	// XXX: support other formats (border, frameless, frame)
	// XXX: support prefixes

	var thumb = 
	[
		new TagTk( 
				'figure', 
				[
					new KV('typeof', 'mw:Thumb'),
					new KV('class', figureclass),
					new KV('style', figurestyle)
				] 
			),
		new TagTk( 
				'a', 
				[
					new KV('href', title.makeLink()),
					new KV('class', 'image')
				]
			),
		new SelfclosingTagTk( 
				'img',
				[
					new KV('src', path),
					new KV('width', width + 'px'),
					//new KV('height', '160px'),
					new KV('class', 'thumbimage'),
					new KV('alt', oHash.alt || title.key ),
					// Add resource as CURIE- needs global default prefix
					// definition.
					new KV('resource', '[:' + fileName + ']')
				]
			),
		new EndTagTk( 'a' ),
		new SelfclosingTagTk ( 
				'a',
				[
					new KV('href', title.makeLink()),
					new KV('class', 'internal sprite details magnify'),
					new KV('title', 'View photo details')
				]
			),
		new TagTk( 'figcaption', 
				[ 
					new KV('class', 'thumbcaption'),
					new KV('property', 'mw:thumbcaption')
				] )
	].concat( 
			caption, 
			[
				new EndTagTk( 'figcaption' ),
				new EndTagTk( 'figure' )
			]
		);
	
	// set round-trip information on the wrapping figure token
	thumb[0].dataAttribs = token.dataAttribs;

/*		
 * Wikia DOM:
<figure class="thumb tright thumbinner" style="width:270px;">
    <a href="Delorean.jpg" class="image" data-image-name="DeLorean.jpg" id="DeLorean-jpg">
        <img alt="" src="Delorean.jpg" width="268" height="123" class="thumbimage">
    </a>
    <a href="File:DeLorean.jpg" class="internal sprite details magnify" title="View photo details"></a>
    <figcaption class="thumbcaption">
        A DeLorean DMC-12 from the front with the gull-wing doors open
        <table><tr><td>test</td></tr></table>
        Continuation of the caption
    </figcaption>
    <div class="picture-attribution">
        <img src="Christian-Avatar.png" width="16" height="16" class="avatar" alt="Christian">Added by <a href="User:Christian">Christian</a>
    </div>
</figure>
*/
	//console.warn( 'thumbtokens: ' + JSON.stringify( thumb, null, 2 ) );
	return { tokens: thumb };
};


function ExternalLinkHandler( manager, isInclude ) {
	this.manager = manager;
	this.manager.addTransform( this.onUrlLink.bind( this ), "ExternalLinkHandler:onUrlLink", this.rank, 'tag', 'urllink' );
	this.manager.addTransform( this.onExtLink.bind( this ), "ExternalLinkHandler:onExtLink",  
			this.rank - 0.001, 'tag', 'extlink' );
	this.manager.addTransform( this.onEnd.bind( this ), "ExternalLinkHandler:onEnd",  
			this.rank, 'end' );
	// create a new peg parser for image options..
	if ( !this.imageParser ) {
		// Actually the regular tokenizer, but we'll call it with the
		// img_options production only.
		ExternalLinkHandler.prototype.imageParser = new PegTokenizer();
	}
	this._reset();
}

ExternalLinkHandler.prototype._reset = function () {
	this.linkCount = 1;
};

ExternalLinkHandler.prototype.rank = 1.15;
ExternalLinkHandler.prototype._imageExtensions = {
	'jpg': true,
	'png': true,
	'gif': true,
	'svg': true
};

ExternalLinkHandler.prototype._isImageLink = function ( href ) {
	var bits = href.split( '.' );
	return bits.length > 1 &&
		this._imageExtensions[ bits[bits.length - 1] ] &&
		href.match( /^https?:\/\// );
};

ExternalLinkHandler.prototype.onUrlLink = function ( token, frame, cb ) {
	var env = this.manager.env,
		href = Util.sanitizeURI( 
				env.tokensToString( Util.lookupKV( token.attribs, 'href' ).v ));
	if ( this._isImageLink( href ) ) {
		cb( { tokens: [ new SelfclosingTagTk( 'img', 
					[ 
					new KV( 'src', href ),
					new KV( 'alt', href.split('/').last() ),
					new KV('rel', 'mw:externalImage')
					],
					{ stx: 'urllink' }
					) 
				]
		} );
	} else {
		cb( { 
			tokens: [
				new TagTk( 'a', 
					[ 
						new KV( 'href', href ),
						new KV('rel', 'mw:UrlLink')
					] ),
				href,
				new EndTagTk( 'a' )
			] 
		} );
	}
};


// Bracketed external link
ExternalLinkHandler.prototype.onExtLink = function ( token, manager, cb ) {
	var env = this.manager.env,
		href = Util.sanitizeURI(env.tokensToString( Util.lookupKV( token.attribs, 'href' ).v )),
		content= Util.lookupKV( token.attribs, 'content' ).v,
		rdfaType = 'mw:ExtLink';
	//console.warn('extlink href: ' + href );
	//console.warn( 'content: ' + JSON.stringify( content, null, 2 ) );
	// validate the href
	if ( this.imageParser.tokenizeURL( href ) ) {
		if ( ! content.length ) {
			content = ['[' + this.linkCount + ']'];
			this.linkCount++;
			rdfaType = 'mw:NumberedExtLink';
		}
		if ( content.length === 1 && 
				content[0].constructor === String &&
				this.imageParser.tokenizeURL( content[0] ) &&
				this._isImageLink( content[0] ) )
		{
			var src = content[0];
			content = [ new SelfclosingTagTk( 'img', 
					[ 
					new KV( 'src', src ),
					new KV( 'alt', src.split('/').last() )
					],
					{ type: 'extlink' })
				];
		}

		cb( { 
			tokens:
				[
					
					new TagTk ( 'a', 
							[ 
								new KV('href', href),
								new KV('rel', rdfaType)
							], 
							token.dataAttribs
					)
				].concat( content, [ new EndTagTk( 'a' )])
		} );
	} else {
		var tokens = ['[', href ];
		if ( content.length ) {
			tokens = tokens.concat( [' '], content );
		}
		tokens.push(']');

		cb( {
			tokens: tokens
		} );
	}
};

ExternalLinkHandler.prototype.onEnd = function ( token, manager, cb ) {
	this._reset();
	cb( { tokens: [ token ] } );
};


if (typeof module == "object") {
	module.exports.WikiLinkHandler = WikiLinkHandler;
	module.exports.ExternalLinkHandler = ExternalLinkHandler;
}
