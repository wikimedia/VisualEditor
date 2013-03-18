/*!
 * VisualEditor DataModel Fragment class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel surface fragment.
 *
 * @class
 * @constructor
 * @param {ve.dm.Surface} surface Target surface
 * @param {ve.Range} [range] Range within target document, current selection used by default
 * @param {boolean} [noAutoSelect] Update the surface's selection when making changes
 */
ve.dm.SurfaceFragment = function VeDmSurfaceFragment( surface, range, noAutoSelect ) {
	// Short-circuit for missing-surface null fragment
	if ( !surface ) {
		return this;
	}

	// Properties
	this.range = range && range instanceof ve.Range ? range : surface.getSelection();
	// Short-circuit for invalid range null fragment
	if ( !this.range ) {
		return this;
	}
	this.surface = surface;
	this.document = surface.getDocument();
	this.noAutoSelect = !!noAutoSelect;

	// Events
	surface.on( 'transact', ve.bind( this.onTransact, this ) );

	// Initialization
	var length = this.document.getLength();
	this.range = new ve.Range(
		// Clamp range to valid document offsets
		Math.min( Math.max( this.range.from, 0 ), length ),
		Math.min( Math.max( this.range.to, 0 ), length )
	);
};

/* Static Properties */

/**
 * @static
 * @property
 * @inheritable
 */
ve.dm.SurfaceFragment.static = {};

/**
 * Pattern that matches anything that's not considered part of a word.
 *
 * This is a very loose definition, it includes some punctuation that can occur around or inside of
 * a word. This may need to be added to for some locales and perhaps made to be extendable for
 * better internationalization support.
 *
 * Allowed characters:
 *     * Unicode 'letters' and 'numbers' categories
 *     * Underscores and dashes: _, -
 *     * Brackets and parenthesis: (), []
 *     * Apostrophes and double quotes: ', "
 *
 * This pattern is tested against one character at a time.
 */
ve.dm.SurfaceFragment.static.wordBoundaryPattern = new RegExp(
	'[^' +
		// Letters
		'A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC' +
		// Numbers
		'0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19' +
		// other word boundary exceptions
		'\'"\\-\\(\\)\\[\\]' +
	']+'
);

/* Methods */

/**
 * Handle transactions being processed on the document.
 *
 * This keeps the range of the fragment valid, even while other transactions are being processed
 *
 * @method
 * @param {ve.dm.Transaction[]} txs Transactions that have just been processed
 */
ve.dm.SurfaceFragment.prototype.onTransact = function ( txs ) {
	for ( var i = 0; i < txs.length; i++ ) {
		this.range = txs[i].translateRange( this.range );
	}
};

/**
 * Get the surface the fragment is a part of.
 *
 * @method
 * @returns {ve.dm.Surface} Surface of fragment
 */
ve.dm.SurfaceFragment.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Get the document of the surface the fragment is a part of.
 *
 * @method
 * @returns {ve.dm.Document} Document of surface of fragment
 */
ve.dm.SurfaceFragment.prototype.getDocument = function () {
	return this.document;
};

/**
 * Get the range of the fragment within the surface.
 *
 * @method
 * @returns {ve.Range} Surface range
 */
ve.dm.SurfaceFragment.prototype.getRange = function () {
	return this.range.clone();
};

/**
 * Check if the fragment is null.
 *
 * @method
 * @returns {boolean} Fragment is a null fragment
 */
ve.dm.SurfaceFragment.prototype.isNull = function () {
	return this.surface === undefined;
};

/**
 * Get a new fragment with an adjusted position
 *
 * @method
 * @param {number} [start] Adjustment for start position
 * @param {number} [end] Adjustment for end position
 * @returns {ve.dm.SurfaceFragment} Adjusted fragment
 */
ve.dm.SurfaceFragment.prototype.adjustRange = function ( start, end ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	return new ve.dm.SurfaceFragment(
		this.surface,
		new ve.Range( this.range.start + ( start || 0 ), this.range.end + ( end || 0 ) ),
		this.noAutoSelect
	);
};

/**
 * Get a new fragment with a truncated length.
 *
 * @method
 * @param {number} limit Maximum length of range (negative for left-side truncation)
 * @returns {ve.dm.SurfaceFragment} Truncated fragment
 */
ve.dm.SurfaceFragment.prototype.truncateRange = function ( limit ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	return new ve.dm.SurfaceFragment(
		this.surface,
		this.range.truncate( limit ),
		this.noAutoSelect
	);
};

