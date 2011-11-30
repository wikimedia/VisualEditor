es.ClearButtonTool = function( toolbar ) {
	es.ButtonTool.call( this, toolbar, 'clear' );
};

es.ClearButtonTool.prototype.updateState = function( selection, annotations ) {
};

es.ClearButtonTool.prototype.onClick = function() {
};

es.ToolbarView.tools.clear = es.ClearButtonTool;

es.extendClass( es.ClearButtonTool, es.ButtonTool );