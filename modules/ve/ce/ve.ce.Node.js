/**
 * VisualEditor content editable Node class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

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
 * Gets a list of allowed child node types.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {String[]|null} List of node types allowed as children or null if any type is allowed
 */
ve.ce.Node.prototype.getChildNodeTypes = function() {
	return this.model.getChildNodeTypes();
};

/**
 * Gets a list of allowed parent node types.
 *
 * This method passes through to the model.
 *
 * @method
 * @returns {String[]|null} List of node types allowed as parents or null if any type is allowed
 */
ve.ce.Node.prototype.getParentNodeTypes = function() {
	return this.model.getParentNodeTypes();
};

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
 * Checks if this node can contain content.
 *
 * @method
 * @returns {Boolean} Node can contain content
 */
ve.ce.Node.prototype.canContainContent = function() {
	return this.model.canContainContent();
};

/**
 * Checks if this node is content.
 *
 * @method
 * @returns {Boolean} Node is content
 */
ve.ce.Node.prototype.isContent = function() {
	return this.model.isContent();
};

/**
 * Checks if this node can have a slug before or after it.
 *
 * @static
 * @method
 * @returns {Boolean} Node can have a slug
 */
ve.ce.Node.prototype.canHaveSlug = function() {
	return !this.canContainContent() && this.getParentNodeTypes() === null && this.type !== 'text';
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
	return ve.ce.nodeFactory.canNodeBeSplit( this.type );
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

ve.ce.Node.getSplitableNode = function( node ) {
	var splitableNode = null;
	
	ve.Node.traverseUpstream( node, function( node ) {
		if ( node.canBeSplit() ) {
			splitableNode = node;
			return true;
		} else {
			return false;
		}
	} );
	
	return splitableNode;
};

/* Inheritance */

ve.extendClass( ve.ce.Node, ve.Node );
