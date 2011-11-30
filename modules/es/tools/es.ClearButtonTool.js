es.ClearButtonTool = function( toolbar ) {
	es.ButtonTool.call( this, toolbar, 'clear' );
};

es.ClearButtonTool.prototype.updateState = function( selection, annotations ) {
};

es.ClearButtonTool.prototype.onClick = function() {
	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		'clear',
		/.*/
	);
	this.toolbar.surfaceView.model.transact( tx );
};

es.ToolbarView.tools.clear = es.ClearButtonTool;

es.extendClass( es.ClearButtonTool, es.ButtonTool );