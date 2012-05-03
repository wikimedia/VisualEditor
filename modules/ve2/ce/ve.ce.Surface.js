/**
 * ContentEditable surface.
 * 
 * @class
 * @constructor
 * @param model {ve.dm.Surface} Model to observe
 */
ve.ce.Surface = function( model ) {
	// Properties
	this.surfaceModel = model;
	this.documentView = new ve.ce.Document( model.getDocument() );
};
