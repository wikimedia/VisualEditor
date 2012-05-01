/**
 * ContentEditable node for a document.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.AlienNode} Model to observe
 */
ve.ce.AlienNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, model );
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.AlienNode.rules = {
	'canHaveChildren': false,
	'canHaveGrandchildren': false,
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'alien', ve.ce.AlienNode );

/* Inheritance */

ve.extendClass( ve.ce.AlienNode, ve.ce.LeafNode );
