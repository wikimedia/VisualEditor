/**
 * Creates an ve.ce.PreNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.PreNode} model Pre model to view
 */
ve.ce.PreNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, model, undefined, { 'pre': true } );

	// DOM Changes
	this.$.addClass( 'es-preView' );
};

/* Registration */

ve.ce.DocumentNode.splitRules.pre = {
	'self': true,
	'children': null
};

/* Inheritance */

ve.extendClass( ve.ce.PreNode, ve.ce.LeafNode );
