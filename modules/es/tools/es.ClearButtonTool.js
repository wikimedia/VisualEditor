es.ClearButtonTool = function( toolbar, name ) {
	es.ButtonTool.call( this, toolbar, name );
	this.$.addClass( 'es-toolbarButtonTool-disabled' );
};

es.ClearButtonTool.prototype.onClick = function() {
	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		'clear',
		/.*/
	);
	this.toolbar.surfaceView.model.transact( tx );
	this.toolbar.surfaceView.clearInsertionAnnotations();
};

es.ClearButtonTool.prototype.updateState = function( annotations ) {
	if ( annotations.length === 0 ) {
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