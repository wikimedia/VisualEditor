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
es.AnnotationButtonTool = function( toolbar, name, annotation ) {
	// Inheritance
	es.ButtonTool.call( this, toolbar, name );

	// Properties
	this.annotation = annotation;
};

/* Methods */

es.AnnotationButtonTool.prototype.onClick = function() {
	var method;
	if ( this.$.hasClass( 'es-toolbarButtonTool-down' ) ) {
		method = 'clear';
		this.toolbar.surfaceView.removeInsertionAnnotation( this.annotation );
	} else {
		method = 'set';
		this.toolbar.surfaceView.addInsertionAnnotation( this.annotation );
	}

	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		method,
		this.annotation
	);
	this.toolbar.surfaceView.model.transact( tx );
};

es.AnnotationButtonTool.prototype.updateState = function( annotations ) {
	for ( var i = 0; i < annotations.full.length; i++ ) {
		if ( annotations.full[i].type === this.annotation.type ) {
			this.$.addClass( 'es-toolbarButtonTool-down' );
			return;
		}
	}
	this.$.removeClass( 'es-toolbarButtonTool-down' );
};

/* Registration */

es.Tool.tools.bold = {
	constructor: es.AnnotationButtonTool,
	name: 'bold',
	annotation: { 'type': 'textStyle/bold' }
};

es.Tool.tools.italic = {
	constructor: es.AnnotationButtonTool,
	name: 'italic',
	annotation: { 'type': 'textStyle/italic' }
};

es.Tool.tools.link = {
	constructor: es.AnnotationButtonTool,
	name: 'link',
	annotation: { 'type': 'link/internal', 'data': { 'title': '' } }
};

/* Inheritance */

es.extendClass( es.AnnotationButtonTool, es.ButtonTool );
