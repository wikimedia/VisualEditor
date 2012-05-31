/**
 * DataModel node for a document.
 *
 * @class
 * @constructor
 * @extends {ve.dm.LeafNode}
 * @param {Integer} [length] Length of content data in document
 */
ve.dm.TextNode = function( length ) {
	// Inheritance
	ve.dm.LeafNode.call( this, 'text', length );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.TextNode.rules = {
	'isWrapped': false,
	'isContent': true,
	'canContainContent': false,
	'childNodeTypes': [],
	'parentNodeTypes': null
};

/* Registration */

ve.dm.nodeFactory.register( 'text', ve.dm.TextNode );

/* Inheritance */

ve.extendClass( ve.dm.TextNode, ve.dm.LeafNode );
