/**
 * Simple noinclude / onlyinclude implementation. Strips all tokens in
 * noinclude sections.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

var TokenCollector = require( './ext.util.TokenCollector.js' ).TokenCollector;

function NoInclude( manager ) {
	new TokenCollector( 
			manager,
			function ( tokens ) { 
				manager.env.dp( 'noinclude stripping', tokens );
				return {};
			}, // just strip it all..
			true, // match the end-of-input if </noinclude> is missing
			0.01, // very early in stage 1, to avoid any further processing.
			'tag',
			'noinclude'
			);
}

function OnlyInclude( manager ) {
	new TokenCollector( 
			manager,
			function ( ) { return {} }, // just strip it all..
			true, // match the end-of-input if </noinclude> is missing
			0.01, // very early in stage 1, to avoid any further processing.
			'tag',
			'onlyinclude'
			);
}


if (typeof module == "object") {
	module.exports.NoInclude = NoInclude;
	module.exports.OnlyInclude = OnlyInclude;
}
