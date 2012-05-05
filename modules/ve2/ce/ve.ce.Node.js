/**
 * Generic ContentEditable node.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.Node}
 * @param {String} type Symbolic name of node type
 * @param {ve.dm.Node} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.Node = function( type, model, $element ) {
	// Inheritance
	ve.Node.call( this, type );

	// Properties
	this.model = model;
	this.$ = $element || $( '<div></div>' );
	this.parent = null;
};

/* Methods */

/**
 * Checks if this node can have child nodes.
 * 
 * @method
 * @returns {Boolean} Whether this node can have children
 */
ve.ce.Node.prototype.canHaveChildren = function() {
	return ve.ce.factory.canNodeHaveChildren( this.type );
};

/**
 * Checks if this node can have child nodes which can also have child nodes.
 * 
 * @method
 * @returns {Boolean} Whether this node can have grandchildren
 */
ve.ce.Node.prototype.canHaveGrandchildren = function() {
	return ve.ce.factory.canNodeHaveGrandchildren( this.type );
};

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
