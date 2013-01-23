/*!
 * VisualEditor DataModel Fragment class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
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

/* Methods */

/**
 * Handle transactions being processed on the document.
 *
 * This keeps the range of the fragment valid, even while other transactions are being processed.
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
 *  - `word`: Expands to cover the nearest word by looking for word boundary characters
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
			range = new ve.Range(
				this.document.getNearestWordBoundary( this.range.start, -1 ),
				this.document.getNearestWordBoundary( this.range.end, 1 )
			);
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
 * @see ve.Document#selectNodes Used to get the return value.
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
 * @see ve.Document#selectNodes for more information about the return value.
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
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.setAutoSelect = function ( value ) {
	this.noAutoSelect = !value;
	return this;
};

/**
 * Apply the fragment's range to the surface as a selection.
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} This fragment
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
 * @returns {ve.dm.SurfaceFragment} This fragment
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
 * @returns {ve.dm.SurfaceFragment} This fragment
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
 * @returns {ve.dm.SurfaceFragment} This fragment
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
 * @returns {ve.dm.SurfaceFragment} This fragment
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
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.wrapNodes = function ( wrapper ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	if ( !ve.isArray( wrapper ) ) {
		wrapper = [wrapper];
	}
	var tx = ve.dm.Transaction.newFromWrap( this.document, this.range, [], [], [], wrapper );
	this.range = tx.translateRange( this.range );
	this.surface.change( tx, !this.noAutoSelect && this.range );
	return this;
};

/**
 * Unwrap each node in the fragment out of one or more elements.
 *
 * @method
 * @param {string|string[]} type Node types to unwrap, or array of node types to unwrap
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.unwrapNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
	return this;
};

/**
 * Change the wrapping of each node in the fragment from one type to another.
 *
 * A wrapper object is a linear model element; a plain object containing a type property and an
 * optional attributes property.
 *
 * @method
 * @param {string|string[]} type Node types to unwrap, or array of node types to unwrap
 * @param {Object|Object[]} wrapper Wrapper object, or array of wrapper objects (see above)
 * @param {string} wrapper.type Node type of wrapper
 * @param {Object} [wrapper.attributes] Attributes of wrapper
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.rewrapNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
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
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.wrapAllNodes = function ( wrapper ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	if ( !ve.isArray( wrapper ) ) {
		wrapper = [wrapper];
	}
	var tx = ve.dm.Transaction.newFromWrap( this.document, this.range, [], wrapper, [], [] );
	this.range = tx.translateRange( this.range );
	this.surface.change( tx, !this.noAutoSelect && this.range );
	return this;
};

/**
 * Unwrap nodes in the fragment out of one or more elements.
 *
 * TODO: Figure out what the arguments for this function should be
 *
 * @method
 * @param {string|string[]} type Node types to unwrap, or array of node types to unwrap
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.unwrapAllNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
	return this;
};

/**
 * Change the wrapping of nodes in the fragment from one type to another.
 *
 * A wrapper object is a linear model element; a plain object containing a type property and an
 * optional attributes property.
 *
 * @method
 * @param {string|string[]} type Node types to unwrap, or array of node types to unwrap
 * @param {Object|Object[]} wrapper Wrapper object, or array of wrapper objects (see above)
 * @param {string} wrapper.type Node type of wrapper
 * @param {Object} [wrapper.attributes] Attributes of wrapper
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.rewrapAllNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
	return this;
};
