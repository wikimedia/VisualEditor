/**
 * DataModel node for a document.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.DocumentNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'document', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.DocumentNode.rules = {
	'isWrapped': false,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': null,
	'parentNodeTypes': []
};

/* Registration */

ve.dm.nodeFactory.register( 'document', ve.dm.DocumentNode );

/* Inheritance */

ve.extendClass( ve.dm.DocumentNode, ve.dm.BranchNode );
