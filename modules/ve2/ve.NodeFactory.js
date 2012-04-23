/**
 * Generic node factory.
 * 
 * @class
 * @constructor
 */
ve.NodeFactory = function() {
	this.registry = [];
};

/* Methods */

/**
 * Register a node type with the factory.
 * 
 * The constructor will be called as constructor( contents, attributes ), see createNode().
 * 
 * @param {String} type Node type
 * @param {Function} constructor Node constructor subclassing ve.Node
 */
ve.NodeFactory.prototype.register = function( type, constructor ) {
	if ( typeof constructor !== 'function' ) {
		throw 'Constructor must be a function, cannot be a ' + typeof constructor;
	}
	this.registry[type] = constructor;
};

/**
 * Create a node based on a type. type is used to look up the constructor to use, contents and
 * attributes are passed to the constructor.
 * 
 * @param {String} type Node type
 * @param {Array|Number} contents Either an array of child nodes (for non-leaf nodes)
 *                                or the length (for leaf nodes)
 * @param {Object} [attributes] Attribute key/value pairs
 * @returns {ve.Node|null} The node object, or null if type is not a registered node type.
 */
ve.NodeFactory.prototype.createNode = function( type, contents, attributes ) {
	if ( type in this.registry ) {
		return new this.registry[type]( contents, attributes );
	} else {
		return null;
	}
};
