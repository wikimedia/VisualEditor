/**
 * Creates an es.DocumentViewNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.DocumentNode}
 * @param {es.DocumentModelNode} model Model to observe
 * @param {jQuery} [$element=$( '<div></div>' )] Element to use as a container
 */
es.DocumentViewNode = function( model, $element ) {
	// Inheritance
	es.DocumentNode.call( this );
	
	// Properties
	this.model = model;
	this.parent = null;
	this.$ = $element || $( '<div/>' );
};

/* Methods */

/**
 * Gets the length of the element in the model.
 * 
 * @method
 * @see {es.DocumentNode.prototype.getElementLength}
 * @returns {Integer} Length of content
 */
es.DocumentViewNode.prototype.getElementLength = function() {
	return this.model.getElementLength();
};

/**
 * Gets the length of the content in the model.
 * 
 * @method
 * @see {es.DocumentNode.prototype.getContentLength}
 * @returns {Integer} Length of content
 */
es.DocumentViewNode.prototype.getContentLength = function() {
	return this.model.getContentLength();
};

/**
 * Attaches node as a child to another node.
 * 
 * @method
 * @param {es.DocumentViewNode} parent Node to attach to
 * @emits attach (parent)
 */
es.DocumentViewNode.prototype.attach = function( parent ) {
	this.parent = parent;
	this.emit( 'attach', parent );
};

/**
 * Detaches node from it's parent.
 * 
 * @method
 * @emits detach (parent)
 */
es.DocumentViewNode.prototype.detach = function() {
	var parent = this.parent;
	this.parent = null;
	this.emit( 'detach', parent );
};

/**
 * Gets a reference to this node's parent.
 * 
 * @method
 * @returns {es.DocumentViewNode} Reference to this node's parent
 */
es.DocumentViewNode.prototype.getParent = function() {
	return this.parent;
};

/**
 * Gets a reference to the model this node observes.
 * 
 * @method
 * @returns {es.DocumentModelNode} Reference to the model this node observes
 */
es.DocumentViewNode.prototype.getModel = function() {
	return this.model;
};

es.DocumentViewNode.getSplitableNode = function( node ) {
	var splitableNode = null;

	es.DocumentNode.traverseUpstream( node, function( node ) {
		var elementType = node.model.getElementType();
		if ( splitableNode != null && es.DocumentView.splitRules[ elementType ].children === true ) {
			return false;
		}
		splitableNode = es.DocumentView.splitRules[ elementType ].self ? node : null
	} );
	return splitableNode;
};

/* Inheritance */

es.extendClass( es.DocumentViewNode, es.DocumentNode );