/**
 * Get a new fragment with a zero-length selection at the start offset.
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} Collapsed fragment
 */
ve.dm.SurfaceFragment.prototype.collapseRange = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	return new ve.dm.SurfaceFragment(
		this.surface, new ve.Range( this.range.start ), this.noAutoSelect
	);
};

/**
 * Get a new fragment with a range that no longer includes leading and trailing whitespace.
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} Trimmed fragment
 */
ve.dm.SurfaceFragment.prototype.trimRange = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// If range is only whitespace
	if ( this.document.getText( this.range ).trim().length === 0 ) {
		// Collapse range
		return new ve.dm.SurfaceFragment(
			this.surface, new ve.Range( this.range.start ), this.noAutoSelect
		);
	}
	return new ve.dm.SurfaceFragment(
		this.surface, this.document.trimOuterSpaceFromRange( this.range ), this.noAutoSelect
	);
};

/**
 * Get a new fragment that covers an expanded range of the document.
 *
 * @method
 * @param {string} [scope='parent'] Method of expansion:
 *  - `word`: Expands to cover the nearest word by looking for word breaks (see UnicodeJS.wordbreak)
 *  - `annotation`: Expands to cover a given annotation (argument) within the current range
 *  - `root`: Expands to cover the entire document
 *  - `siblings`: Expands to cover all sibling nodes
 *  - `closest`: Expands to cover the closest common ancestor node of a give type (argument)
 *  - `parent`: Expands to cover the closest common parent node
 * @param {Mixed} [type] Parameter to use with scope method if needed
 * @returns {ve.dm.SurfaceFragment} Expanded fragment
 */
ve.dm.SurfaceFragment.prototype.expandRange = function ( scope, type ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var range, node, nodes, parent;
	switch ( scope || 'parent' ) {
		case 'word':
			if( this.range.getLength() > 0 ) {
				range = ve.Range.newCoveringRange( [
					this.document.getNearestWordRange( this.range.start ),
					this.document.getNearestWordRange( this.range.end )
				] );
				if( this.range.isBackwards() ) {
					range = range.flip();
				}
			} else {
				// optimisation for zero-length ranges
				range = this.document.getNearestWordRange( this.range.start );
			}
			break;
		case 'annotation':
			range = this.document.getAnnotatedRangeFromSelection( this.range, type );
			// Adjust selection if it does not contain the annotated range
			if ( this.range.start > range.start || this.range.end < range.end ) {
				// Maintain range direction
				if ( this.range.from > this.range.to ) {
					range = range.flip();
				}
			} else {
				// Otherwise just keep the range as is
				range = this.range.clone();
			}
			break;
		case 'root':
			range = new ve.Range( 0, this.document.getData().length );
			break;
		case 'siblings':
			// Grow range to cover all siblings
			nodes = this.document.selectNodes( this.range, 'siblings' );
			if ( nodes.length === 1 ) {
				range = nodes[0].node.getOuterRange();
			} else {
				range = new ve.Range(
					nodes[0].node.getOuterRange().start,
					nodes[nodes.length - 1].node.getOuterRange().end
				);
			}
			break;
		case 'closest':
			// Grow range to cover closest common ancestor node of given type
			node = this.document.selectNodes( this.range, 'siblings' )[0].node;
			parent = node.getParent();
			while ( parent && parent.getType() !== type ) {
				node = parent;
				parent = parent.getParent();
			}
			if ( !parent ) {
				return new ve.dm.SurfaceFragment( null );
			}
			range = parent.getOuterRange();
			break;
		case 'parent':
			// Grow range to cover the closest common parent node
			node = this.document.selectNodes( this.range, 'siblings' )[0].node;
			parent = node.getParent();
			if ( !parent ) {
				return new ve.dm.SurfaceFragment( null );
			}
			range = parent.getOuterRange();
			break;
		default:
			throw new Error( 'Invalid scope argument: ' + scope );
	}
	return new ve.dm.SurfaceFragment( this.surface, range, this.noAutoSelect );
};

/**
 * Check if the surface's selection will be updated automatically when changes are made.
 *
 * @method
 * @returns {boolean} Will automatically update surface selection
 */
ve.dm.SurfaceFragment.prototype.willAutoSelect = function () {
	return !this.noAutoSelect;
};

/**
 * Get data for the fragment.
 *
 * @method
 * @param {boolean} [deep] Get a deep copy of the data
 * @returns {Array} Fragment data
 */
