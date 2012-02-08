/**
 * Creates an ve.es.Surface object.
 * 
 * @class
 * @constructor
 * @param {jQuery} $container DOM Container to render surface into
 * @param {ve.dm.Surface} model Surface model to view
 */
ve.es.Surface = function( $container, model ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// References for use in closures
	var	_this = this,
		$document = $( document ),
		$window = $( window );
	
	// Properties
	this.model = model;
	this.documentView = new ve.es.DocumentNode( this.model.getDocument(), this );
	this.contextView = null;
	this.$ = $container
		.addClass( 'es-surfaceView' )
		.append( this.documentView.$ );
	this.emitUpdateTimeout = undefined;

	// Events
	this.model.getDocument().on( 'update', function() {
		_this.emitUpdate( 25 );
	} );

	// Initialization
	this.documentView.renderContent();
};

/* Methods */

ve.es.Surface.prototype.attachContextView = function( contextView ) {
	this.contextView = contextView;
};

ve.es.Surface.prototype.getModel = function() {
	return this.model;
};

ve.es.Surface.prototype.emitUpdate = function( delay ) {
	if ( delay ) {
		if ( this.emitUpdateTimeout !== undefined ) {
			return;
		}
		var _this = this;
		this.emitUpdateTimeout = setTimeout( function() {
			_this.emit( 'update' );	
			_this.emitUpdateTimeout = undefined;
		}, delay );
	} else {
		this.emit( 'update' );	
	}
};

ve.es.Surface.prototype.getOffset = function( localNode, localOffset ) {
	var $node = $( localNode );
	while( !$node.hasClass( 'ce-leafNode' ) ) {
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

ve.es.Surface.prototype.getSelection = function() {
	var selection = rangy.getSelection();
	
	if ( selection.anchorNode === selection.focusNode && selection.anchorOffset === selection.focusOffset ) {
		// only one offset
		var offset = this.getOffset( selection.anchorNode, selection.anchorOffset );
		return new ve.Range( offset, offset );
	} else {
		// two offsets
		var offset1 = this.getOffset( selection.anchorNode, selection.anchorOffset );
		var offset2 = this.getOffset( selection.focusNode, selection.focusOffset );
		return new ve.Range( offset1, offset2 );
	}
};

/* Inheritance */

ve.extendClass( ve.es.Surface, ve.EventEmitter );
