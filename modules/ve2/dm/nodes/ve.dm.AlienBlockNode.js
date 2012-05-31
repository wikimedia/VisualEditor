/**
 * DataModel node for an alien block node.
 *
 * @class
 * @constructor
 * @extends {ve.dm.LeafNode}
 * @param {Integer} [length] Length of content data in document
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.AlienBlock = function( length, attributes ) {
	// Inheritance
	ve.dm.LeafNode.call( this, 'alienBlock', 0, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.AlienBlock.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': [],
	'parentNodeTypes': null
};

/* Registration */

ve.dm.nodeFactory.register( 'alienBlock', ve.dm.AlienBlock );

/* Inheritance */

ve.extendClass( ve.dm.AlienBlock, ve.dm.LeafNode );
