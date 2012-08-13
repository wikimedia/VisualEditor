/**
 * VisualEditor data model Fragment class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel document fragment.
 *
 * @class
 * @constructor
 * @param {ve.dm.Surface} surface Target surface
 * @param {ve.Range} [range] Range within target document, current selection used by default
 */
ve.dm.SurfaceFragment = function ( surface, range ) {
	// Short-circuit for null fragment
	if ( !surface ) {
		return this;
	}

	// Properties
	this.surface = surface;
	this.document = surface.getDocument();
	this.range = range && range instanceof ve.Range ? range : surface.getSelection();

	// Events
	surface.on( 'transact', ve.bind( this, this.onTransact ) );

	// Initialization
	var length = this.document.getLength();
	this.range = new ve.Range(
		// Clamp range to valid document offsets
		Math.min( Math.max( this.range.from, 0 ), length ),
		Math.min( Math.max( this.range.to, 0 ), length )
	);
};

/* Methods */

/**
 * Responds to transactions being processed on the document.
 *
 * This keeps the range of this fragment valid, even while other transactions are being processed.
 *
 * @method
 * @param {ve.dm.Transaction} tx Transaction that's just been processed
 */
ve.dm.SurfaceFragment.prototype.onTransact = function( tx ) {
	this.range = tx.translateRange( this.range );
};

/**
 * Checks if this is a null fragment.
 *
 * @method
 * @returns {Boolean} Fragment is a null fragment
 */
ve.dm.SurfaceFragment.prototype.isNull = function() {
	return this.surface === undefined;
};

/**
 * Gets a new fragment with an adjusted position
 *
 * @method
 * @param {Number} [start] Adjustment for start position
 * @param {Number} [end] Adjustment for end position
 * @returns {ve.dm.SurfaceFragment} Adjusted fragment
 */
ve.dm.SurfaceFragment.prototype.adjustRange = function ( start, end ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	return new ve.dm.SurfaceFragment(
		this.document,
		new ve.Range( this.range.start + ( start || 0 ),  this.range.end + ( end || 0 ) )
	);
};

/**
 * Gets a new fragment with a zero-length selection at the start offset.
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} Collapsed fragment
 */
ve.dm.SurfaceFragment.prototype.collapseRange = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	return new ve.dm.SurfaceFragment( this.document, new ve.Range( this.range.start ) );
};

/**
 * Gets a new fragment with a range that no longer includes leading and trailing whitespace.
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} Trimmed fragment
 */
ve.dm.SurfaceFragment.prototype.trimRange = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	return new ve.dm.SurfaceFragment(
		this.document, this.document.trimOuterSpaceFromRange( this.range )
	);
};

/**
 * Gets a new fragment that covers an expanded range of the document.
 *
 * @method
 * @param {String} [scope=parent] Method of expansion:
 *     'root': Expands to cover the entire document
 *     'siblings': Expands to cover all sibling nodes
 *     'closest': Expands to cover the closest common ancestor node of a specified type
 *     'parent': Expands to cover the closest common parent node
 * @param {String} [type] Node type to use with certain scope methods that require it
 * @returns {ve.dm.SurfaceFragment} Expanded fragment
 */
ve.dm.SurfaceFragment.prototype.expandRange = function ( scope, type ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var range, node, nodes, parent;
	switch ( scope || 'parent' ) {
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
			while ( parent.getType() !== type ) {
				node = parent;
				parent = parent.getParent();
				if ( !parent ) {
					return new ve.dm.SurfaceFragment( null );
				}
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
	return new ve.dm.SurfaceFragment( this.document, range );
};

/**
 * Get data for the fragment.
 *
 * @method
 * @param {Boolean} [deep] Get a deep copy of the data
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
 * Get nodes covered by the fragment.
 *
 * @see {ve.Document.selectNodes} for information about the modes argument.
 *
 * @method
 * @param {String} [mode='leaves'] Type of selection to perform
 * @returns {Array} List of nodes and related information
 */
ve.dm.SurfaceFragment.prototype.getNodes = function ( mode ) {
	// Handle null fragment
	if ( !this.surface ) {
		return [];
	}
	return this.document.selectNodes( mode, this.range );
};

/**
 * Applies an annotation to content in the fragment.
 *
 * To avoid problems identified in bug 33108, use the {ve.dm.SurfaceFragment.trimRange} method.
 *
 * @method
 * @param {String} method Mode of annotation, either 'set' or 'clear'
 * @param {String} type Annotation type, for example: 'textStyle/bold'
 * @param {Object} [data] Additional annotation data
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.annotateContent = function ( method, type, data ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	var tx,
		annotation = { 'type': type };
	if ( data ) {
		annotation.data = data;
	}
	if ( this.range.getLength() ) {
		tx = ve.dm.Transaction.newFromAnnotation( this.document, this.range, method, annotation );
		this.surface.change( tx, this.range );
	}
	return this;
};

/**
 * Remove content in the fragment and insert content before it.
 *
 * This will move the fragment to the end of the insertion and make it zero-length.
 *
 * @method
 * @param {Mixed} content Content to insert
 * @param {Boolean} annotate Content should be automatically annotated to match surrounding content
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.insertContent = function ( content, annotate ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
	return this;
};

/**
 * Removes content in the fragment.
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.removeContent = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
	return this;
};

/**
 * Converts content branches in the fragment.
 *
 * @method
 * @param {String} type Element type to convert to
 * @param {Object} [attributes] Initial attributes for new element
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.convertNodes = function ( type, attributes ) {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
	return this;
};

/**
 * Wraps content in the fragment with one or more elements.
 *
 * TODO: Figure out what the arguments for this function should be
 *
 * @method
 * @returns {ve.dm.SurfaceFragment} This fragment
 */
ve.dm.SurfaceFragment.prototype.wrapNodes = function () {
	// Handle null fragment
	if ( !this.surface ) {
		return this;
	}
	// TODO: Implement
	return this;
};

/**
 * Unwraps content in the fragment out of one or more elements.
 *
 * TODO: Figure out what the arguments for this function should be
 *
 * @method
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
