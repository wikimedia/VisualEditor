/**
 * Data model node that can have branch or twig children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.BranchNode}
 * @extends {ve.dm.Node}
 * @param {String} type Symbolic name of node type 
 * @param {Array} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.BranchNode = function( type, children, attributes ) {
	// Inheritance
	ve.BranchNode.call( this, children );
	ve.dm.Node.call( this, type, 0, attributes );

	// Child nodes
	if ( ve.isArray( contents ) ) {
		for ( var i = 0; i < contents.length; i++ ) {
			this.push( contents[i] );
		}
	}
};

/* Methods */

/**
 * Adds a node to the end of this node's children.
 * 
 * @method
 * @param {ve.dm.BranchNode} childModel Item to add
 * @returns {Integer} New number of children
 * @emits beforeSplice (index, 0, [childModel])
 * @emits afterSplice (index, 0, [childModel])
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
 * @emits beforeSplice (index, 1, [])
 * @emits afterSplice (index, 1, [])
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
 * Removes a node from the beginning of this node's children
 * 
 * @method
 * @returns {ve.dm.BranchNode} Removed childModel
 * @emits beforeSplice (0, 1, [])
 * @emits afterSplice (0, 1, [])
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
 * Adds a node to the beginning of this node's children.
 * 
 * @method
 * @param {ve.dm.BranchNode} childModel Item to add
 * @returns {Integer} New number of children
 * @emits beforeSplice (0, 0, [childModel])
 * @emits afterSplice (0, 0, [childModel])
 * @emits update
 */
ve.dm.BranchNode.prototype.unshift = function( childModel ) {
	this.splice( 0, 0, childModel );
	return this.children.length;
};

/**
 * Adds and removes nodes from this node's children.
 * 
 * @method
 * @param {Integer} index Index to remove and or insert nodes at
 * @param {Integer} howmany Number of nodes to remove
 * @param {ve.dm.BranchNode} [...] Variadic list of nodes to insert
 * @returns {ve.dm.BranchNode[]} Removed nodes
 * @emits beforeSplice (index, howmany, [...])
 * @emits afterSplice (index, howmany, [...])
 * @emits update
 */
ve.dm.BranchNode.prototype.splice = function( index, howmany ) {
	var i,
		length,
		args = Array.prototype.slice.call( arguments, 0 ),
		diff = 0;
	this.emit.apply( this, ['beforeSplice'].concat( args ) );
	if ( args.length >= 3 ) {
		for ( i = 2, length = args.length; i < length; i++ ) {
			if ( !this.canHaveGrandchildren() && args[i].canHaveChildren() ) {
				throw 'Trying to attach a non-leaf node to a twig node';
			}
			args[i].attach( this );
			args[i].on( 'update', this.emitUpdate );
			diff += args[i].getElementLength();
		}
	}
	var removals = this.children.splice.apply( this.children, args );
	for ( i = 0, length = removals.length; i < length; i++ ) {
		removals[i].detach();
		removals[i].removeListener( 'update', this.emitUpdate );
		diff -= removals[i].getElementLength();
	}
	this.adjustContentLength( diff, true );
	this.emit.apply( this, ['afterSplice'].concat( args ) );
	this.emit( 'update' );
	return removals;
};

/* Inheritance */

ve.extendClass( ve.dm.BranchNode, ve.BranchNode );
ve.extendClass( ve.dm.BranchNode, ve.dm.Node );
