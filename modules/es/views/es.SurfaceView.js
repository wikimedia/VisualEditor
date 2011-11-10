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
		selectingMode: null,
		selectedRange: null
	};
	this.cursor = {
		$: $( '<div class="es-surfaceView-cursor"></div>' ).appendTo( this.$ ),
		interval: null,
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
	this.selection = new es.Range();

	// References for use in closures
	var	surfaceView = this,
		$document = $( document );

	// MouseDown and DoubleClick on surface
	this.$.on( {
		'mousedown' : function(e) {
			return surfaceView.onMouseDown( e );
		}
	} );
	
	// Hidden input
	this.$input = $( '<textarea class="es-surfaceView-textarea" />' )
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
	
	this.documentView.on('update', function() {alert(1);});
};

es.SurfaceView.prototype.onMouseDown = function( e ) {
	if ( e.button === 0 /* left mouse button */ ) {
		switch ( e.originalEvent.detail ) {
			case 1: // single click
				this.mouse.selectingMode = 1;

				this.selection.to = this.documentView.getOffsetFromEvent( e );
				console.log(this.selection.to);
				if ( this.keyboard.keys.shift ) {
					this.documentView.drawSelection( this.selection );
					this.hideCursor();
				} else {
					this.documentView.clearSelection();
					this.selection.from = this.selection.to;
					var	position = es.Position.newFromEventPagePosition( e ),
						nodeView = this.documentView.getNodeFromOffset( this.selection.to, false );
					this.cursor.initialBias = position.left > nodeView.$.offset().left;
					this.showCursor();
				}
				break;
			case 2: // double click
				this.mouse.selectingMode = 2;

				this.selection = this.documentView.model.getWordBoundaries(
					this.documentView.getOffsetFromEvent( e )
				);
				this.documentView.drawSelection( this.selection );
				this.hideCursor();
				this.mouse.selectedRange = new es.Range( this.selection.from, this.selection.to );
				break;
			default: // 3 and more
				this.mouse.selectingMode = 3;
				
				var node = this.documentView.getNodeFromOffset(
					this.documentView.getOffsetFromEvent( e )
				);
				this.selection.from = this.documentView.getOffsetFromNode( node, false );
				this.selection.to = this.selection.from + node.getElementLength() - 1;
				this.documentView.drawSelection( this.selection );
				this.hideCursor();
				this.mouse.selectedRange = new es.Range( this.selection.from, this.selection.to );
				break;
		}
	}
	if ( !this.$input.is( ':focus' ) ) {
		this.$input.focus().select();
	}
	this.cursor.initialLeft = null;
	return false;
};

es.SurfaceView.prototype.onMouseMove = function( e ) {
	if ( e.button === 0 /* left mouse button */ && this.mouse.selectingMode ) {
		if ( this.mouse.selectingMode === 1 ) {
			this.selection.to = this.documentView.getOffsetFromEvent( e );
		} else if ( this.mouse.selectingMode === 2 ) {
			var wordBoundaries  = this.documentView.model.getWordBoundaries(
				this.documentView.getOffsetFromEvent( e )
			);
			if ( wordBoundaries.to <= this.mouse.selectedRange.from ) {
				this.selection.to = wordBoundaries.from;
				this.selection.from = this.mouse.selectedRange.to;
			} else {
				this.selection.from = this.mouse.selectedRange.from;
				this.selection.to = wordBoundaries.to;
			}			
		} else if ( this.mouse.selectingMode === 3 ) {
			var node = this.documentView.getNodeFromOffset(
				this.documentView.getOffsetFromEvent( e )
			);
			var nodeBoundaries = new es.Range();
			nodeBoundaries.from = this.documentView.getOffsetFromNode( node, false );
			nodeBoundaries.to = nodeBoundaries.from + node.getElementLength() - 1;
				
			if ( nodeBoundaries.to <= this.mouse.selectedRange.from ) {
				this.selection.to = nodeBoundaries.from;
				this.selection.from = this.mouse.selectedRange.to;
			} else {
				this.selection.from = this.mouse.selectedRange.from;
				this.selection.to = nodeBoundaries.to;
			}			
		}		
		this.documentView.drawSelection( this.selection );
		if ( this.selection.getLength() ) {
			this.hideCursor();
		}	
	}
	return;
	
	if ( e.button === 0 /* left mouse button */ && this.mouse.selected ) {
		
		var offset = this.documentView.getOffsetFromEvent( e );
		if ( this.mouse.selected.containsOffset( offset ) ) {
			//return;
		}
		var wordBoundaries  = this.documentView.model.getWordBoundaries( offset );
		if ( wordBoundaries.to <= this.mouse.selected.from ) {
			this.selection.to = wordBoundaries.from;
			this.selection.from = this.mouse.selected.to;
		} else {
			this.selection.from = this.mouse.selected.from;
			this.selection.to = wordBoundaries.to;
		}
		
		/*
		var to = this.documentView.getOffsetFromEvent( e );
		
		if ( to <= this.mouse.selected.from ) {
			this.selection.to = to;
			this.selection.from = this.mouse.selected.to; 
		} else if ( to >= this.mouse.selected.to ) {
			this.selection.from = this.mouse.selected.from;
			this.selection.to = to;
		}
		*/
		
		this.documentView.drawSelection( this.selection );
		
	} else if ( e.button === 0 /* left mouse button */ && this.mouse.selecting ) {
		this.selection.to = this.documentView.getOffsetFromEvent( e );

	}
};

