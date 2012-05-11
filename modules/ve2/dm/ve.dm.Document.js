/**
 * DataModel document.
 * 
 * @class
 * @extends {ve.dm.DocumentFragment}
 * @constructor
 * @param {Array} data Linear model data to start with
 */
ve.dm.Document = function( data ) {
	// Inheritance
	ve.dm.DocumentFragment.call( this, data );
};

/* Static methods */

/**
 * Checks if content can be inserted at an offset in document data.
 * 
 * This method assumes that any value that has a type property that's a string is an element object.
 * 
 * @example Content offsets:
 *      <heading> a </heading> <paragraph> b c <img> </img> </paragraph>
 *     .         ^ ^          .           ^ ^ ^     .      ^            .
 * 
 * @example Content offsets:
 *      <list> <listItem> </listItem> <list>
 *     .      .          .           .      .
 * 
 * @static
 * @method
 * @param {Array} data Document data
 * @param {Integer} offset Document offset
 * @returns {Boolean} Content can be inserted at offset
 */
ve.dm.Document.isContentOffset = function( data, offset ) {
	// Edges are never content
	if ( offset === 0 || offset === data.length ) {
		return false;
	}
	var left = data[offset - 1],
		right = data[offset],
		factory = ve.dm.factory;
	return (
		// Data exists at offsets
		( left !== undefined && right !== undefined ) &&
		(
			// If there's content on the left or the right of the offset than we are good
			// <paragraph>|a|</paragraph>
			( typeof left === 'string' || typeof right === 'string' ) ||
			// Same checks but for annotated characters - isArray is slower, try it next
			( ve.isArray( left ) || ve.isArray( right ) ) ||
			// The most expensive test are last, these deal with elements
			(
				// Right of a leaf
				// <paragraph><image></image>|</paragraph>
				(
					// Is an element
					typeof left.type === 'string' &&
					// Is a closing
					left.type.charAt( 0 ) === '/' &&
					// Is a leaf
					!factory.canNodeHaveChildren( left.type.substr( 1 ) )
				) || 
				// Left of a leaf
				// <paragraph>|<image></image></paragraph>
				(
					// Is an element
					typeof right.type === 'string' &&
					// Is not a closing
					right.type.charAt( 0 ) !== '/' &&
					// Is a leaf
					!factory.canNodeHaveChildren( right.type )
				) ||
				// Inside empty content branch
				// <paragraph>|</paragraph>
				(
					// Inside empty element
					'/' + left.type === right.type &&
					// Both are content branches (right is the same type)
					factory.canNodeHaveChildren( left.type ) &&
					!factory.canNodeHaveGrandchildren( left.type )
				)
			)
		)
	);
};

/**
 * Checks if content can be inserted at an offset in document data.
 * 
 * This method assumes that any value that has a type property that's a string is an element object.
 * 
 * @example Structural offsets:
 *      <heading> a </heading> <paragraph> b c <img> </img> </paragraph>
 *     ^         . .          ^           . . .     .      .            ^
 * 
 * @static
 * @method
 * @param {Array} data Document data
 * @param {Integer} offset Document offset
 * @returns {Boolean} Structure can be inserted at offset
 */
ve.dm.Document.isStructuralOffset = function( data, offset ) {
	// Edges are always structural
	if ( offset === 0 || offset === data.length ) {
		return true;
	}
	// Offsets must be within range and both sides must be elements
	var left = data[offset - 1],
		right = data[offset],
		factory = ve.dm.factory;
	return (
		(
			left !== undefined &&
			right !== undefined &&
			typeof left.type === 'string' &&
			typeof right.type === 'string'
		) &&
		(
			// Right of a branch
			// <list><listItem><paragraph>a</paragraph>|</listItem>|</list>|
			(
				// Is a closing
				left.type.charAt( 0 ) === '/' &&
				// Is a branch
				factory.canNodeHaveChildren( left.type.substr( 1 ) )
			) ||
			// Left of branch
			// |<list>|<listItem>|<paragraph>a</paragraph></listItem></list>
			(
				// Is not a closing
				right.type.charAt( 0 ) !== '/' &&
				// Is a branch
				factory.canNodeHaveChildren( right.type )
			) ||
			// Inside empty non-content branch
			// <list>|</list> or <list><listItem>|</listItem></list>
			(
				// Inside empty element
				'/' + left.type === right.type &&
				// Both are non-content branches (right is the same type)
				factory.canNodeHaveGrandchildren( left.type )
			)
		)
	);
};

