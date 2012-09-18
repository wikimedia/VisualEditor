/**
 * VisualEditor user interface ClearButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ClearButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param title
 */
ve.ui.ClearButtonTool = function VeUiClearButtonTool( toolbar, name, title ) {
	// Parent constructor
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.$.addClass( 've-ui-toolbarButtonTool-disabled' );
	this.pattern = /^(textStyle|link)\//;
};

/* Inheritance */

ve.inheritClass( ve.ui.ClearButtonTool, ve.ui.ButtonTool );

/* Methods */

ve.ui.ClearButtonTool.prototype.getAnnotations = function () {
	var surface = this.toolbar.getSurfaceView(),
		model = surface.getModel();
	return model.getDocument().getAnnotationsFromRange( model.getSelection(), true );
};

ve.ui.ClearButtonTool.prototype.onClick = function () {
	var i,
		surfaceView = this.toolbar.getSurfaceView(),
		model = surfaceView.getModel(),
		annotations = this.getAnnotations(),
		arr = annotations.get();
	for ( i = 0; i < arr.length; i++ ) {
		model.annotate( 'clear', arr[i] );
	}
	surfaceView.showSelection( model.getSelection() );
	surfaceView.contextView.closeInspector();
};

ve.ui.ClearButtonTool.prototype.onUpdateState = function ( annotations ) {
	if ( annotations.isEmpty() ) {
		this.$.addClass( 've-ui-toolbarButtonTool-disabled' );
	} else {
		this.$.removeClass( 've-ui-toolbarButtonTool-disabled' );
	}
};

/* Registration */

ve.ui.Tool.tools.clear = {
	'constructor': ve.ui.ClearButtonTool,
	'name': 'clear',
	'title': ve.msg( 'visualeditor-clearbutton-tooltip' )
};