ve.dm.SurfaceFragment.prototype.getData = function ( deep ) {
	// Handle null fragment
	if ( !this.surface ) {
		return [];
	}
	return this.document.getData( this.range, deep );
};

/**
 * Get plain text for the fragment.
 *
 * @method
 * @returns {Array} Fragment text
 */
ve.dm.SurfaceFragment.prototype.getText = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return '';
	}
	var i, length,
		text = '',
		data = this.document.getData( this.range );
	for ( i = 0, length = data.length; i < length; i++ ) {
		if ( data[i].type === undefined ) {
			// Annotated characters have a string at index 0, plain characters are 1-char strings
			text += typeof data[i] === 'string' ? data[i] : data[i][0];
		}
	}
	return text;
};

/**
 * Get annotations in fragment.
 *
 * By default, this will only get annotations that completely cover the fragment. Use the {all}
 * argument to get all annotations that occur within the fragment.
 *
 * @method
 * @param {boolean} [all] Get annotations cover some of the fragment
 * @returns {ve.AnnotationSet} All annotation objects range is covered by
 */
ve.dm.SurfaceFragment.prototype.getAnnotations = function ( all ) {
	// Handle null fragment
	if ( !this.surface ) {
		return new ve.AnnotationSet();
	}
	if ( this.range.getLength() ) {
		return this.document.getAnnotationsFromRange( this.range, all );
	} else {
		return this.surface.getInsertionAnnotations();
	}
};

/**
 * Get all leaf nodes covered by the fragment.
 *
 * @see ve.Document#selectNodes Used to get the return value
 *
 * @method
 * @returns {Array} List of nodes and related information
 */
ve.dm.SurfaceFragment.prototype.getLeafNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return [];
	}
	return this.document.selectNodes( this.range, 'leaves' );
};

/**
 * Get nodes covered by the fragment.
 *
 * Does not descend into nodes that are entirely covered by the range. The result is
 * similar to that of {ve.dm.SurfaceFragment.prototype.getLeafNodes} except that if a node is
 * entirely covered, its children aren't returned separately.
 *
 * @see ve.Document#selectNodes for more information about the return value
 *
 * @method
 * @returns {Array} List of nodes and related information
 */
ve.dm.SurfaceFragment.prototype.getCoveredNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return [];
	}
	return this.document.selectNodes( this.range, 'coveredNodes' );
};

/**
 * Get nodes covered by the fragment.
 *
 * Includes adjacent siblings covered by the range, descending if the range is in a single node.
 *
 * @see ve.Document#selectNodes for more information about the return value.
 *
 * @method
 * @returns {Array} List of nodes and related information
 */
ve.dm.SurfaceFragment.prototype.getSiblingNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return [];
	}
	return this.document.selectNodes( this.range, 'siblings' );
};

