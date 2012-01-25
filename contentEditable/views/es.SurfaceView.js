es.SurfaceView = function( $container, model ) {
	// Inheritance
	es.EventEmitter.call( this );

	// References for use in closures
	var	_this = this;
		
	// Properties
	this.model = model;
	this.documentView = new es.DocumentView( this.model.getDocument(), this );
	this.$ = $container.append( this.documentView.$ );
	
	this.$.keydown( function(e) {
		return _this.onKeyDown( e );
	} );
	
	this.documentView.renderContent();
};

es.SurfaceView.prototype.onKeyDown = function( e ) {
	if ( e.which == 13 ) {
		e.preventDefault();
		
		console.log(this.getSelection());
	}
};

es.SurfaceView.prototype.getSelection = function() {
	var selection = rangy.getSelection();
	
	var node = selection.anchorNode;
	var $node = $( node );
	while( !$node.hasClass( 'es-paragraphView' ) ) {
		$node = $node.parent();
	}
	var $contents = $node.contents();
	for( var i = 0; i < $contents.length; i++ ) {
		if ( $contents[i] == node ) {
			console.log(node);
		}
	}
	
	return 0;
};

/* Inheritance */

es.extendClass( es.SurfaceView, es.EventEmitter );