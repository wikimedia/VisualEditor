var TokenCollector = require( './ext.util.TokenCollector.js' ).TokenCollector;
// var Util = require( './mediawiki.Util.js' ).Util;

/**
 * Simple token transform version of the Cite extension.
 *
 * @class
 * @constructor
 */
function Cite ( manager, isInclude ) {
	this.manager = manager;
	this.refGroups = {};
	// Set up the collector for ref sections
	new TokenCollector(
			manager,
			this.handleRef.bind(this),
			true, // match the end-of-input if </ref> is missing
			this.rank,
			'tag',
			'ref'
			);
	// And register for references tags
	manager.addTransform( this.onReferences.bind(this), "Cite:onReferences",
			this.referencesRank, 'tag', 'references' );
}

Cite.prototype.rank = 2.15; // after QuoteTransformer, but before PostExpandParagraphHandler
Cite.prototype.referencesRank = 2.6; // after PostExpandParagraphHandler
//Cite.prototype.rank = 2.6;

/**
 * Handle ref section tokens collected by the TokenCollector.
 */
Cite.prototype.handleRef = function ( tokens ) {
	// remove the first ref tag
	var startTag = tokens.shift();
	if ( tokens[tokens.length - 1].name === 'ref' ) {
		tokens.pop();
	}

	var options = $.extend({
		name: null,
		group: null
	}, this.manager.env.KVtoHash(startTag.attribs));

	var group = this.getRefGroup(options.group);
	var ref = group.add(tokens, options);
	//console.warn( 'added tokens: ' + JSON.stringify( this.refGroups, null, 2 ));
	var linkback = ref.linkbacks[ref.linkbacks.length - 1];


	var bits = [];
	if (options.group) {
		bits.push(options.group);
	}
	//bits.push(Util.formatNum( ref.groupIndex + 1 ));
	bits.push(ref.groupIndex + 1);

	var res = [
		new TagTk('span', [
				new KV('id', linkback),
				new KV('class', 'reference'),
				// ignore element when serializing back to wikitext
				new KV('data-nosource', '')
			]
		),
		new TagTk( 'a', [
				new KV('data-type', 'hashlink'),
				new KV('href', '#' + ref.target)
				// XXX: Add round-trip info here?
			]
		),
		'[' + bits.join(' ')  + ']',
		new EndTagTk( 'a' ),
		new EndTagTk( 'span' )
	];
	//console.warn( 'ref res: ' + JSON.stringify( res, null, 2 ) );
	return { tokens: res };
};

/**
 * Handle references tag tokens.
 *
 * @method
 * @param {Object} TokenContext
 * @returns {Object} TokenContext
 */
Cite.prototype.onReferences = function ( token, manager ) {
	if ( token.constructor === EndTagTk ) {
		return {};
	}
	
	//console.warn( 'references refGroups:' + JSON.stringify( this.refGroups, null, 2 ) );

	var refGroups = this.refGroups;
	
	var arrow = '↑';
	var renderLine = function( ref ) {
		var out = [ new TagTk('li', [new KV('id', ref.target)] ) ];
		if (ref.linkbacks.length == 1) {
			out = out.concat([
					new TagTk( 'a', [
								new KV('href', '#' + ref.linkbacks[0])
							]
						),
					arrow,
					new EndTagTk( 'a' )
				],
				ref.tokens // The original content tokens
			);
		} else {
			out.push( arrow );
			$.each(ref.linkbacks, function(i, linkback) {
				out = out.concat([
						new TagTk( 'a', [
								new KV('data-type', 'hashlink'),
								new KV('href', '#' + ref.linkbacks[0])
							]
						),
						// XXX: make formatNum available!
						//{
						//	type: 'TEXT', 
						//	value: Util.formatNum( ref.groupIndex + '.' + i)
						//},
						ref.groupIndex + '.' + i,
						new EndTagTk( 'a' )
					],
					ref.tokens // The original content tokens
				);
			});
		}
		//console.warn( 'renderLine res: ' + JSON.stringify( out, null, 2 ));
		return out;
	};
	
	var res;

	var options = $.extend({
		name: null,
		group: null
	}, this.manager.env.KVtoHash(token.attribs));

	if (options.group in refGroups) {
		var group = refGroups[options.group];
		var listItems = $.map(group.refs, renderLine);
		res = [
			new TagTk( 'ol', [
						new KV('class', 'references'),
						new KV('data-object', 'references') // Object type
					]
				)
		].concat( listItems, [ new EndTagTk( 'ol' ) ] );
	} else {
		res = [ new SelfclosingTagTk( 'meta', [ new KV('fixme', 'add-rdfa-rt-info') ] ) ];
	}

	//console.warn( 'references res: ' + JSON.stringify( res, null, 2 ) );
	return { tokens: res };
};

Cite.prototype.getRefGroup = function(group) {
	var refGroups = this.refGroups;
	if (!(group in refGroups)) {
		var refs = [],
			byName = {};
		refGroups[group] = {
			refs: refs,
			byName: byName,
			add: function(tokens, options) {
				var ref;
				if (options.name && options.name in byName) {
					ref = byName[options.name];
				} else {
					var n = refs.length;
					var key = n + '';
					if (options.name) {
						key = options.name + '-' + key;
					}
					ref = {
						tokens: tokens,
						index: n,
						groupIndex: n, // @fixme
						name: options.name,
						group: options.group,
						key: key,
						target: 'cite_note-' + key,
						linkbacks: []
					};
					refs[n] = ref;
					if (options.name) {
						byName[options.name] = ref;
					}
				}
				ref.linkbacks.push(
						'cite_ref-' + ref.key + '-' + ref.linkbacks.length
						);
				return ref;
			}
		};
	}
	return refGroups[group];
};

if (typeof module == "object") {
	module.exports.Cite = Cite;
}
