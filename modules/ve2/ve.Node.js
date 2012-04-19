/**
 * Creates an ve.Node object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.EventEmitter}
 * @param {String} type Symbolic name of node type
 */
ve.Node = function( type ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.type = type;
	this.parent = null;
	this.root = this;

	// Convenience function for emitting update events
	// Has this bound to the closure scope, so can be passed as a callback
	var _this = this;
	this.emitUpdate = function() {
		_this.emit( 'update' );
	};
};

/* Methods */

/**
 * Gets the symbolic node type name.
 * 
 * @method
 * @returns {String} Symbolic name of element type
 */
ve.Node.prototype.getType = function() {
	return this.type;
};

/**
 * Checks if this node can have child nodes.
 * 
 * @method
 * @abstract
 * @returns {Boolean} Whether this node can have children
 */
ve.Node.prototype.canHaveChildren = function() {
	throw 've.Node.canHaveChildren not implemented in this subclass:' + this.constructor;
};

/**
 * Checks if this node can have child nodes that can have child nodes.
 * 
 * If this function returns false, only nodes that can't have children can be attached to this node.
 * If canHaveChildren() returns false, this method must also return false.
 *
 * @method
 * @abstract
 * @returns {Boolean} Whether this node can have grandchildren
 */
ve.Node.prototype.canHaveGrandchildren = function() {
	throw 've.Node.canHaveGrandchildren not implemented in this subclass:' + this.constructor;
};

/**
 * Gets a reference to this node's parent.
 * 
 * @method
 * @returns {ve.Node} Reference to this node's parent
 */
ve.Node.prototype.getParent = function() {
	return this.parent;
};

/**
 * Gets the root node in the tree this node is currently attached to.
 * 
 * @method
 * @returns {ve.Node} Root node
 */
ve.Node.prototype.getRoot = function() {
	return this.root;
};

/**
 * Sets the root node to this and all of its children.
 * 
 * This method is overridden by nodes with children.
 * 
 * @method
 * @param {ve.Node} root Node to use as root
 */
ve.Node.prototype.setRoot = function( root ) {
	// TODO events?
	this.root = root;
};

/**
 * Attaches this node to another as a child.
 * 
 * @method
 * @param {ve.Node} parent Node to attach to
 * @emits attach (parent)
 */
ve.Node.prototype.attach = function( parent ) {
	this.emit( 'beforeAttach', parent );
	this.parent = parent;
	this.setRoot( parent.getRoot() );
	this.emit( 'afterAttach', parent );
};

/**
 * Detaches this node from its parent.
 * 
 * @method
 * @emits detach
 */
ve.Node.prototype.detach = function() {
	this.emit( 'beforeDetach' );
	this.parent = null;
	this.setRoot( this );
	this.emit( 'afterDetach' );
};

/* Inheritance */

ve.extendClass( ve.Node, ve.EventEmitter );
