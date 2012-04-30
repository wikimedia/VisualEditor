/**
 * DataModel node factory.
 * 
 * @class
 * @extends {ve.NodeFactory}
 * @constructor
 */
ve.dm.NodeFactory = function() {
	// Inheritance
	ve.NodeFactory.call( this );
};

/* Methods */

/**
 * Gets a list of allowed child node types for a given node.
 * 
 * @param {String} type Node type
 * @returns {String[]|null} List of node types allowed as children or null if any type is allowed
 * @throws 'Unknown node type'
 */
ve.dm.NodeFactory.prototype.getChildNodeTypes = function( type ) {
	if ( type in this.registry ) {
		return this.registry[type].rules.childNodeTypes;
	}
	throw 'Unknown node type: ' + type;
};

/**
 * Gets a list of allowed parent node types for a given node.
 * 
 * @param {String} type Node type
 * @returns {String[]|null} List of node types allowed as parents or null if any type is allowed
 * @throws 'Unknown node type'
 */
ve.dm.NodeFactory.prototype.getParentNodeTypes = function( type ) {
	if ( type in this.registry ) {
		return this.registry[type].rules.parentNodeTypes;
	}
	throw 'Unknown node type: ' + type;
};

/* Inheritance */

ve.extendClass( ve.dm.NodeFactory, ve.NodeFactory );

/* Initialization */

ve.dm.factory = new ve.dm.NodeFactory();
