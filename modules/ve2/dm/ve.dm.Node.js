/**
 * Generic DataModel node.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.Node}
 * @param {String} type Symbolic name of node type 
 * @param {Integer} [length] Length of content data in document
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.Node = function( type, length, attributes ) {
	// Inheritance
	ve.Node.call( this, type );

	// Properties
	this.length = length || 0;
	this.attributes = attributes || {};
	this.doc = undefined;
};

/* Methods */

/**
 * Checks if this node can have child nodes.
 * 
 * @method
 * @returns {Boolean} Whether this node can have children
 */
ve.dm.Node.prototype.canHaveChildren = function() {
	return ve.dm.factory.canNodeHaveChildren( this.type );
};

/**
 * Checks if this node can have child nodes which can also have child nodes.
 * 
 * @method
 * @returns {Boolean} Whether this node can have grandchildren
 */
ve.dm.Node.prototype.canHaveGrandchildren = function() {
	return ve.dm.factory.canNodeHaveGrandchildren( this.type );
};

/**
 * Gets the inner length.
 * 
 * @method
 * @returns {Integer} Length of the node's contents
 */
ve.dm.Node.prototype.getLength = function() {
	return this.length;
};

/**
 * Gets the outer length, including any opening/closing elements.
 * 
 * The default implementation is getLength() + 2. Subclasses that do not use opening/closing
 * elements should override this.
 * 
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.dm.Node.prototype.getOuterLength = function() {
	return this.length + 2;
};

/**
 * Sets the inner length.
 * 
 * @method
 * @param {Integer} length Length of content
 * @throws Invalid content length error if length is less than 0
 * @emits lengthChange (diff)
 * @emits update
 */
ve.dm.Node.prototype.setLength = function( length ) {
	if ( length < 0 ) {
		throw 'Length cannot be negative';
	}
	// Compute length adjustment from old length
	var diff = length - this.length;
	// Set new length
	this.length = length;
	// Adjust the parent's length
	if ( this.parent ) {
		this.parent.adjustLength( diff );
	}
	// Emit events
	this.emit( 'lengthChange', diff );
	this.emit( 'update' );
};

/**
 * Adjust the length.
 * 
 * @method
 * @param {Integer} adjustment Amount to adjust length by
 * @throws Invalid adjustment error if resulting length is less than 0
 * @emits lengthChange (diff)
 * @emits update
 */
ve.dm.Node.prototype.adjustLength = function( adjustment ) {
	this.setLength( this.length + adjustment );
};

/**
 * Gets an element attribute value.
 * 
 * @method
 * @returns {Mixed} Value of attribute, or undefined if no such attribute exists
 */
ve.dm.Node.prototype.getAttribute = function( key ) {
	return this.attributes[key];
};

/**
 * Sets the root node this node is a descendent of.
 * 
 * This method is overridden by nodes with children.
 * 
 * @method
 * @param {ve.dm.Node} root Node to use as root
 */
ve.dm.Node.prototype.setRoot = function( root ) {
	// TODO events?
	this.root = root;
};

/**
 * Sets the document this node is a part of.
 * 
 * This method is overridden by nodes with children.
 * 
 * @method
 * @param {ve.dm.Document} root Node to use as root
 */
ve.dm.Node.prototype.setDocument = function( doc ) {
	// TODO events?
	this.doc = doc;
};

/**
 * Gets the document this node is a part of.
 * 
 * @method
 * @returns {ve.dm.Document} Document of this node
 */
ve.dm.Node.prototype.getDocument = function( root ) {
	return this.doc;
};

/**
 * Attaches this node to another as a child.
 * 
 * @method
 * @param {ve.Node} parent Node to attach to
 * @emits attach (parent)
 */
ve.dm.Node.prototype.attach = function( parent ) {
	this.parent = parent;
	this.setRoot( parent.getRoot() );
	this.setDocument( parent.getDocument() );
	this.emit( 'attach', parent );
};

/**
 * Detaches this node from its parent.
 * 
 * @method
 * @emits detach
 */
ve.dm.Node.prototype.detach = function() {
	this.parent = null;
	this.setRoot( this );
	this.setDocument();
	this.emit( 'detach' );
};

/* Inheritance */

ve.extendClass( ve.dm.Node, ve.Node );
