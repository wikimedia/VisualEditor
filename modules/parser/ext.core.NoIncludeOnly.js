/**
 * Simple noinclude / onlyinclude implementation. Strips all tokens in
 * noinclude sections.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

var TokenCollector = require( './ext.util.TokenCollector.js' ).TokenCollector;

/**
 * OnlyInclude sadly forces synchronous template processing, as it needs to
 * hold onto all tokens in case an onlyinclude block is encountered later.
 * This can fortunately be worked around by caching the tokens after
 * onlyinclude processing (which is a good idea anyway).
 */
function OnlyInclude( manager, isInclude ) {
	this.manager = manager;
	if ( isInclude ) {
		this.accum = [];
		this.inOnlyInclude = false;
		this.foundOnlyInclude = false;
		// register for 'any' token, collect those
		this.manager.addTransform( this.onAnyInclude.bind( this ), "OnlyInclude:onAnyInclude", this.rank, 'any' );
	} else {
		// just convert onlyinclude tokens into meta tags with rt info
		this.manager.addTransform( this.onOnlyInclude.bind( this ), "OnlyInclude:onOnlyInclude", this.rank, 
				'tag', 'onlyinclude' );
	}
}

OnlyInclude.prototype.rank = 0.01; // Before any further processing

OnlyInclude.prototype.onOnlyInclude = function ( token, manager ) {
	var meta = new TagTk( 'meta' );
	meta.dataAttribs = { strippedTokens: [token] };
	return { token: meta };
};

OnlyInclude.prototype.onAnyInclude = function ( token, manager ) {
	//this.manager.env.dp( 'onAnyInclude', token, this );
	if ( token.constructor === EOFTk ) {
		this.inOnlyInclude = false;
		if ( this.accum.length && ! this.foundOnlyInclude ) {
			var res = this.accum;
			res.push( token );
			this.accum = [];
			//this.manager.setTokensRank( res, this.rank + 0.001 );
			return { tokens: res };
		} else {
			this.foundOnlyInclude = false;
			this.accum = [];
			return { token: token };
		}
	} else if ( ( token.constructor === TagTk ||
				token.constructor === EndTagTk ||
				token.constructor === SelfclosingTagTk ) &&
			token.name === 'onlyinclude' ) {
		var meta;
		if ( ! this.inOnlyInclude ) {
			this.foundOnlyInclude = true;
			this.inOnlyInclude = true;
			// wrap collected tokens into meta tag for round-tripping
			meta = new TagTk( 'meta' );
			this.accum.push( token );
			meta.dataAttribs = { strippedTokens: this.accum };
			this.accum = [];
			return meta;
		} else {
			this.inOnlyInclude = false;
			meta = new TagTk( 'meta' );
			meta.dataAttribs = { strippedTokens: [token] };
		}
		//meta.rank = this.rank;
		return { token: meta };
	} else {
		if ( this.inOnlyInclude ) {
			//token.rank = this.rank;
			return { token: token };
		} else {
			this.accum.push( token );
			return { };
		}
	}
};


function NoInclude( manager, isInclude ) {
	new TokenCollector( 
			manager,
			function ( tokens ) { 
				if ( isInclude ) {
					//manager.env.tp( 'noinclude stripping' );
					return {};
				} else {
					tokens.shift();
					if ( tokens.length &&
						tokens[tokens.length - 1].constructor !== EOFTk ) {
						tokens.pop();
					}
					return { tokens: tokens };
				}
			}, // just strip it all..
			true, // match the end-of-input if </noinclude> is missing
			0.02, // very early in stage 1, to avoid any further processing.
			'tag',
			'noinclude'
			);
}

// XXX: Preserve includeonly content in meta tag (data attribute) for
// round-tripping!
function IncludeOnly( manager, isInclude ) {
	new TokenCollector( 
			manager,
			function ( tokens ) { 
				if ( isInclude ) {
					tokens.shift();
					if ( tokens.length &&
						tokens[tokens.length - 1].constructor !== EOFTk ) {
							tokens.pop();
					}
					return { tokens: tokens };
				} else {
					manager.env.tp( 'includeonly stripping' );
					return {};
				}
			},
			true, // match the end-of-input if </noinclude> is missing
			0.03, // very early in stage 1, to avoid any further processing.
			'tag',
			'includeonly'
			);
}


if (typeof module == "object") {
	module.exports.NoInclude = NoInclude;
	module.exports.IncludeOnly = IncludeOnly;
	module.exports.OnlyInclude = OnlyInclude;
}
