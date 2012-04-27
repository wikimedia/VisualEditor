/**
 * Document fragment.
 * 
 * @class
 * @constructor
 * @param {Array} data Linear model data to start with
 * @param {ve.dm.Document} [parentDocument] Document to use as root for created nodes
 */
ve.dm.DocumentFragment = function( data, parentDocument ) {
	// Properties
	this.parentDocument = parentDocument;
	this.data = data || [];
	this.rootNode = new ve.dm.DocumentNode();
	this.offsetMap = new Array( this.data.length );

	// Initialization
	var root = parentDocument ? parentDocument.getRootNode() : this.rootNode;
	/*
	 * The offsetMap is always one element longer than data because it includes a reference to the
	 * root node at the offset just past the end. To make population work correctly, we have to
	 * start out with that one extra reference.
	 */
	this.offsetMap.push( this.rootNode );
	this.rootNode.setRoot( root );
	/*
	 * Build a tree of nodes and nodes that will be added to them after a full scan is complete,
	 * then from the bottom up add nodes to their potential parents. This avoids massive length
	 * updates being broadcast upstream constantly while building is underway. Also populate the
	 * offset map as we go.
	 */
	var node,
		textLength = 0,
		inTextNode = false,
		// TODO document this stack of stacks
		stack = [[this.rootNode], []],
		children,
		openingIndex,
		currentStack = stack[1],
		parentStack = stack[0],
		currentNode = this.rootNode;

	for ( var i = 0, length = this.data.length; i < length; i++ ) {
		// Set the node reference for this offset in the offset cache
		// This looks simple, but there are three cases that result in the same thing:
		// 1. data[i] is an opening, so offset i is before the opening, so we
		//    need to point to the parent of the opened element. currentNode
		//    will be set to the opened element later, but right now it's
		//    still set to the parent of the opened element.
		// 2. data[i] is a closing, so offset i is before the closing, so we
		//    need to point to the closed element. currentNode will be set to
		//    the parent of the closed element later, but right now it's still
		//    set to the closed element
		// 3. data[i] is content, so offset i is in the middle of an element,
		//    so obviously we need currentNode, which won't be changed by this
		//    iteration
		this.offsetMap[i] = currentNode;

		if ( this.data[i].type === undefined ) {
			// Text node
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
			if ( inTextNode ) {
				// Finish the text node by setting the length
				currentNode.setLength( textLength );
				// But the state variables back as they were
				currentNode = parentStack[parentStack.length - 1];
				inTextNode = false;
				textLength = 0;
			}

			if ( this.data[i].type.charAt( 0 ) != '/' ) {
				// Branch or leaf node opening
				// Create a childless node
				node = ve.dm.factory.createNode( this.data[i].type, [], this.data[i].attributes );
				// Set the root pointer now, to prevent cascading updates
				node.setRoot( root );
				// Put the childless node on the current inner stack
				currentStack.push( node );
				// Create a new inner stack for this node
				parentStack = currentStack;
				currentStack = [];
				stack.push( currentStack );
				currentNode = node;
			} else {
				// Branch or leaf node closing
				// Pop this node's inner stack from the outer stack. It'll have all of the node's
				// child nodes fully constructed 
				children = stack.pop();
				currentStack = parentStack;
				parentStack = stack[stack.length - 2];
				// Attach the children to the node
				if ( children.length ) {
					ve.batchedSplice( currentNode.children, 0, 0, children );
				}
				currentNode = parentStack[parentStack.length - 1];
			}
		}
	}
	// The end state is stack = [ [this.rootNode] [ array, of, its, children ] ]
	// so attach all nodes in stack[1] to the root node
	ve.batchedSplice( this.rootNode.children, 0, 0, stack[1] );
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
ve.dm.DocumentFragment.prototype.getData = function( range, deep ) {
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

ve.dm.DocumentFragment.prototype.getOffsetMap = function() {
	return this.offsetMap;
};

ve.dm.DocumentFragment.prototype.getRootNode = function() {
	return this.rootNode;
};

ve.dm.DocumentFragment.prototype.getNodeFromOffset = function( offset ) {
	return this.offsetMap[offset];
};
