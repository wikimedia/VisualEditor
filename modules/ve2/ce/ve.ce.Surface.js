/**
 * ContentEditable surface.
 * 
 * @class
 * @constructor
 * @param model {ve.dm.Surface} Model to observe
 */
ve.ce.Surface = function( $container, model ) {
	// Properties
	this.surfaceModel = model;
	this.documentView = new ve.ce.Document( model.documentModel );
	$container.append(this.documentView.documentNode.$);
	this.documentView.documentNode.render();
};
