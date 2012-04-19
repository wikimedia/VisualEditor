/**
 * Creates an ve.dm.BranchNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.BranchNode}
 * @extends {ve.dm.Node}
 * @param {String} type Symbolic name of node type
 * @param {Object} element Element object in document data
 * @param {ve.dm.BranchNode[]} [contents] List of child nodes to append
 */
ve.dm.BranchNode = function( type, element, contents ) {
	// Inheritance
	ve.BranchNode.call( this );
	ve.dm.Node.call( this, type, element, 0 );

	// Child nodes
	if ( ve.isArray( contents ) ) {
		for ( var i = 0; i < contents.length; i++ ) {
			this.push( contents[i] );
		}
	}
};

/* Methods */

/**
 * Gets a plain object representation of the document's data.
 * 
 * @method
 * @see {ve.dm.Node.getPlainObject}
 * @see {ve.dm.DocumentNode.newFromPlainObject}
 * @returns {Object} Plain object representation
 */
ve.dm.BranchNode.prototype.getPlainObject = function() {
	var obj = { 'type': this.type };
	if ( this.element && this.element.attributes ) {
		obj.attributes = ve.copyObject( this.element.attributes );
	}
	obj.children = [];
	for ( var i = 0; i < this.children.length; i++ ) {
		obj.children.push( this.children[i].getPlainObject() );
	}
	return obj;
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

/**
 * Sorts this node's children.
 * 
 * @method
 * @param {Function} sortfunc Function to use when sorting
 * @emits beforeSort (sortfunc)
 * @emits afterSort (sortfunc)
 * @emits update
 */
ve.dm.BranchNode.prototype.sort = function( sortfunc ) {
	this.emit( 'beforeSort', sortfunc );
	this.children.sort( sortfunc );
	this.emit( 'afterSort', sortfunc );
	this.emit( 'update' );
};

/**
 * Reverses the order of this node's children.
 * 
 * @method
 * @emits beforeReverse
 * @emits afterReverse
 * @emits update
 */
ve.dm.BranchNode.prototype.reverse = function() {
	this.emit( 'beforeReverse' );
	this.children.reverse();
	this.emit( 'afterReverse' );
	this.emit( 'update' );
};

/**
 * Sets the root node to this and all of its descendants.
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
 * Clears the root node from this and all of it's children.
 * 
 * @method
 * @see {ve.dm.Node.prototype.clearRoot}
 */
ve.dm.BranchNode.prototype.clearRoot = function() {
	this.root = null;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].clearRoot();
	}
};

/* Inheritance */

ve.extendClass( ve.dm.BranchNode, ve.BranchNode );
ve.extendClass( ve.dm.BranchNode, ve.dm.Node );
