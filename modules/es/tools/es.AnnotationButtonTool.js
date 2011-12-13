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
es.AnnotationButtonTool = function( toolbar, name, title, data ) {
	// Inheritance
	es.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.annotation = data.annotation;
	this.inspector = data.inspector;
	this.active = false;
};

/* Methods */

es.AnnotationButtonTool.prototype.onClick = function() {
	var surfaceView = this.toolbar.getSurfaceView();
	if ( this.inspector ) {
		if ( surfaceView.getModel().getSelection().getLength() ) {
			this.toolbar.getSurfaceView().getContextView().openInspector( this.inspector );
		} else {
			if ( this.active ) {
				var surfaceModel = surfaceView.getModel(),
					documentModel = surfaceModel.getDocument(),
					selection = surfaceModel.getSelection(),
					range = documentModel.getAnnotationBoundaries( selection.from, this.annotation, true );
				surfaceModel.select( range );
				this.toolbar.getSurfaceView().getContextView().openInspector( this.inspector );
			}
		}
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
	'title': 'Bold (ctrl/cmd + B)',
	'data': {
		'annotation': { 'type': 'textStyle/bold' }
	}
};

es.Tool.tools.italic = {
	'constructor': es.AnnotationButtonTool,
	'name': 'italic',
	'title': 'Italic (ctrl/cmd + I)',
	'data': {
		'annotation': { 'type': 'textStyle/italic' }
	}
};

es.Tool.tools.link = {
	'constructor': es.AnnotationButtonTool,
	'name': 'link',
	'title': 'Link (ctrl/cmd + K)',
	'data': {
		'annotation': { 'type': 'link/internal', 'data': { 'title': '' } },
		'inspector': 'link'
	}
};

/* Inheritance */

es.extendClass( es.AnnotationButtonTool, es.ButtonTool );
