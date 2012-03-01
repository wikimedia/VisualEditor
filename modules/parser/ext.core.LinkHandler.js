/**
 * Simple link handler. Registers after template expansions, as an
 * asynchronous transform.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * 
 * * Collect description/parameter tokens between 'a' tags
 * * Extract image options and add image html if target is media/image
 *   namespace
 * * 
 *
 *
 * TODO: keep round-trip information in meta tag or the like
 *
 *
 *
 * Pro/Contra of single token vs. tags and tokens
 * - Need to collect description tokens between a and /a
 * + noinclude etc handled automatically by having all tokens on content level
 */

var jshashes = require('jshashes');

function WikiLinkHandler( manager, isInclude ) {
	this.manager = manager;
	this.manager.addTransform( this.onWikiLink.bind( this ), this.rank, 'tag', 'wikilink' );
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
	// distinguish media types
	// if image: parse options
	// XXX: get /wiki from config!
	var a = new TagTk( 'a', [ new KV( 'href', '/wiki' + title.makeLink() ) ] );

	var MD5 = new jshashes.MD5,
		hash = MD5.hex( title.key ),
		path = 'http://example.com/images/' + 
			[ hash[0], hash.substr(0, 2) ].join('/') + '/' + title.key;
	
	
	var img = new SelfclosingTagTk( 'img', 
			[ 
				new KV( 'height', '220' ),
				new KV( 'width', '1941' ),
				new KV( 'src', path ),
				new KV( 'alt', title.key ),

			] );
	return { tokens: [ a, img, new EndTagTk( 'a' )] };
};

if (typeof module == "object") {
	module.exports.WikiLinkHandler = WikiLinkHandler;
}
