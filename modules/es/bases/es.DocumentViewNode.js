/**
 * Creates an es.DocumentViewNode object.
 * 
 * es.DocumentViewNode extends native JavaScript Array objects, without changing Array.prototype by
 * dynamically extending an array literal with the methods of es.DocumentViewNode.
 * 
 * View nodes follow the operations performed on model nodes and keep elements in the DOM in sync.
 * 
 * Child objects must extend es.DocumentViewNode.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.EventEmitter}
 * @param model {es.ModelNode} Model to observe
 * @param {jQuery} [$element=New DIV element] Element to use as a container
 * @property {es.ModelItem} model Model being observed
 * @property {jQuery} $ Container element
 */
es.DocumentViewNode = function( model, $element ) {
	// Inheritance
	es.EventEmitter.call( this );
	
	// Properties
	this.model = model;
	this.$ = $element || $( '<div/>' );

	// Reusable function for passing update events upstream
	var _this = this;
	this.emitUpdate = function() {
		_this.emit( 'update' );
	};
};

/**
 * Gets a reference to the model this node observes.
 * 
 * @method
 * @returns {es.ModelNode} Reference to the model this node observes
 */
es.DocumentViewNode.prototype.getModel = function() {
	return this.model;
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
 * Gets the length of the element in the model.
 * 
 * @method
 * @returns {Integer} Length of content
 */
es.DocumentViewNode.prototype.getElementLength = function() {
	return this.model.getElementLength();
};

/**
 * Gets the length of the content in the model.
 * 
 * @method
 * @returns {Integer} Length of content
 */
es.DocumentViewNode.prototype.getContentLength = function() {
	return this.model.getContentLength();
};

/* Inheritance */

es.extendClass( es.DocumentViewNode, es.EventEmitter );
