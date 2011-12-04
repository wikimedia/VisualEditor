es.ClearButtonTool = function( toolbar, name ) {
	es.ButtonTool.call( this, toolbar, name );
	this.$.addClass( 'es-toolbarButtonTool-disabled' );
	this.pattern = /(textStyle\/|link\/).*/;
};

es.ClearButtonTool.prototype.onClick = function() {
	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		'clear',
		this.pattern
	);
	this.toolbar.surfaceView.model.transact( tx );
	this.toolbar.surfaceView.clearInsertionAnnotations();
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

es.Tool.tools.clear = {
	constructor: es.ClearButtonTool,
	name: 'clear'
};

es.extendClass( es.ClearButtonTool, es.ButtonTool );