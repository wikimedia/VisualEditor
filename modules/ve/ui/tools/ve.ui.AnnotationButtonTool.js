/**
 * VisualEditor user interface AnnotationButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.AnnotationButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param title
 * @param {Object} data
 */
ve.ui.AnnotationButtonTool = function VeUiAnnotationButtonTool( toolbar, name, title, data ) {
	// Parent constructor
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.annotation = data.annotation;
	this.inspector = data.inspector;
	this.active = false;
};

/* Inheritance */

ve.inheritClass( ve.ui.AnnotationButtonTool, ve.ui.ButtonTool );

/* Methods */

ve.ui.AnnotationButtonTool.prototype.onClick = function () {
	var surfaceView = this.toolbar.getSurfaceView(),
		surfaceModel = surfaceView.model,
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection(),
		annotations,
		i;

	if ( this.inspector ) {
		if ( selection && selection.getLength() ) {
			surfaceView.contextView.openInspector( this.inspector );
		}
	} else {
		if ( this.active ) {
			// Get all annotations by type.
			if ( surfaceModel.getSelection().getLength() ) {
				annotations = documentModel
					.getAnnotationsFromRange( surfaceModel.getSelection() )
					.getAnnotationsByName( this.annotation )
					.get();
			} else {
				annotations = documentModel
					.insertAnnotations
					.getAnnotationsByName( this.annotation )
					.get();
			}

			// Clear each selected annotation.
			for( i = 0; i < annotations.length; i++ ) {
				surfaceModel.annotate( 'clear', annotations[i] );
			}
		} else {
			// Set annotation.
			surfaceModel.annotate( 'set',
				ve.dm.annotationFactory.create( this.annotation )
			);
		}
	}
};

ve.ui.AnnotationButtonTool.prototype.onUpdateState = function ( annotations ) {
	if ( annotations.hasAnnotationWithName( this.annotation ) ) {
		this.$.addClass( 've-ui-toolbarButtonTool-down' );
		this.active = true;
	} else {
		this.$.removeClass( 've-ui-toolbarButtonTool-down' );
		this.active = false;
	}
};

/* Registration */

ve.ui.Tool.tools.bold = {
	'constructor': ve.ui.AnnotationButtonTool,
	'name': 'bold',
	'title': ve.msg( 'visualeditor-annotationbutton-bold-tooltip' ),
	'data': {
		'annotation': 'textStyle/bold'
	}
};

ve.ui.Tool.tools.italic = {
	'constructor': ve.ui.AnnotationButtonTool,
	'name': 'italic',
	'title': ve.msg( 'visualeditor-annotationbutton-italic-tooltip' ),
	'data': {
		'annotation': 'textStyle/italic'
	}
};

ve.ui.Tool.tools.link = {
	'constructor': ve.ui.AnnotationButtonTool,
	'name': 'link',
	'title': ve.msg( 'visualeditor-annotationbutton-link-tooltip' ),
	'data': {
		'inspector': 'link'
	}
};
