/**
 * Creates an es.SurfaceView object.
 * 
 * @class
 * @constructor
 * @param {jQuery} $container DOM Container to render surface into
 * @param {es.SurfaceModel} model Surface model to view
 */
es.SurfaceView = function( $container, model ) {
	this.$ = $container.addClass( 'es-surfaceView' );
	this.$window = $( window );
	this.model = model;
	
	// Initialize document view
	this.documentView = new es.DocumentView( this.model.getDocument(), this );
	this.$.append( this.documentView.$ );

	// Interaction state
	this.mouse = {
		selecting: false,
		clicks: 0,
		clickDelay: 500,
		clickTimeout: null,
		clickPosition: null,
		hotSpotRadius: 1,
		lastMovePosition: null
	};
	this.cursor = {
		$: $( '<div class="es-surfaceView-cursor"></div>' ).appendTo( this.$ ),
		interval: null,
		offset: null,
		initialLeft: null,
		initialBias: false
	};
	this.keyboard = {
		selecting: false,
		cursorAnchor: null,
		keydownTimeout: null,
		keys: {
			shift: false,
			control: false,
			command: false,
			alt: false
		}
	};
	this.selection = {
		from: 0,
		to: 0
	};

	// References for use in closures
	var	surfaceView = this,
		$document = $( document );

	// MouseDown on surface
	this.$.on( {
		'mousedown' : function(e) {
			return surfaceView.onMouseDown( e );
		}
	} );
	
	// Hidden input
	this.$input = $( '<input class="es-surfaceView-input" />' )
		.prependTo( this.$ )
		.on( {
			'focus' : function() {
				//console.log("focus");
				$document.off( '.es-surfaceView' );
				$document.on({
					'mousemove.es-surfaceView': function(e) {
						return surfaceView.onMouseMove( e );
					},
					'mouseup.es-surfaceView': function(e) {
						return surfaceView.onMouseUp( e );
					},
					'keydown.es-surfaceView': function( e ) {
						return surfaceView.onKeyDown( e );			
					},
					'keyup.es-surfaceView': function( e ) {
						return surfaceView.onKeyUp( e );		
					}
				});
			},
			'blur': function( e ) {
				//console.log("blur");
				$document.off( '.es-surfaceView' );
				surfaceView.hideCursor();
			}
		} ).focus();
	
	// First render
	this.documentView.renderContent();

	this.dimensions = {
		width: this.$.width(),
		height: this.$window.height(),
		scrollTop: this.$window.scrollTop()
	};
	
	// Re-render when resizing horizontally
	this.$window.resize( function() {
		surfaceView.hideCursor();
		surfaceView.dimensions.height = surfaceView.$window.height();
		var width = surfaceView.$.width();
		if ( surfaceView.dimensions.width !== width ) {
			surfaceView.dimensions.width = width;
			surfaceView.documentView.renderContent();
		}
	} );
	
	this.$window.scroll( function() {
		surfaceView.dimensions.scrollTop = surfaceView.$window.scrollTop();
	} );
};

es.SurfaceView.prototype.onMouseDown = function( e ) {
	if ( e.button === 0 /* left mouse button */ ) {
		var position = es.Position.newFromEventPagePosition( e ),
			offset = this.documentView.getOffsetFromEvent( e ),
			nodeView = this.documentView.getNodeFromOffset( offset, false );
		this.showCursor( offset, position.left > nodeView.$.offset().left );
		this.mouse.selecting = true;
		if ( !this.keyboard.keys.shift ) {
			this.selection.from = offset;
		}
		this.selection.to = offset;
		this.drawSelection();
	}
	if ( !this.$input.is( ':focus' ) ) {
		this.$input.focus().select();
	}
	this.cursor.initialLeft = null;
	return false;
};

es.SurfaceView.prototype.onMouseMove = function( e ) {
	if ( e.button === 0 /* left mouse button */ && this.mouse.selecting ) {
		this.hideCursor();
		this.selection.to = this.documentView.getOffsetFromEvent( e );
		if ( !this.drawSelection() ) {
			this.showCursor();
		}
	}
};

es.SurfaceView.prototype.onMouseUp = function( e ) {
	if ( e.button === 0 /* left mouse button */ && this.selection.to ) {
		if ( this.drawSelection() ) {
			this.hideCursor();
		}
	}
	this.mouse.selecting = false;
};

