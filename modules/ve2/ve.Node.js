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
 * Checks if this node can have child nodes.
 * 
 * @method
 * @abstract
 * @returns {Boolean} Whether this node can have children
 */
ve.Node.prototype.canHaveChildren = function() {
	throw 've.Node.canHaveChildren not implemented in this subclass: ' + this.constructor;
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
	throw 've.Node.canHaveGrandchildren not implemented in this subclass: ' + this.constructor;
};

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

/* Inheritance */

ve.extendClass( ve.Node, ve.EventEmitter );
