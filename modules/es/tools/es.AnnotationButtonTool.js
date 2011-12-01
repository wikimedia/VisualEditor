es.AnnotationButtonTool = function( toolbar, name, data ) {
	es.ButtonTool.call( this, toolbar, name );
	this.data = data;
};

es.AnnotationButtonTool.prototype.onClick = function() {
	var method = this.$.hasClass( 'es-toolbarButtonTool-down' ) ? 'clear' : 'set';

	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		method,
		this.data
	);
	this.toolbar.surfaceView.model.transact( tx );
	return false;
};

es.AnnotationButtonTool.prototype.updateState = function( annotations ) {
	for ( var i = 0; i < annotations.length; i++ ) {
		if ( annotations[i].type === this.data.type ) {
			this.$.addClass( 'es-toolbarButtonTool-down' );
			return;
		}
	}
	this.$.removeClass( 'es-toolbarButtonTool-down' );
};

es.Tool.tools.bold = {
	constructor: es.AnnotationButtonTool,
	name: 'bold',
	data: { 'type': 'textStyle/bold' }
};

es.Tool.tools.italic = {
	constructor: es.AnnotationButtonTool,
	name: 'italic',
	data: { 'type': 'textStyle/italic' }
};


es.extendClass( es.AnnotationButtonTool, es.ButtonTool );