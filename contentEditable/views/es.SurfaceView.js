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

	this.model.getDocument().on( 'update', function() {
		_this.emit( 'update' );
	} );

	this.documentView.renderContent();
};

es.SurfaceView.prototype.onKeyDown = function( e ) {
	if ( e.which === 13 ) {
		e.preventDefault();
		var range = this.getSelection();
		if ( range.start === range.end ) {
			var tx = this.model.getDocument().prepareInsertion( range.start, [ { 'type': '/paragraph' }, { 'type': 'paragraph' } ]);
			this.model.transact( tx );
		}
	} else if ( e.which === 8 ) {
		console.log("A");
		e.preventDefault();
		var range = this.getSelection();
		if ( range.start != range.end ) {
			var tx = this.model.getDocument().prepareRemoval( range );
			this.model.transact( tx );
		}
	}
};

es.SurfaceView.prototype.getOffset = function( localNode, localOffset ) {
	var $node = $( localNode );
	while( !$node.hasClass( 'es-paragraphView' ) ) {
		$node = $node.parent();
	}
	
	var current = [$node.contents(), 0];
	var stack = [current];
	
	var offset = 0;
	
	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		var item = current[0][current[1]];
		var $item = current[0].eq( current[1] );
		
		if ( item.nodeType === 3 ) {
			if ( item === localNode ) {
				offset += localOffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $( item ).attr('contentEditable') === "false" ) {
				console.log("in");
				offset += 1;
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}

	return this.documentView.getOffsetFromNode( $node.data('view') ) + 1 + offset;
}

es.SurfaceView.prototype.getSelection = function() {
	var selection = rangy.getSelection();
	
	if ( selection.anchorNode === selection.focusNode && selection.anchorOffset === selection.focusOffset ) {
		// only one offset
		var offset = this.getOffset( selection.anchorNode, selection.anchorOffset );
		return new es.Range( offset, offset );
	} else {
		// two offsets
		var offset1 = this.getOffset( selection.anchorNode, selection.anchorOffset );
		var offset2 = this.getOffset( selection.focusNode, selection.focusOffset );
		return new es.Range( offset1, offset2 );
	}
};

/* Inheritance */

es.extendClass( es.SurfaceView, es.EventEmitter );