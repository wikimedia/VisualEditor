/**
 * Generic ContentEditable node.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.Node}
 * @param {ve.dm.Node} model Model to observe
 */
ve.ce.Node = function( model ) {
	// Inheritance
	ve.Node.call( this );

	// Properties
	this.model = model;
	this.parent = null;
};

/* Methods */

/**
 * Gets a reference to the model this node observes.
 * 
 * @method
 * @returns {ve.dm.Node} Reference to the model this node observes
 */
ve.ce.Node.prototype.getModel = function() {
	return this.model;
};

/**
 * Gets a reference to this node's parent.
 * 
 * @method
 * @returns {ve.ce.Node} Reference to this node's parent
 */
ve.ce.Node.prototype.getParent = function() {
	return this.parent;
};

/**
 * Attaches node as a child to another node.
 * 
 * @method
 * @param {ve.ce.Node} parent Node to attach to
 * @emits attach (parent)
 */
ve.ce.Node.prototype.attach = function( parent ) {
	this.parent = parent;
	this.emit( 'attach', parent );
};

/**
 * Detaches node from it's parent.
 * 
 * @method
 * @emits detach (parent)
 */
ve.ce.Node.prototype.detach = function() {
	var parent = this.parent;
	this.parent = null;
	this.emit( 'detach', parent );
};

/* Inheritance */

ve.extendClass( ve.ce.Node, ve.Node );
