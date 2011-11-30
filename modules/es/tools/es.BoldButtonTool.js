es.BoldButtonTool = function( toolbar ) {
	es.ButtonTool.call( this, toolbar, 'bold' );
};

es.BoldButtonTool.prototype.updateState = function( selection, annotations ) {
	for ( var i = 0; i < annotations.length; i++ ) {
		if ( annotations[i].type === 'textStyle/bold' ) {
			this.$.addClass( 'es-toolbarButtonTool-down' );
			return;
		}
	}
	this.$.removeClass( 'es-toolbarButtonTool-down' );
};

es.BoldButtonTool.prototype.onClick = function() {
	var method = this.$.hasClass( 'es-toolbarButtonTool-down' ) ? 'clear' : 'set';
	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		method,
		{ 'type': 'textStyle/bold' }
	);
	this.toolbar.surfaceView.model.transact( tx );
};

es.ToolbarView.tools.bold = es.BoldButtonTool;

es.extendClass( es.BoldButtonTool, es.ButtonTool );