es.SurfaceView.prototype.onMouseUp = function( e ) {
	if ( e.button === 0 /* left mouse button */ ) {
		this.mouse.selectingMode = this.mouse.selectedRange = null;
	}
};

es.SurfaceView.prototype.onKeyDown = function( e ) {
	switch ( e.keyCode ) {
		case 16: // Shift
			this.keyboard.keys.shift = true;
			this.keyboard.selecting = true;
			break;
		case 17: // Control
			this.keyboard.keys.control = true;
			break;
		case 18: // Alt
			this.keyboard.keys.alt = true;
			break;
		case 91: // Left Command in WebKit
		case 93: // Right Command in WebKit
		case 224: // Command in FireFox
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
			var transaction = this.documentView.model.prepareRemoval( new es.Range( this.selection.to, this.selection.to - 1 ) );
			this.documentView.model.commit ( transaction );
			this.selection.from = this.selection.to -= 1;
			this.showCursor();
			break;
		case 46: // Delete
			var transaction = this.documentView.model.prepareRemoval( new es.Range( this.selection.to, this.selection.to + 1 ) );
			this.documentView.model.commit ( transaction );
			break;
		default: // Insert content (maybe)
			if ( this.keyboard.keydownTimeout ) {
				clearTimeout( this.keyboard.keydownTimeout );
			}
			var surface = this;
			this.keyboard.keydownTimeout = setTimeout( function () {
				surface.insertFromInput();
			}, 10 );
			break;
	}
	return true;
};

es.SurfaceView.prototype.insertFromInput = function() {
	var val = this.$input.val();
	this.$input.val( '' );
	if ( val.length > 0 ) {
		var transaction = this.documentView.model.prepareInsertion( this.selection.to, val.split('') );
		this.documentView.model.commit ( transaction );
		this.selection.from = this.selection.to += val.length;
		this.showCursor();
	}
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
		case 91: // Left Command in WebKit
		case 93: // Right Command in WebKit
		case 224: // Command in FireFox
			this.keyboard.keys.command = false;
			break;
		default:
			break;
	}
	return true;
};

es.SurfaceView.prototype.moveCursor = function( instruction ) {
	this.selection.normalize();

	if ( instruction !== 'up' && instruction !== 'down' ) {
		this.cursor.initialLeft = null;
	}
	
	var newTo;

	switch ( instruction ) {
		case 'left' :
		case 'right' :
			var offset;
			if ( this.keyboard.keys.shift ) {
				offset = this.selection.to;
			} else {
				offset = this.selection.from === this.selection.to ?
					this.selection.to :
						instruction === 'left' ? this.selection.start : this.selection.end;
			}
			newTo = this.documentView.getModel().getRelativeContentOffset(
				offset,
				instruction === 'left' ? -1 : 1
			);
			break;
		case 'home' :
		case 'end' :
			var range = this.documentView.getRenderedLineRangeFromOffset(
				this.cursor.initialBias ?
					this.documentView.getModel().getRelativeContentOffset( this.selection.to, -1 ) :
						this.selection.to
			);
			newTo = instruction === 'home' ? range.start : range.end;
			break;
		case 'up' :
		case 'down' :
			/*
			 * Looks for the in-document character position that would match up with the same
			 * horizontal position - jumping a few pixels up/down at a time until we reach
			 * the next/previous line
			 */

			var position = this.documentView.getRenderedPositionFromOffset( this.selection.to );
			if ( this.cursor.initialLeft === null ) {
				this.cursor.initialLeft = position.left;
			}
			var	fakePosition = new es.Position( this.cursor.initialLeft, position.top ),
				i = 0,
				step = instruction === 'up' ? -5 : 5,
				top = this.$.position().top;
			do {
				fakePosition.top += ++i * step;
				if ( fakePosition.top < top ) {
					this.cursor.initialLeft = null;
					fakePosition.top = fakePosition.left = 0;
					break;
				} else if ( fakePosition.top > top + this.dimensions.height + this.dimensions.scrollTop ) {
					this.cursor.initialLeft = null;
					fakePosition.left = this.dimensions.width;
					break;
				}
				fakePosition = this.documentView.getRenderedPositionFromOffset(
					this.documentView.getOffsetFromRenderedPosition( fakePosition )
				);
				fakePosition.left = this.cursor.initialLeft;
			} while ( position.top === fakePosition.top );
			newTo = this.documentView.getOffsetFromRenderedPosition( fakePosition );
			break;
	}

	
	if( instruction === 'end' ) {
		this.cursor.initialBias = true;
	} else {
		this.cursor.initialBias = false;
	} 
	
	if ( this.keyboard.keys.shift ) {
		this.selection.to = newTo;
		if ( this.selection.from !== this.selection.to ) {
			this.documentView.drawSelection( this.selection );
			this.hideCursor();
		} else {
			this.documentView.clearSelection();
			this.showCursor();
		}
	} else {
		if ( this.selection.from !== this.selection.to ) { 
			this.documentView.clearSelection();
		}
		this.selection.from = this.selection.to = newTo;
		this.showCursor();
	}
};

/**
 * Shows the cursor in a new position.
 * 
 * @method
 * @param offset {Integer} Position to show the cursor at
 */
es.SurfaceView.prototype.showCursor = function() {	
	var position = this.documentView.getRenderedPositionFromOffset(
		this.selection.to, this.cursor.initialBias
	);
	this.cursor.$.css( {
		'left': position.left,
		'top': position.top,
		'height': position.bottom - position.top
	} ).show();
	this.$input.css({
		'top': position.top,
		'height': position.bottom - position.top
	});

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
