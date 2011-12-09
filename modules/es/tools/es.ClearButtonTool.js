/**
 * Creates an es.ClearButtonTool object.
 * 
 * @class
 * @constructor
 * @extends {es.ButtonTool}
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 */
es.ClearButtonTool = function( toolbar, name, title ) {
	// Inheritance
	es.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.$.addClass( 'es-toolbarButtonTool-disabled' );
	this.pattern = /(textStyle\/|link\/).*/;
};

/* Methods */

es.ClearButtonTool.prototype.onClick = function() {
	var surfaceView = this.toolbar.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		tx =surfaceModel.getDocument().prepareContentAnnotation(
			surfaceView.currentSelection,
			'clear',
			this.pattern
		);
	surfaceModel.transact( tx );
	surfaceView.clearInsertionAnnotations();
	surfaceView.getContextView().closeInspector();
};

es.ClearButtonTool.prototype.updateState = function( annotations ) {
	var matchingAnnotations = es.DocumentModel.getMatchingAnnotations(
		annotations.all, this.pattern
	);
	if ( matchingAnnotations.length === 0 ) {
		this.$.addClass( 'es-toolbarButtonTool-disabled' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-disabled' );
	}
};

/* Registration */

es.Tool.tools.clear = {
	'constructor': es.ClearButtonTool,
	'name': 'clear',
	'title': 'Clear formatting'
};

/* Inheritance */

es.extendClass( es.ClearButtonTool, es.ButtonTool );