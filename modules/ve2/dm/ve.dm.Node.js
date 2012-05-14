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
 * @returns {Boolean} Node can have children
 */
ve.dm.Node.prototype.canHaveChildren = function() {
	return ve.dm.factory.canNodeHaveChildren( this.type );
};

/**
 * Checks if this node can have child nodes which can also have child nodes.
 *
 * @method
 * @returns {Boolean} Node can have grandchildren
 */
ve.dm.Node.prototype.canHaveGrandchildren = function() {
	return ve.dm.factory.canNodeHaveGrandchildren( this.type );
};

/**
 * Checks if this node represents a wrapped element in the linear model.
 *
 * @method
 * @returns {Boolean} Node represents a wrapped element
 */
ve.dm.Node.prototype.isWrapped = function() {
	return ve.dm.factory.isNodeWrapped( this.type );
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
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.dm.Node.prototype.getOuterLength = function() {
	return this.length + ( this.isWrapped() ? 2 : 0 );
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

/* Inheritance */

ve.extendClass( ve.dm.Node, ve.Node );