/**
 * Checks if a data at a given offset is an element.
 * 
 * This method assumes that any value that has a type property that's a string is an element object.
 * 
 * @example Element data:
 *      <heading> a </heading> <paragraph> b c <img></img> </paragraph>
 *     ^         . ^          ^           . . ^     ^     ^            .
 * 
 * @static
 * @method
 * @param {Array} data Document data
 * @param {Integer} offset Document offset
 * @returns {Boolean} Data at offset is an element
 */
ve.dm.Document.isElementData = function( data, offset ) {
	// Data exists at offset and appears to be an element
	return data[offset] !== undefined && typeof data[offset].type === 'string';
};

/**
 * Checks for elements in document data.
 * 
 * This method assumes that any value that has a type property that's a string is an element object.
 * Elements are discovered by iterating through the entire data array (backwards).
 * 
 * @static
 * @method
 * @param {Array} data Document data
 * @returns {Boolean} At least one elements exists in data
 */
ve.dm.Document.containsElementData = function( data ) {
	var i = data.length;
	while ( i-- ) {
		if ( data[i].type !== undefined ) {
			return true;
		}
	}
	return false;
};

/* Methods */

/**
 * Rebuild one or more nodes from a linear model fragment.
 * 
 * The data provided to this method may contain either one node or multiple sibling nodes, but it
 * must be balanced and valid. Data provided to this method also may not contain any content at the
 * top level. The tree and offset map are updated during this operation.
 * 
 * Process:
 *  1. Nodes between {index} and {index} + {numNodes} in {parent} will be removed
 *  2. Data will be retrieved from this.data using {offset} and {newLength}
 *  3. A document fragment will be generated from the retrieved data
 *  4. The document fragment's offset map will be inserted into this document at {offset}
 *  5. The document fragment's nodes will be inserted into {parent} at {index}
 * 
 * Use cases:
 *  1. Rebuild old nodes and offset data after a change to the linear model.
 *  2. Insert new nodes and offset data after a insertion in the linear model.
 * 
 * @param {ve.dm.Node} parent Parent of the node(s) being rebuilt
 * @param {Integer} index Index within parent to rebuild or insert nodes
 *   - If {numNodes} == 0: Index to insert nodes at
 *   - If {numNodes} >= 1: Index of first node to rebuild
 * @param {Integer} numNodes Total number of nodes to rebuild
 *   - If {numNodes} == 0: Nothing  will be rebuilt, but the node(s) built from data will be
 *     inserted before {index}. To insert nodes at the end, use number of children in {parent}
 *   - If {numNodes} == 1: Only the node at {index} will be rebuilt
 *   - If {numNodes} > 1: The node at {index} and the next {numNodes-1} nodes will be rebuilt
 * @param {Integer} offset Linear model offset to rebuild or insert offset map data
 *   - If {numNodes} == 0: Offset to insert offset map data at
 *   - If {numNodes} >= 1: Offset to remove old and insert new offset map data at
 * @param {Integer} newLength Length of data in linear model to rebuild or insert nodes for
 * @returns {ve.dm.Node[]} Array containing the rebuilt/inserted nodes
 */
ve.dm.Document.prototype.rebuildNodes = function( parent, index, numNodes, offset, newLength ) {
	// Compute the length of the old nodes (so we can splice their offsets out of the offset map)
	var oldLength = 0;
	for ( var i = index; i < index + numNodes; i++ ) {
		oldLength += parent.children[i].getOuterLength();
	}
	// Get a slice of the document where it's been changed
	var data = this.data.slice( offset, offset + newLength );
	// Build document fragment from data
	var fragment = new ve.dm.DocumentFragment( data, this );
	// Get generated child nodes from the document fragment
	var nodes = fragment.getDocumentNode().getChildren();
	// Replace nodes in the model tree
	ve.batchSplice( parent, index, numNodes, nodes );
	// Update offset map
	ve.batchSplice( this.offsetMap, offset, oldLength, fragment.getOffsetMap() );
	// Return inserted nodes
	return nodes;
};

/**
 * Gets a content offset a given distance forwards or backwards from another.
 * 
 * @method
 * @param {Integer} offset Offset to start from
 * @param {Integer} distance Number of content offsets to move
 * @returns {Integer} Relative content offset
 */
ve.dm.Document.prototype.getRelativeContentOffset = function( offset, distance ) {
	if ( distance === 0 ) {
		return offset;
	}
	var direction = distance > 0 ? 1 : -1,
		i = offset + direction,
		steps = 0;
	distance = Math.abs( distance );
	while ( i > 0 && i < this.data.length ) {
		if ( !ve.dm.Document.isStructuralOffset( this.data, i ) ) {
			steps++;
			offset = i;
			if ( distance === steps ) {
				return offset;
			}
		}
		i += direction;
	}
	return offset;
};

/* Inheritance */

ve.extendClass( ve.dm.Document, ve.dm.DocumentFragment );
