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

function WikiLinkHandler( manager, isInclude ) {
	this.manager = manager;
	this.manager.addTransform( this.onWikiLink.bind( this ), this.rank, 'tag', 'wikilink' );
}

WikiLinkHandler.prototype.rank = 1.15; // after AttributeExpander

WikiLinkHandler.prototype.onWikiLink = function ( token, manager, cb ) {
	// Split off and normalize namespace
	// Compare with image/media namespaces
	//	handle image
	//	handle 
	// Check if page exists
	// 
	var obj = new TagTk( 'a', [ this.manager.env.lookupKV( token.attribs, 'href' ) ] );
    obj.attribs.push( new KV('data-mw-type', 'internal') );
	var out = [obj].concat( this.manager.env.lookupKV( token.attribs, 'content' ).v, 
							new EndTagTk( 'a' ) );
	//console.warn( JSON.stringify( out, null, 2 ) );
	return { tokens: out };
};



if (typeof module == "object") {
	module.exports.WikiLinkHandler = WikiLinkHandler;
}
