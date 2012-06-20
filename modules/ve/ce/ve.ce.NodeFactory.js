/**
 * ContentEditable node factory.
 *
 * @class
 * @extends {ve.Factory}
 * @constructor
 */
ve.ce.NodeFactory = function() {
	// Inheritance
	ve.Factory.call( this );
};

/* Methods */

/**
 * Checks if a given node type can be split.
 *
 * @param {String} type Node type
 * @returns {Boolean} The node can have grandchildren
 * @throws 'Unknown node type'
 */
ve.ce.NodeFactory.prototype.canNodeBeSplit = function( type ) {
	if ( type in this.registry ) {
		return this.registry[type].rules.canBeSplit;
	}
	throw 'Unknown node type: ' + type;
};

/* Inheritance */

ve.extendClass( ve.ce.NodeFactory, ve.Factory );

/* Initialization */

ve.ce.nodeFactory = new ve.ce.NodeFactory();
