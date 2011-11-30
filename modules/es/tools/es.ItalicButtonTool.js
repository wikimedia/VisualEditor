es.ItalicButtonTool = function( toolbar ) {
	es.ButtonTool.call( this, toolbar, 'italic' );
};

es.ItalicButtonTool.prototype.updateState = function( selection, annotations ) {
	for ( var i = 0; i < annotations.length; i++ ) {
		if ( annotations[i].type === 'textStyle/italic' ) {
			this.$.addClass( 'es-toolbarTool-down' );
			return;
		}
	}
	this.$.removeClass( 'es-toolbarTool-down' );
};

es.ItalicButtonTool.prototype.onClick = function() {
	var method = this.$.hasClass( 'es-toolbarTool-down' ) ? 'clear' : 'set';
	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		method,
		{ 'type': 'textStyle/italic' }
	);
	this.toolbar.surfaceView.model.transact( tx );
};

es.ToolbarView.tools.italic = es.ItalicButtonTool;

es.extendClass( es.ItalicButtonTool, es.ButtonTool );