/**
 * DataModel node that can have branch or leaf children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.BranchNode}
 * @extends {ve.dm.Node}
 * @param {String} type Symbolic name of node type 
 * @param {ve.dm.Node[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.BranchNode = function( type, children, attributes ) {
	// Inheritance
	ve.dm.Node.call( this, type, 0, attributes );
	ve.BranchNode.call( this );

	if ( ve.isArray( children ) && children.length ) {
		this.splice.apply( this, [0, 0].concat( children ) );
	}
};

/* Methods */

/**
 * Sets the root node this node is a descendent of.
 * 
 * @method
 * @see {ve.dm.Node.prototype.setRoot}
 * @param {ve.dm.Node} root Node to use as root
 */
ve.dm.BranchNode.prototype.setRoot = function( root ) {
	if ( root == this.root ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	this.root = root;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setRoot( root );
	}
};

/**
 * Sets the document this node is a part of.
 * 
 * @method
 * @see {ve.dm.Node.prototype.setDocument}
 * @param {ve.dm.Document} root Node to use as root
 */
ve.dm.BranchNode.prototype.setDocument = function( doc ) {
	if ( doc == this.doc ) {
		// Nothing to do, don't recurse into all descendants
		return;
	}
	this.doc = doc;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setDocument( doc );
	}
};

/**
 * Adds a node to the end of this node's children.
 * 
 * @method
 * @param {ve.dm.BranchNode} childModel Item to add
 * @returns {Integer} New number of children
 * @emits splice (index, 0, [childModel])
 * @emits update
 */
ve.dm.BranchNode.prototype.push = function( childModel ) {
	this.splice( this.children.length, 0, childModel );
	return this.children.length;
};

/**
 * Removes a node from the end of this node's children
 * 
 * @method
 * @returns {ve.dm.BranchNode} Removed childModel
 * @emits splice (index, 1, [])
 * @emits update
 */
ve.dm.BranchNode.prototype.pop = function() {
	if ( this.children.length ) {
		var childModel = this.children[this.children.length - 1];
		this.splice( this.children.length - 1, 1 );
		return childModel;
	}
};

/**
 * Adds a node to the beginning of this node's children.
 * 
 * @method
 * @param {ve.dm.BranchNode} childModel Item to add
 * @returns {Integer} New number of children
 * @emits splice (0, 0, [childModel])
 * @emits update
 */
ve.dm.BranchNode.prototype.unshift = function( childModel ) {
	this.splice( 0, 0, childModel );
	return this.children.length;
};

/**
 * Removes a node from the beginning of this node's children
 * 
 * @method
 * @returns {ve.dm.BranchNode} Removed childModel
 * @emits splice (0, 1, [])
 * @emits update
 */
ve.dm.BranchNode.prototype.shift = function() {
	if ( this.children.length ) {
		var childModel = this.children[0];
		this.splice( 0, 1 );
		return childModel;
	}
};

/**
 * Adds and removes nodes from this node's children.
 * 
 * @method
 * @param {Integer} index Index to remove and or insert nodes at
 * @param {Integer} howmany Number of nodes to remove
 * @param {ve.dm.BranchNode} [...] Variadic list of nodes to insert
 * @returns {ve.dm.BranchNode[]} Removed nodes
 * @emits splice (index, howmany, [...])
 */
ve.dm.BranchNode.prototype.splice = function( index, howmany ) {
	var i,
		length,
		args = Array.prototype.slice.call( arguments, 0 ),
		diff = 0;
	if ( args.length >= 3 ) {
		length = args.length;
		for ( i = 2; i < length; i++ ) {
			args[i].attach( this );
			diff += args[i].getOuterLength();
		}
	}
	var removals = this.children.splice.apply( this.children, args );
	for ( i = 0, length = removals.length; i < length; i++ ) {
		removals[i].detach();
		diff -= removals[i].getOuterLength();
	}
	this.adjustLength( diff, true );
	this.emit.apply( this, ['splice'].concat( args ) );
	return removals;
};

/**
 * Gets the content offset of a node.
 * 
 * This method is pretty expensive. If you need to get different slices of the same content, get
 * the content first, then slice it up locally.
 * 
 * TODO: Rewrite this method to not use recursion, because the function call overhead is expensive
 * 
 * @method
 * @param {ve.Node} node Node to get offset of
 * @returns {Integer} Offset of node or -1 of node was not found
 */
ve.dm.BranchNode.prototype.getOffsetFromNode = function( node ) {
	if ( node === this ) {
		return 0;
	}
	if ( this.children.length ) {
		var offset = 0,
			childNode;
		for ( var i = 0, length = this.children.length; i < length; i++ ) {
			childNode = this.children[i];
			if ( childNode === node ) {
				return offset;
			}
			if (
				ve.dm.factory.canNodeHaveChildren( childNode.getType() ) &&
				childNode.getChildren().length
			) {
				var childOffset = this.getOffsetFromNode.call( childNode, node );
				if ( childOffset !== -1 ) {
					return offset + 1 + childOffset;
				}
			}
			offset += childNode.getOuterLength();
		}
	}
	return -1;
};

/* Inheritance */

ve.extendClass( ve.dm.BranchNode, ve.BranchNode );
ve.extendClass( ve.dm.BranchNode, ve.dm.Node );