es.SurfaceView.prototype.drawSelection = function() {
	this.documentView.drawSelection( new es.Range( this.selection.from, this.selection.to ) );
	return this.selection.from !== this.selection.to;
};

es.SurfaceView.prototype.onKeyDown = function( e ) {
	switch ( e.keyCode ) {
		case 16: // Shift
			this.keyboard.keys.shift = true;
			break;
		case 17: // Control
			this.keyboard.keys.control = true;
			break;
		case 18: // Alt
			this.keyboard.keys.alt = true;
			break;
		case 91: // Command
			this.keyboard.keys.command = true;
			break;
		case 36: // Home
			this.moveCursor( 'home' );
			break;
		case 35: // End
			this.moveCursor( 'end' );
			break;
		case 37: // Left arrow
			if ( this.keyboard.keys.command ) {
				this.moveCursor( 'home' );
			} else { 
				this.moveCursor( 'left' );
			}
			break;
		case 38: // Up arrow
			this.moveCursor( 'up' );
			break;
		case 39: // Right arrow
			if ( this.keyboard.keys.command ) {
				this.moveCursor( 'end' );
			} else { 
				this.moveCursor( 'right' );
			}
			break;
		case 40: // Down arrow
			this.moveCursor( 'down' );
			break;
		case 8: // Backspace
			break;
		case 46: // Delete
			break;
		default: // Insert content (maybe)
			break;
	}
	return false;
};

es.SurfaceView.prototype.onKeyUp = function( e ) {
	switch ( e.keyCode ) {
		case 16: // Shift
			this.keyboard.keys.shift = false;
			if ( this.keyboard.selecting ) {
				this.keyboard.selecting = false;
			}
			break;
		case 17: // Control
			this.keyboard.keys.control = false;
			break;
		case 18: // Alt
			this.keyboard.keys.alt = false;
			break;
		case 91: // Command
			this.keyboard.keys.command = false;
			break;
		default:
			break;
	}
	return true;
};

es.SurfaceView.prototype.moveCursor = function( instruction ) {
	if ( instruction === 'left') {
		this.showCursor(
			this.documentView.getModel().getRelativeContentOffset( this.cursor.offset, -1 )
		);
	} else if ( instruction === 'right' ) {
		this.showCursor(
			this.documentView.getModel().getRelativeContentOffset( this.cursor.offset, 1 )
		);
	} else if ( instruction === 'up' || instruction === 'down' ) {
		// ...
	} else if ( instruction === 'home' || instruction === 'end' ) {
		var offset;
		if ( this.cursor.initialBias ) {
			offset = this.documentView.getModel().getRelativeContentOffset(
				this.cursor.offset, -1 );
		} else {
			offset = this.cursor.offset;
		}
		if ( instruction === 'home' ) {
			this.showCursor(
				this.documentView.getRenderedLineRangeFromOffset( offset ).start, false );
		} else { // end
			this.showCursor( this.documentView.getRenderedLineRangeFromOffset( offset ).end, true );
		}
	}
};

/**
 * Shows the cursor in a new position.
 * 
 * @method
 * @param offset {Integer} Position to show the cursor at
 */
es.SurfaceView.prototype.showCursor = function( offset, leftBias ) {	
	if ( typeof offset !== 'undefined' ) {
		this.cursor.initialBias = leftBias ? true : false;
		this.cursor.offset = offset;
		var position = this.documentView.getRenderedPositionFromOffset(
			this.cursor.offset, leftBias
		);
		this.cursor.$.css( {
			'left': position.left,
			'top': position.top,
			'height': position.bottom - position.top
		} );
		this.$input.css({
			'top': position.top,
			'height': position.bottom - position.top
		});
	}
	
	this.cursor.$.show();

	// cursor blinking
	if ( this.cursor.interval ) {
		clearInterval( this.cursor.interval );
	}
	this.cursor.interval = setInterval( function( surface ) {
		surface.cursor.$.css( 'display', function( index, value ) {
			return value === 'block' ? 'none' : 'block';
		} );
	}, 500, this );
};

/**
 * Hides the cursor.
 * 
 * @method
 */
es.SurfaceView.prototype.hideCursor = function() {
	if( this.cursor.interval ) {
		clearInterval( this.cursor.interval );
	}
	this.cursor.$.hide();
};