/**
 * Change whether to automatically update the surface selection when making changes.
 *
 * @method
 * @param {boolean} [value=true] Automatically update surface selection
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.setAutoSelect = function ( value ) {
	this.noAutoSelect = !value;
	return this;
};

/**
 * Apply the fragment's range to the surface as a selection.
 *
 * @method
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.select = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	this.surface.change( null, this.range );
	return this;
};

/**
 * Apply an annotation to content in the fragment.
 *
 * To avoid problems identified in bug 33108, use the {ve.dm.SurfaceFragment.trimRange} method.
 *
 * TODO: Optionally take an annotation set instead of name and data arguments and set/clear multiple
 * annotations in a single transaction.
 *
 * @method
 * @param {string} method Mode of annotation, either 'set' or 'clear'
 * @param {string|ve.dm.Annotation} name Annotation name, for example: 'textStyle/bold' or
 * Annotation object
 * @param {Object} [data] Additional annotation data (not used if annotation object is given)
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.annotateContent = function ( method, name, data ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// Extract annotation information
	if ( name instanceof ve.dm.Annotation ) {
		data = name.data;
		name = name.name;
	}
	var tx,
		annotation = ve.dm.annotationFactory.create( name, data );
	if ( this.range.getLength() ) {
		// Apply to selection
		tx = ve.dm.Transaction.newFromAnnotation( this.document, this.range, method, annotation );
		this.surface.change( tx, !this.noAutoSelect && tx.translateRange( this.range ) );
	} else {
		// Apply annotation to stack
		if ( method === 'set' ) {
			this.surface.addInsertionAnnotation( annotation );
		} else if ( method === 'clear' ) {
			this.surface.removeInsertionAnnotation( annotation );
		}
	}
	return this;
};

/**
 * Remove content in the fragment and insert content before it.
 *
 * This will move the fragment's range to the end of the insertion and make it zero-length.
 *
 * @method
 * @param {string|Array} content Content to insert, can be either a string or array of data
 * @param {boolean} annotate Content should be automatically annotated to match surrounding content
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.insertContent = function ( content, annotate ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var tx, annotations;
	if ( this.range.getLength() ) {
		this.removeContent();
	}
	// Auto-convert content to array of plain text characters
	if ( typeof content === 'string' ) {
		content = content.split( '' );
	}
	if ( content.length ) {
		if ( annotate ) {
			annotations = this.document.getAnnotationsFromOffset( this.range.start - 1 );
			if ( annotations.getLength() > 0 ) {
				ve.dm.Document.addAnnotationsToData( content, annotations );
			}
		}
		tx = ve.dm.Transaction.newFromInsertion( this.document, this.range.start, content );
		this.surface.change( tx, !this.noAutoSelect && tx.translateRange( this.range ) );
	}
	return this;
};

/**
 * Remove content in the fragment.
 *
 * @method
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.removeContent = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var tx;
	if ( this.range.getLength() ) {
		tx = ve.dm.Transaction.newFromRemoval( this.document, this.range );
		// this.range will be translated via the onTransact event handler
		this.surface.change( tx, !this.noAutoSelect && tx.translateRange( this.range ) );
		// Check if the range didn't get collapsed automatically - this will occur when removing
		// content across un-mergable nodes because the delete only strips out content leaving
		// structure at the beginning and end of the range in place
		if ( this.range.getLength() ) {
			// Collapse the range manually
			this.range = new ve.Range( this.range.start );
			if ( !this.noAutoSelect ) {
				// Update the surface selection
				this.surface.change( null, this.range );
			}
		}
	}
	return this;
};

/**
 * Convert each content branch in the fragment from one type to another.
 *
 * @method
 * @param {string} type Element type to convert to
 * @param {Object} [attr] Initial attributes for new element
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.convertNodes = function ( type, attr ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var tx =
		ve.dm.Transaction.newFromContentBranchConversion( this.document, this.range, type, attr );
	this.surface.change( tx, !this.noAutoSelect && tx.translateRange( this.range ) );
	return this;
};

/**
 * Wrap each node in the fragment with one or more elements.
 *
 * A wrapper object is a linear model element; a plain object containing a type property and an
 * optional attributes property.
 *
 * Example:
 *     // fragment is a selection of: <p>a</p><p>b</p>
 *     fragment.wrapNodes(
 *         [{ 'type': 'list', 'attributes': { 'style': 'bullet' } }, { 'type': 'listItem' }]
 *     )
 *     // fragment is now a selection of: <ul><li><p>a</p></li></ul><ul><li><p>b</p></li></ul>
 *
 * @method
 * @param {Object|Object[]} wrapper Wrapper object, or array of wrapper objects (see above)
 * @param {string} wrapper.type Node type of wrapper
 * @param {Object} [wrapper.attributes] Attributes of wrapper
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.wrapNodes = function ( wrapper ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	if ( !ve.isArray( wrapper ) ) {
		wrapper = [wrapper];
	}
	var tx = ve.dm.Transaction.newFromWrap( this.document, this.range, [], [], [], wrapper ),
		newRange = new ve.Range( this.range.start, this.range.end + tx.getLengthDifference() );
	this.surface.change( tx, !this.noAutoSelect && newRange );
	this.range = newRange;
	return this;
};

/**
 * Unwrap nodes in the fragment out of one or more elements.
 *
 * Example:
 *     // fragment is a selection of: <ul>「<li><p>a</p></li><li><p>b</p></li>」</ul>
 *     fragment.unwrapNodes( 1, 1 )
 *     // fragment is now a selection of: 「<p>a</p><p>b</p>」
 *
 * @method
 * @param {number} outerDepth Number of nodes outside the selection to unwrap
 * @param {number} innerDepth Number of nodes inside the selection to unwrap
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.unwrapNodes = function ( outerDepth, innerDepth ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var i, tx, newRange, innerUnwrapper = [], outerUnwrapper = [];

	if ( this.range.end - this.range.start < innerDepth * 2 ) {
		throw new Error( 'cannot unwrap by greater depth than maximum theoretical depth of selection' );
	}

	for ( i = 0; i < innerDepth; i++ ) {
		innerUnwrapper.push( this.surface.getDocument().data[this.range.start + i] );
	}
	for ( i = outerDepth; i > 0; i-- ) {
		outerUnwrapper.push( this.surface.getDocument().data[this.range.start - i] );
	}

	tx = ve.dm.Transaction.newFromWrap( this.document, this.range, outerUnwrapper, [], innerUnwrapper, [] );
	newRange = new ve.Range( this.range.start - outerDepth, this.range.end + outerDepth + tx.getLengthDifference() );
	this.surface.change( tx, !this.noAutoSelect && newRange );

	this.range = newRange;

	return this;
};

/**
 * Change the wrapping of each node in the fragment from one type to another.
 *
 * A wrapper object is a linear model element; a plain object containing a type property and an
 * optional attributes property.
 *
 * Example:
 *     // fragment is a selection of: <dl><dt><p>a</p></dt></dl><dl><dt><p>b</p></dt></dl>
 *     fragment.rewrapNodes(
 *         2,
 *         [{ 'type': 'list', 'attributes': { 'style': 'bullet' } }, { 'type': 'listItem' }]
 *     )
 *     // fragment is now a selection of: <ul><li><p>a</p></li></ul><ul><li><p>b</p></li></ul>
 *
 * @method
 * @param {number} depth Number of nodes to unwrap
 * @param {Object|Object[]} wrapper Wrapper object, or array of wrapper objects (see above)
 * @param {string} wrapper.type Node type of wrapper
 * @param {Object} [wrapper.attributes] Attributes of wrapper
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.rewrapNodes = function ( depth, wrapper ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var i, tx, newRange, unwrapper = [];

	if ( !ve.isArray( wrapper ) ) {
		wrapper = [wrapper];
	}

	if ( this.range.end - this.range.start < depth * 2 ) {
		throw new Error( 'cannot unwrap by greater depth than maximum theoretical depth of selection' );
	}

	for ( i = 0; i < depth; i++ ) {
		unwrapper.push( this.surface.getDocument().data[this.range.start + i] );
	}

	tx = ve.dm.Transaction.newFromWrap( this.document, this.range, [], [], unwrapper, wrapper );
	newRange = new ve.Range( this.range.start, this.range.end + tx.getLengthDifference() );
	this.surface.change( tx, !this.noAutoSelect && newRange );

	this.range = newRange;

	return this;
};

/**
 * Wrap nodes in the fragment with one or more elements.
 *
 * A wrapper object is a linear model element; a plain object containing a type property and an
 * optional attributes property.
 *
 * Example:
 *     // fragment is a selection of: <p>a</p><p>b</p>
 *     fragment.wrapAllNodes(
 *         [{ 'type': 'list', 'attributes': { 'style': 'bullet' } }, { 'type': 'listItem' }]
 *     )
 *     // fragment is now a selection of: <ul><li><p>a</p><p>b</p></li></ul>
 *
 * @method
 * @param {Object|Object[]} wrapper Wrapper object, or array of wrapper objects (see above)
 * @param {string} wrapper.type Node type of wrapper
 * @param {Object} [wrapper.attributes] Attributes of wrapper
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.wrapAllNodes = function ( wrapper ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}

	var tx, newRange;

	if ( !ve.isArray( wrapper ) ) {
		wrapper = [wrapper];
	}

	tx = ve.dm.Transaction.newFromWrap( this.document, this.range, [], wrapper, [], [] );
	newRange = new ve.Range( this.range.start, this.range.end + tx.getLengthDifference() );
	this.surface.change( tx, !this.noAutoSelect && newRange );

	this.range = newRange;

	return this;
};

/**
 * Change the wrapping of nodes in the fragment from one type to another.
 *
 * A wrapper object is a linear model element; a plain object containing a type property and an
 * optional attributes property.
 *
 * Example:
 *     // fragment is a selection of: <h1><p>a</p><p>b</p></h1>
 *     fragment.rewrapAllNodes( 1, { 'type': 'heading', 'attributes' : { 'level' : 2 } } );
 *     // fragment is now a selection of: <h2><p>a</p><p>b</p></h2>
 *
 * @method
 * @param {number} depth Number of nodes to unwrap
 * @param {Object|Object[]} wrapper Wrapper object, or array of wrapper objects (see above)
 * @param {string} wrapper.type Node type of wrapper
 * @param {Object} [wrapper.attributes] Attributes of wrapper
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.rewrapAllNodes = function ( depth, wrapper ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var i, tx, newRange, unwrapper = [],
		innerRange = new ve.Range( this.range.start + depth, this.range.end - depth );

	if ( !ve.isArray( wrapper ) ) {
		wrapper = [wrapper];
	}

	if ( this.range.end - this.range.start < depth * 2 ) {
		throw new Error( 'cannot unwrap by greater depth than maximum theoretical depth of selection' );
	}

	for ( i = 0; i < depth; i++ ) {
		unwrapper.push( this.surface.getDocument().data[this.range.start + i] );
	}

	tx = ve.dm.Transaction.newFromWrap( this.document, innerRange, unwrapper, wrapper, [], [] );
	newRange = new ve.Range( this.range.start, this.range.end + tx.getLengthDifference() );
	this.surface.change( tx, !this.noAutoSelect && newRange );

	this.range = newRange;

	return this;
};

/**
 * Isolates the nodes in a fragment then unwraps them.
 *
 * The node selection is expanded to siblings. These are isolated such that they are the
 * sole children of the nearest parent element which can 'type' can exist in.
 *
 * The new isolated selection is then safely unwrapped.
 *
 * @method
 * @param {string} type Node type to isolate for
 * @chainable
 */
