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

	this.$.data( 'node', this );
};

/* Methods */

/**
 * Checks if model is for a node that can have children.
 * 
 * This method passes through to the model.
 * 
 * @method
 * @returns {Boolean} Model node can have children
 */
ve.ce.Node.prototype.canHaveChildren = function() {
	return this.model.canHaveChildren();
};

/**
 * Checks if model is for a node that can have grandchildren.
 * 
 * This method passes through to the model.
 * 
 * @method
 * @returns {Boolean} Model node can have grandchildren
 */
ve.ce.Node.prototype.canHaveGrandchildren = function() {
	return this.model.canHaveGrandchildren();
};

/**
 * Checks if model is for a wrapped element.
 * 
 * This method passes through to the model.
 * 
 * @method
 * @returns {Boolean} Model node is a wrapped element
 */
ve.ce.Node.prototype.isWrapped = function() {
	return this.model.isWrapped();
};

/**
 * Gets model length.
 * 
 * This method passes through to the model.
 * 
 * @method
 * @returns {Integer} Model length
 */
ve.ce.Node.prototype.getLength = function() {
	return this.model.getLength();
};

/**
 * Gets model outer length.
 * 
 * This method passes through to the model.
 * 
 * @method
 * @returns {Integer} Model outer length
 */
ve.ce.Node.prototype.getOuterLength = function() {
	return this.model.getOuterLength();
};

/**
 * Checks if this node can be split.
 * 
 * @method
 * @returns {Boolean} Node can be split
 */
ve.ce.Node.prototype.canBeSplit = function() {
	return ve.ce.factory.canBeSplit( this.type );
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
