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
