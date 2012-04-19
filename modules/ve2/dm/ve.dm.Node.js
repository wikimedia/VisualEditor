/**
 * Creates an ve.dm.Node object.
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
};

/* Abstract Methods */

/**
 * Creates a view for this node.
 * 
 * @abstract
 * @method
 * @returns {ve.ce.Node} New item view associated with this model
 */
ve.dm.Node.prototype.createView = function() {
	throw 'DocumentModelNode.createView not implemented in this subclass:' + this.constructor;
};

/* Methods */

/**
 * Gets the inner length.
 * 
 * @method
 * @returns {Integer} Length of the node's contents
 */
ve.Node.prototype.getLength = function() {
	return this.length;
};

/**
 * Gets the outer length, including any opening/closing elements.
 * 
 * The default implementation is the same as getLength(). Subclasses that use opening/closing
 * elements should override this.
 * 
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.Node.prototype.getOuterLength = function() {
	return this.length;
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
ve.Node.prototype.setLength = function( length ) {
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
ve.Node.prototype.adjustLength = function( adjustment ) {
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
