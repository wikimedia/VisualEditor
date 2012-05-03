/**
 * ContentEditable surface.
 *
 * @class
 * @constructor
 * @param model {ve.dm.Surface} Model to observe
 */
ve.ce.Surface = function( $container, model ) {
	// Inheritance
	ve.EventEmitter.call( this );
	// Properties
	this.model = model;
	this.documentView = new ve.ce.Document( model.documentModel );
	$container.append(this.documentView.documentNode.$);
	this.documentView.documentNode.render();
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );
