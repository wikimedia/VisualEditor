/**
 * ContentEditable document.
 * 
 * @class
 * @constructor
 * @param model {ve.dm.Document} Model to observe
 */
ve.ce.Document = function( model ) {
	// Properties
	this.documentModel = model;
	this.documentNode = new ve.ce.DocumentNode( model.getDocumentNode() );
};
