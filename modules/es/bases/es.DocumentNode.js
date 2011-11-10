/**
 * Creates an es.DocumentNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.EventEmitter}
 */
es.DocumentNode = function() {
	// Inheritance
	es.EventEmitter.call( this );

	// Reusable function for passing update events upstream
	var _this = this;
	this.emitUpdate = function() {
		_this.emit( 'update' );
	};
};

/* Methods */

/**
 * Gets the content length.
 * 
 * @method
 * @abstract
 * @returns {Integer} Length of content
 */
es.DocumentNode.prototype.getContentLength = function() {
	throw 'DocumentNode.getContentLength not implemented in this subclass:' + this.constructor;
};

/**
 * Gets the element length.
 * 
 * @method
 * @abstract
 * @returns {Integer} Length of content
 */
es.DocumentNode.prototype.getElementLength = function() {
	throw 'DocumentNode.getElementLength not implemented in this subclass:' + this.constructor;
};

/**
 * Checks if this node has child nodes.
 * 
 * @method
 * @abstract
 * @returns {Boolean} Whether this node has children
 */
es.DocumentNode.prototype.hasChildren = function() {
	throw 'DocumentNode.hasChildren not implemented in this subclass:' + this.constructor;
};

/* Inheritance */

es.extendClass( es.DocumentNode, es.EventEmitter );
