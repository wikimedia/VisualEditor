/**
 * Creates an ve.ui.AnnotationButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param {Object} annotation
 */
ve.ui.AnnotationButtonTool = function( toolbar, name, title, data ) {
	// Inheritance
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.annotation = data.annotation;
	this.inspector = data.inspector;
	this.active = false;
};

/* Methods */

ve.ui.AnnotationButtonTool.prototype.onClick = function() {
	var surfaceView = this.toolbar.getSurfaceView(),
		surfaceModel = surfaceView.model,
		selection = surfaceModel.getSelection();

	if ( this.inspector ) {
		if( selection ) {
			surfaceView.contextView.openInspector( this.inspector );
		} else {
			if ( this.active ) {
				var documentModel = surfaceModel.getDocument(),
					range = documentModel.getAnnotatedRangeFromOffset(
						selection.from, this.annotation
					);
				surfaceModel.setSelection ( range );
				surfaceView.showSelection( range );
				surfaceView.contextView.openInspector( this.inspector );
			}
		}
	} else {
		surfaceModel.annotate( this.active ? 'clear' : 'set', this.annotation );
		surfaceView.showSelection( selection );
	}
};

ve.ui.AnnotationButtonTool.prototype.updateState = function( annotations, nodes ) {
	var matches = ve.dm.Document.getMatchingAnnotations(
		annotations, new RegExp( '^' + this.annotation.type + '$' )
	);
	if ( ve.isEmptyObject( matches ) ) {
		this.$.removeClass( 'es-toolbarButtonTool-down' );
		this.active = false;
	} else {
		this.$.addClass( 'es-toolbarButtonTool-down' );
		this.active = true;
	}
};

/* Registration */

ve.ui.Tool.tools.bold = {
	'constructor': ve.ui.AnnotationButtonTool,
	'name': 'bold',
	'title': mw.msg( 'visualeditor-annotationbutton-bold-tooltip' ),
	'data': {
		'annotation': { 'type': 'textStyle/bold' }
	}
};

ve.ui.Tool.tools.italic = {
	'constructor': ve.ui.AnnotationButtonTool,
	'name': 'italic',
	'title': mw.msg( 'visualeditor-annotationbutton-italic-tooltip' ),
	'data': {
		'annotation': { 'type': 'textStyle/italic' }
	}
};

ve.ui.Tool.tools.link = {
	'constructor': ve.ui.AnnotationButtonTool,
	'name': 'link',
	'title': mw.msg( 'visualeditor-annotationbutton-link-tooltip' ),
	'data': {
		'annotation': { 'type': 'link/wikiLink', 'data': { 'title': '' } },
		'inspector': 'link'
	}
};

/* Inheritance */

ve.extendClass( ve.ui.AnnotationButtonTool, ve.ui.ButtonTool );
