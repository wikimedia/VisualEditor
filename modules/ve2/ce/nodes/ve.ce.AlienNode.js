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
	ve.ce.LeafNode.call( this, 'alien', model );
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.AlienNode.rules = {
	'canBeSplit': false
};

/* Registration */

ve.ce.factory.register( 'alien', ve.ce.AlienNode );

/* Inheritance */

ve.extendClass( ve.ce.AlienNode, ve.ce.LeafNode );
