es.AnnotationButtonTool = function( toolbar, name, data ) {
	es.ButtonTool.call( this, toolbar, name );
	this.data = data;
};

es.AnnotationButtonTool.prototype.onClick = function() {
	var method;
	if ( this.$.hasClass( 'es-toolbarButtonTool-down' ) ) {
		method = 'clear';
		this.toolbar.surfaceView.removeInsertionAnnotation( this.data );
	} else {
		method = 'set';
		this.toolbar.surfaceView.addInsertionAnnotation( this.data );
	}

	var tx = this.toolbar.surfaceView.model.getDocument().prepareContentAnnotation(
		this.toolbar.surfaceView.currentSelection,
		method,
		this.data
	);
	this.toolbar.surfaceView.model.transact( tx );
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

es.Tool.tools.link = {
	constructor: es.AnnotationButtonTool,
	name: 'link',
	data: { 'type': 'link/internal', 'data': { 'title': '' } }
};


es.extendClass( es.AnnotationButtonTool, es.ButtonTool );