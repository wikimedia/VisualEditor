/**
 * Creates an ve.ce.ParagraphNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.ParagraphNode} model Paragraph model to view
 */
ve.ce.ParagraphNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, model, $( '<p></p>' ) );

	// DOM Changes
	this.$.addClass( 'es-paragraphView' );
};

/* Registration */

ve.ce.DocumentNode.splitRules.paragraph = {
	'self': true,
	'children': null
};

/* Inheritance */

ve.extendClass( ve.ce.ParagraphNode, ve.ce.LeafNode );
