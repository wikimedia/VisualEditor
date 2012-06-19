/**
 * Creates an ve.ui.ClearButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
ve.ui.ClearButtonTool = function( toolbar, name, title ) {
	// Inheritance
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.$.addClass( 'es-toolbarButtonTool-disabled' );
	this.pattern = /(textStyle\/|link\/).*/;
};

/* Methods */

ve.ui.ClearButtonTool.prototype.getAnnotations = function(){
	var surface = this.toolbar.getSurfaceView(),
		model = surface.getModel();
	return model.getDocument().getAnnotationsFromRange( model.getSelection(), true );
};

ve.ui.ClearButtonTool.prototype.onClick = function() {
	var surfaceView = this.toolbar.getSurfaceView(),
		model = surfaceView.getModel(),
		annotations = this.getAnnotations();
	for ( var hash in annotations ) {
		model.annotate( 'clear', annotations[hash] );
	}
	surfaceView.showSelection( model.getSelection() );
	surfaceView.contextView.closeInspector();
};

ve.ui.ClearButtonTool.prototype.updateState = function( annotations ) {
	var allAnnotations = this.getAnnotations();

	if ( ve.isEmptyObject( allAnnotations ) ) {
		this.$.addClass( 'es-toolbarButtonTool-disabled' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-disabled' );
	}
};

/* Registration */

ve.ui.Tool.tools.clear = {
	'constructor': ve.ui.ClearButtonTool,
	'name': 'clear',
	'title': mw.msg( 'visualeditor-clearbutton-tooltip' )
};

/* Inheritance */

ve.extendClass( ve.ui.ClearButtonTool, ve.ui.ButtonTool );
