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
	this.annotation = data.annotation;
	this.inspector = data.inspector;
	this.active = false;
};

/* Methods */

es.AnnotationButtonTool.prototype.onClick = function() {
	var surfaceView = this.toolbar.getSurfaceView();
	if ( this.inspector ) {
		if ( !this.active && surfaceView.getModel().getSelection().getLength() ) {
				surfaceView.annotate( 'set', this.annotation );
		}
		this.toolbar.getSurfaceView().getContextView().openInspector( this.inspector );
	} else {
		surfaceView.annotate( this.active ? 'clear' : 'set', this.annotation );
	}
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
	'constructor': es.AnnotationButtonTool,
	'name': 'bold',
	'data': {
		'annotation': { 'type': 'textStyle/bold' }
	}
};

es.Tool.tools.italic = {
	'constructor': es.AnnotationButtonTool,
	'name': 'italic',
	'data': {
		'annotation': { 'type': 'textStyle/italic' }
	}
};

es.Tool.tools.link = {
	'constructor': es.AnnotationButtonTool,
	'name': 'link',
	'data': {
		'annotation': { 'type': 'link/internal', 'data': { 'title': '' } },
		'inspector': 'link'
	}
};

/* Inheritance */

es.extendClass( es.AnnotationButtonTool, es.ButtonTool );
