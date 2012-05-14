/**
 * ContentEditable document.
 *
 * @class
 * @extends {ve.Document}
 * @constructor
 * @param model {ve.dm.Document} Model to observe
 */
ve.ce.Document = function( model ) {
	// Inheritance
	ve.Document.call( this, new ve.ce.DocumentNode( model.getDocumentNode() ) );

	// Properties
	this.model = model;
};

/* Inheritance */

ve.extendClass( ve.ce.Document, ve.Document );
