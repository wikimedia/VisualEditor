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

ve.ui.ClearButtonTool.prototype.getAnnotation = function(){
	var surfaceView = this.toolbar.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		documentModel = surfaceModel.getDocument(),
		data = documentModel.getData( surfaceModel.getSelection() );

	if ( data.length ) {
		if ( ve.isPlainObject( data[0][1] ) ) {
			var annotation = ve.dm.Document.getMatchingAnnotation( data[0][1], this.pattern );
			if ( ve.isPlainObject( annotation ) ) {
				return annotation;
			}
		}
	}
	return ;
};

ve.ui.ClearButtonTool.prototype.onClick = function() {
	var surfaceView = this.toolbar.getSurfaceView(),
		model = surfaceView.getModel();

	model.annotate( 'clear', this.getAnnotation() );
	surfaceView.showSelection( model.getSelection() );
	surfaceView.contextView.closeInspector();
};

ve.ui.ClearButtonTool.prototype.updateState = function( annotations ) {
	var matchingAnnotations = ve.dm.Document.getMatchingAnnotations(
		annotations, this.pattern
	);

	if ( ve.isEmptyObject( matchingAnnotations ) ) {
		this.$.addClass( 'es-toolbarButtonTool-disabled' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-disabled' );
	}
};

/* Registration */

ve.ui.Tool.tools.clear = {
	'constructor': ve.ui.ClearButtonTool,
	'name': 'clear',
	'title': 'Clear formatting'
};

/* Inheritance */

ve.extendClass( ve.ui.ClearButtonTool, ve.ui.ButtonTool );
