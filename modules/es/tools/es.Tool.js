es.Tool = function( toolbar ) {
	this.$ = $( '<div>' );
	if ( !toolbar ) {
		return;
	}
	var _this = this;
	this.toolbar = toolbar;
	this.toolbar.on( 'update', function( param ) {
		var selection = _this.toolbar.surfaceView.currentSelection;
		var annotations;

		if( selection.from === selection.to ) {
			annotations = _this.toolbar.surfaceView.documentView.model.getAnnotationsFromOffset(
				selection.to
			);
		} else {
			annotations = _this.toolbar.surfaceView.documentView.model.getAnnotationsFromRange(
				selection
			);
		}

		_this.updateState( selection, annotations );
	} );
};

es.Tool.prototype.updateState = function() {
};
