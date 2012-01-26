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
	if ( e.which == 13 ) {
		e.preventDefault();
		var range = this.getSelection();
		if ( range.start === range.end ) {
			var tx = this.model.getDocument().prepareInsertion( range.start, [ { 'type': '/paragraph' }, { 'type': 'paragraph' } ]);
			this.model.transact( tx );
		}
	}
};

es.SurfaceView.prototype.getOffset = function( localNode, localOffset ) {
	var $node = $( localNode );
	while( !$node.hasClass( 'es-paragraphView' ) ) {
		$node = $node.parent();
	}
	
	var traverse = function( data, callback ) {
		var current = [ data, 0 ];
		var stack = [ current ];
		
		while ( stack.length > 0 ) {
			if ( current[1] >= current[0].length ) {
				stack.pop();
				current = stack[ stack.length - 1 ];
				continue;
			}
			var item = current[0][current[1]];
			var out = callback( item );
			/*
			 *	-1 = stop traversing
			 *	 1 = deep traverse
			 *	 0 = skip deep traverse 
			 */
			if ( out === -1 ) {
				return;
			} else if ( out === 1 && item.nodeType === 1 ) {
				stack.push( [ $(item).contents() , 0 ] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
			current[1]++;
		}
	};
	
	var offset = 0;
	
	traverse( $node.contents(), function( item ) {
		if ( item.nodeType === 3 ) {
			if ( item === localNode ) {
				offset += localOffset;
				return -1;
			} else {
				offset += item.textContent.length;
				
			}
		} else {
			if ( $( item ).attr('contentEditable') === "false" ) {
				offset += 1;
				return 0;
			}
		}
		return 1;
	} );

	return offset + 1 + this.documentView.getOffsetFromNode( $node.data('view') );
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