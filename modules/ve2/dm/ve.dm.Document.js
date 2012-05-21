/**
 * DataModel document.
 *
 * @class
 * @extends {ve.Document}
 * @constructor
 * @param {Array} data Linear model data to start with
 * @param {ve.dm.Document} [parentDocument] Document to use as root for created nodes
 */
ve.dm.Document = function( data, parentDocument ) {
	// Inheritance
	ve.Document.call( this, new ve.dm.DocumentNode() );

	// Properties
	this.parentDocument = parentDocument;
	this.data = data || [];
	this.offsetMap = new Array( this.data.length );

	// Initialization
	var doc = parentDocument || this;
	this.documentNode.setDocument( doc );
	var root = doc.getDocumentNode();
	this.documentNode.setRoot( root );

	/*
	 * The offsetMap is always one element longer than data because it includes a reference to the
	 * root node at the offset just past the end. To make population work correctly, we have to
	 * start out with that one extra reference.
	 */
	this.offsetMap.push( this.documentNode );

	/*
	 * Build a tree of nodes and nodes that will be added to them after a full scan is complete,
	 * then from the bottom up add nodes to their potential parents. This avoids massive length
	 * updates being broadcast upstream constantly while building is underway. Also populate the
	 * offset map as we go.
	 */
	var node,
		textLength = 0,
		inTextNode = false,
		// Stack of stacks, each containing a
		stack = [[this.documentNode], []],
		children,
		openingIndex,
		currentStack = stack[1],
		parentStack = stack[0],
		currentNode = this.documentNode;
	for ( var i = 0, length = this.data.length; i < length; i++ ) {
		/*
		 * Set the node reference for this offset in the offset cache.
		 *
		 * This looks simple, but there are three cases that result in the same thing:
		 *
		 *   1. data[i] is an opening, so offset i is before the opening, so we need to point to the
		 *      parent of the opened element. currentNode will be set to the opened element later,
		 *      but right now its still set to the parent of the opened element.
		 *   2. data[i] is a closing, so offset i is before the closing, so we need to point to the
		 *      closed element. currentNode will be set to the parent of the closed element later,
		 *      but right now it's still set to the closed element.
		 *   3. data[i] is content, so offset i is in the middle of an element, so obviously we need
		 *      currentNode, which won't be changed by this iteration.
		 *
		 * We want to populate the offsetMap with branches only, but we've just written the actual
		 * node that lives at this offset. So if it's a leaf node, change it to its parent.
		 */
		this.offsetMap[i] = ve.dm.factory.canNodeHaveChildren( currentNode.getType() ) ?
			currentNode : parentStack[parentStack.length - 1];
		// Infer that if an item in the linear model has a type attribute than it must be an element
		if ( this.data[i].type === undefined ) {
			// Text node opening
			if ( !inTextNode ) {
				// Create a lengthless text node
				node = new ve.dm.TextNode();
				// Set the root pointer now, to prevent cascading updates
				node.setRoot( root );
				// Put the node on the current inner stack
				currentStack.push( node );
				currentNode = node;
				// Set a flag saying we're inside a text node
				inTextNode = true;
			}
			// Track the length
			textLength++;
		} else {
			// Text node closing
			if ( inTextNode ) {
				// Finish the text node by setting the length
				currentNode.setLength( textLength );
				// Put the state variables back as they were
				currentNode = parentStack[parentStack.length - 1];
				inTextNode = false;
				textLength = 0;
			}
			// Element open/close
			if ( this.data[i].type.charAt( 0 ) != '/' ) {
				// Branch or leaf node opening
				// Create a childless node
				node = ve.dm.factory.create( this.data[i].type, [], this.data[i].attributes );
				// Set the root pointer now, to prevent cascading updates
				node.setRoot( root );
				// Put the childless node on the current inner stack
				currentStack.push( node );
				if ( ve.dm.factory.canNodeHaveChildren( node.getType() ) ) {
					// Create a new inner stack for this node
					parentStack = currentStack;
					currentStack = [];
					stack.push( currentStack );
				}
				currentNode = node;
			} else {
				// Branch or leaf node closing
				if ( ve.dm.factory.canNodeHaveChildren( currentNode.getType() ) ) {
					// Pop this node's inner stack from the outer stack. It'll have all of the
					// node's child nodes fully constructed
					children = stack.pop();
					currentStack = parentStack;
					parentStack = stack[stack.length - 2];
					if ( !parentStack ) {
						// This can only happen if we got unbalanced data
						throw 'Unbalanced input passed to document';
					}
					// Attach the children to the node
					ve.batchSplice( currentNode, 0, 0, children );
				}
				currentNode = parentStack[parentStack.length - 1];
			}
		}
	}
	// The end state is stack = [ [this.documentNode] [ array, of, its, children ] ]
	// so attach all nodes in stack[1] to the root node
	ve.batchSplice( this.documentNode, 0, 0, stack[1] );
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
 * Gets slice or copy of the document data.
 *
 * @method
 * @param {ve.Range} [range] Range of data to get, all data will be given by default
 * @param {Boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @returns {Array} Slice or copy of document data
 */
ve.dm.Document.prototype.getData = function( range, deep ) {
	var start = 0,
		end;
	if ( range !== undefined ) {
		range.normalize();
		start = Math.max( 0, Math.min( this.data.length, range.start ) );
		end = Math.max( 0, Math.min( this.data.length, range.end ) );
	}
	// IE work-around: arr.slice( 0, undefined ) returns [] while arr.slice( 0 ) behaves correctly
	var data = end === undefined ? this.data.slice( start ) : this.data.slice( start, end );
	// Return either the slice or a deep copy of the slice
	return deep ? ve.copyArray( data ) : data;
};

ve.dm.Document.prototype.getOffsetMap = function() {
	return this.offsetMap;
};

ve.dm.Document.prototype.getNodeFromOffset = function( offset ) {
	return this.offsetMap[offset];
};

/**
 * Gets the content data of a node.
 *
 * @method
 * @param {ve.dm.Node} node Node to get content data for
 * @returns {Array|null} List of content and elements inside node or null if node is not found
 */
ve.dm.Document.prototype.getDataFromNode = function( node ) {
	var length = node.getLength(),
		offset = this.documentNode.getOffsetFromNode( node );
	if ( offset >= 0 ) {
		// XXX: If the node is wrapped in an element than we should increment the offset by one so
		// we only return the content inside the element.
		if ( node.isWrapped() ) {
			offset++;
		}
		return this.data.slice( offset, offset + length );
	}
	return null;
};

/**
 * Gets a list of annotations that a given offset is covered by.
 *
 * @method
 * @param {Integer} offset Offset to get annotations for
 * @returns {Object[]} A copy of all annotation objects offset is covered by
 */
ve.dm.Document.prototype.getAnnotationsFromOffset = function( offset ) {
	var annotations;
	// Since annotations are not stored on a closing leaf node,
	// rewind offset by 1 to return annotations for that structure
	if (
		ve.isPlainObject( this.data[offset] ) && // structural offset
		this.data[offset].hasOwnProperty('type') && // just in case
		this.data[offset].type.charAt( 0 ) === '/' && // closing offset
		ve.dm.factory.canNodeHaveChildren(
			this.data[offset].type.substr( 1 )
		) === false // leaf node
	){
		offset = this.getRelativeContentOffset( offset, -1 );
	}

	annotations = ve.isArray( this.data[offset] ) ?
		this.data[offset][1] : this.data[offset].annotations;

	if ( ve.isPlainObject( annotations ) ) {
		return ve.getObjectValues( annotations );
	}
	return [];
};

/**
 * Does this offset contain the specified annotation
 *
 * @method
 * @param {Integer} offset Offset to look at
 * @param {Object} annotation Object to look for
 * @returns {Boolean} Whether an offset contains the specified annotation
 */
ve.dm.Document.prototype.offsetContainsAnnotation = function ( offset, annotation ) {
	var annotations = this.getAnnotationsFromOffset( offset );
	for ( var a=0; a<annotations.length; a++ ) {
		if ( ve.compareObjects( annotations[a], annotation ) ){
			return true;
		}
	}
	return false;
};

/**
 * Gets the range of content surrounding a given offset that's covered by a given annotation.
 *
 * @param {Integer} offset Offset to begin looking forward and backward from
 * @param {Object} annotation Annotation to test for coverage with
 * @returns {ve.Range|null} Range of content covered by annotation, or null if offset is not covered
 */
ve.dm.Document.prototype.getAnnotatedRangeFromOffset = function ( offset, annotation ) {
	var start = offset,
		end = offset;
	if ( this.offsetContainsAnnotation( offset, annotation ) === false ) {
		return null;
	}
	while ( start > 0 ) {
		start--;
		if ( this.offsetContainsAnnotation( start, annotation ) === false ) {
			start++;
			break;
		}
	}
	while ( end < this.data.length ) {
		if ( this.offsetContainsAnnotation(end, annotation ) === false ) {
			break;
		}
		end++;
	}
	return new ve.Range( start, end );
};

/**
 * Checks if a character has matching annotations.
 *
 * @static
 * @methodng
 * @param {Integer} offset Offset of annotated character
 * @param {RegExp} pattern Regular expression pattern to match with
 * @returns {Boolean} Character has matching annotations
 */
ve.dm.Document.prototype.offsetContainsMatchingAnnotations = function( offset, pattern ) {
	if ( !( pattern instanceof RegExp ) ) {
		throw 'Invalid Pattern. Pattern not instance of RegExp';
	}
	var annotations = ve.isArray( this.data[offset] ) ?
		this.data[offset][1] : this.data[offset].annotations;
	if ( ve.isPlainObject( annotations ) ) {
		for ( var hash in annotations ) {
			if ( pattern.test( annotations[hash].type ) ) {
				return true;
			}
		}
	}
	return false;
};

/**
 * Gets a list of annotations that match a regular expression.
 *
 * @static
 * @methodng
 * @param {Integer} offset Offset of annotated character
 * @param {RegExp} pattern Regular expression pattern to match with
 * @returns {Object} Annotations that match the pattern
 */
ve.dm.Document.prototype.getMatchingAnnotations = function( offset, pattern ) {
	if ( !( pattern instanceof RegExp ) ) {
		throw 'Invalid Pattern. Pattern not instance of RegExp';
	}
	var matches = {},
		annotations = ve.isArray( this.data[offset] ) ?
			this.data[offset][1] : this.data[offset].annotations;
	if ( ve.isPlainObject( annotations ) ) {
		for ( var hash in annotations ) {
			if ( pattern.test( annotations[hash].type ) ){
				matches[hash] = annotations[hash];
			}
		}
	}
	return matches;
};

/**
 * Gets an array of common annnotations across a range.
 *
 * @method
 * @param {Integer} offset Offset to get annotations for
 * @returns {Object[]} A copy of all annotation objects offset is covered by
 */
ve.dm.Document.prototype.getAnnotationsFromRange = function( range ) {
	var	currentChar = {},
		annotations = [],
		charCount = 0,
		map = {};
		
	range.normalize();
	for ( var i = range.start; i < range.end; i++ ) {
		// skip non characters
		if ( ve.dm.Document.isElementData( this.data, i ) ) {
			continue;
		}
		//current character annotations
		currentChar = this.data[i][1];
		// if a non annotated character, no commonality.
		if ( currentChar === undefined ) {
			return [];
		}
		charCount++;
		// if current char annotations are not the same as previous char.
		if ( ve.compareObjects( map, currentChar ) === false) {
			//retain common annotations
			if ( charCount > 1 ) {
				// look for annotation in map
				for ( var a in currentChar ) {
					if( map[a] === undefined ) {
						delete currentChar[a];
					}
				}
			}
		}
		//save map
		map = currentChar;
	}
	// build array of annotations
	for ( var key in map ) {
		annotations.push( map[key] );
	}
	return annotations;
};

/**
 * Rebuild one or more nodes following a change in linear model data.
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
	var fragment = new ve.dm.Document( data, this );
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

ve.extendClass( ve.dm.Document, ve.Document );
