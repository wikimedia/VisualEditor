/**
 * Creates an es.AnnotationButtonTool object.
 * 
 * @class
 * @constructor
 * @extends {es.ButtonTool}
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 * @param {Object} annotation
 */
es.AnnotationButtonTool = function( toolbar, name, data ) {
	// Inheritance
	es.ButtonTool.call( this, toolbar, name );

	// Properties
	this.annotation = data;
	this.active = false;
};

/* Methods */

es.AnnotationButtonTool.prototype.onClick = function() {
	this.toolbar.getSurfaceView().annotate( this.active ? 'clear' : 'set', this.annotation );
};

es.AnnotationButtonTool.prototype.updateState = function( annotations, nodes ) {
	if ( es.DocumentModel.getIndexOfAnnotation( annotations.full, this.annotation, true ) !== -1 ) {
		this.$.addClass( 'es-toolbarButtonTool-down' );
		this.active = true;
		return;
	}
	this.$.removeClass( 'es-toolbarButtonTool-down' );
	this.active = false;
};

/* Registration */

es.Tool.tools.bold = {
	constructor: es.AnnotationButtonTool,
	name: 'bold',
	data: { 'type': 'textStyle/bold' }
};

es.Tool.tools.italic = {
	constructor: es.AnnotationButtonTool,
	name: 'italic',
	data: { 'type': 'textStyle/italic' }
};

es.Tool.tools.link = {
	constructor: es.AnnotationButtonTool,
	name: 'link',
	data: { 'type': 'link/internal', 'data': { 'title': '' } }
};

/* Inheritance */

es.extendClass( es.AnnotationButtonTool, es.ButtonTool );