ve.dm.SurfaceFragment.prototype.isolateAndUnwrap = function ( isolateForType ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var nodes, startSplitNode, endSplitNode, tx,
		startOffset, endOffset,
		outerDepth = 0,
		factory = ve.dm.nodeFactory,
		allowedParents = factory.getSuggestedParentNodeTypes( isolateForType ),
		startSplitRequired = false,
		endSplitRequired = false,
		startSplitNodes = [],
		endSplitNodes = [],
		fragment = this,
		newRange = new ve.Range( this.range.start, this.range.end );

	function createSplits( splitNodes, insertBefore ) {
		var i, length,
			startOffsetChange = 0, endOffsetChange = 0, data = [];
		for ( i = 0, length = splitNodes.length; i < length; i++ ) {
			data.unshift( { 'type': '/' + splitNodes[i].type } );
			data.push( splitNodes[i].getClonedElement() );

			if ( insertBefore ) {
				startOffsetChange += 2;
				endOffsetChange += 2;
			}
		}

		tx = ve.dm.Transaction.newFromInsertion( fragment.getDocument(), insertBefore ? startOffset : endOffset, data );
		newRange = new ve.Range( newRange.start, newRange.end + tx.getLengthDifference() );
		fragment.surface.change( tx, !fragment.noAutoSelect && newRange );

		startOffset += startOffsetChange;
		endOffset += endOffsetChange;
	}

	nodes = this.getDocument().selectNodes( this.range, 'siblings' );

	// Find start split point, if required
	startSplitNode = nodes[0].node;
	startOffset = startSplitNode.getOuterRange().start;
	while( allowedParents !== null && ve.indexOf( startSplitNode.getParent().type, allowedParents ) === -1 ) {
		if ( startSplitNode.getParent().indexOf( startSplitNode ) > 0 ) {
			startSplitRequired = true;
		}
		startSplitNode = startSplitNode.getParent();
		if ( startSplitRequired ) {
			startSplitNodes.unshift(startSplitNode);
		} else {
			startOffset = startSplitNode.getOuterRange().start;
		}
		outerDepth++;
	}

	// Find end split point, if required
	endSplitNode = nodes[nodes.length - 1].node;
	endOffset = endSplitNode.getOuterRange().end;
	while( allowedParents !== null && ve.indexOf( endSplitNode.getParent().type, allowedParents ) === -1 ) {
		if ( endSplitNode.getParent().indexOf( endSplitNode ) < endSplitNode.getParent().getChildren().length - 1 ) {
			endSplitRequired = true;
		}
		endSplitNode = endSplitNode.getParent();
		if ( endSplitRequired ) {
			endSplitNodes.unshift(endSplitNode);
		} else {
			endOffset = endSplitNode.getOuterRange().end;
		}
	}

	if ( startSplitRequired ) {
		createSplits( startSplitNodes, true );
	}

	if ( endSplitRequired ) {
		createSplits( endSplitNodes, false );
	}

	this.unwrapNodes( outerDepth, 0 );

	return this;
};
