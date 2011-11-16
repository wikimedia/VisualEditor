/**
 * Creates an es.SurfaceView object.
 * 
 * @class
 * @constructor
 * @param {jQuery} $container DOM Container to render surface into
 * @param {es.SurfaceModel} model Surface model to view
 */
es.SurfaceView = function( $container, model ) {
	var _this = this;

	es.EventEmitter.call( this );

	this.$ = $container.addClass( 'es-surfaceView' );
	this.$window = $( window );
	this.model = model;
	this.selection = new es.Range();
	this.previousSelection = null;
	this.mac = navigator.userAgent.match(/mac/i) ? true : false;

	this.model.getDocument().on( 'update', function() {
		_this.emit( 'update' );
	} );
	this.emitSelect = function() {
		if ( _this.previousSelection ) {
			if (
				_this.previousSelection.from !== _this.selection.from || 
				_this.previousSelection.to !== _this.selection.to
			) {
				_this.emit( 'select', _this.selection.clone() );
				_this.previousSelection = _this.selection.clone();
			}
			// Mouse movement that doesn't change selection points will terminate here
		} else {
			_this.previousSelection = _this.selection.clone();
		}
	};

	// Initialize document view
	this.documentView = new es.DocumentView( this.model.getDocument(), this );
	this.$.append( this.documentView.$ );

	// Interaction state
	
	// There are three different selection modes available for mouse. Selection of:
	// * 1 - chars
	// * 2 - words
	// * 3 - nodes (e.g. paragraph, listitem)
	//
	// In case of 2 and 3 selectedRange stores the range of original selection caused by double
	// or triple mousedowns.
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
			//control: false,
			//command: false,
			//alt: false
		}
	};

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
};

/* Methods */

es.SurfaceView.prototype.onMouseDown = function( e ) {
	if ( e.button === 0 ) { // left mouse button

		var offset = this.documentView.getOffsetFromEvent( e );
		
		console.log('onMouseDown; offset: ' + offset);

		if ( e.originalEvent.detail === 1 ) { // single click
			this.mouse.selectingMode = 1; // used in mouseMove handler

			if ( this.keyboard.keys.shift && offset !== this.selection.from ) {
				// extend current or create new selection
				this.selection.to = offset;
			} else {
				if ( this.selection.to !== this.selection.from ) {
					// clear the selection if there was any
					this.documentView.clearSelection();
				}
				this.selection.from = this.selection.to = offset;

				var	position = es.Position.newFromEventPagePosition( e ),
					nodeView = this.documentView.getNodeFromOffset( offset, false );
				this.cursor.initialBias = position.left > nodeView.contentView.$.offset().left;
			}

		} else if ( e.originalEvent.detail === 2 ) { // double click
			this.mouse.selectingMode = 2; // used in mouseMove handler
			
			var wordRange = this.documentView.model.getWordBoundaries( offset );
			if( wordRange ) {
				this.selection = wordRange;
				this.mouse.selectedRange = this.selection.clone();
			}

		} else if ( e.originalEvent.detail >= 3 ) { // triple click
			this.mouse.selectingMode = 3; // used in mouseMove handler
			
			var node = this.documentView.getNodeFromOffset( offset );
			this.selection.from = this.documentView.getOffsetFromNode( node, false );
			this.selection.to = this.selection.from + node.getElementLength() - 1;
			this.mouse.selectedRange = this.selection.clone();
		}

		if ( this.selection.from === this.selection.to ) {
			this.showCursor();
		} else {
			this.hideCursor();
			this.documentView.drawSelection( this.selection );
		}
	}

	if ( !this.$input.is( ':focus' ) ) {
		this.$input.focus().select();
	}
	this.cursor.initialLeft = null;
	this.emitSelect();
	return false;
};

es.SurfaceView.prototype.onMouseMove = function( e ) {
	if ( e.button === 0 && this.mouse.selectingMode ) { // left mouse button and in selecting mode

		var offset = this.documentView.getOffsetFromEvent( e );

		if ( this.mouse.selectingMode === 1 ) { // selection of chars
			this.selection.to = offset;
		} else if ( this.mouse.selectingMode === 2 ) { // selection of words
			var wordRange = this.documentView.model.getWordBoundaries( offset );
			if ( wordRange ) {
				if ( wordRange.to <= this.mouse.selectedRange.from ) {
					this.selection.to = wordRange.from;
					this.selection.from = this.mouse.selectedRange.to;
				} else {
					this.selection.to = wordRange.to;
					this.selection.from = this.mouse.selectedRange.from;
				}
			} else {
				this.selection.to = offset;
			}
		} else if ( this.mouse.selectingMode === 3 ) {
			var nodeRange = this.documentView.getRangeFromNode(
				this.documentView.getNodeFromOffset( offset )
			);
			if ( nodeRange.to <= this.mouse.selectedRange.from ) {
				this.selection.to = nodeRange.from;
				this.selection.from = this.mouse.selectedRange.to;
			} else {
				this.selection.to = nodeRange.to;
				this.selection.from = this.mouse.selectedRange.from;
			}	
		}

		this.documentView.drawSelection( this.selection );
		if ( this.selection.from !== this.selection.to ) {
			this.hideCursor();
		}
	}
};

es.SurfaceView.prototype.onMouseUp = function( e ) {
	if ( e.button === 0 ) { // left mouse button 
		this.mouse.selectingMode = this.mouse.selectedRange = null;
	}
};

es.SurfaceView.prototype.onKeyDown = function( e ) {
	var tx;
	switch ( e.keyCode ) {
		case 16: // Shift
			this.keyboard.keys.shift = true;
			this.keyboard.selecting = true;
			break;
		case 17: // Control
			//this.keyboard.keys.control = true;
			break;
		case 18: // Alt
			//this.keyboard.keys.alt = true;
			break;
		case 91: // Left Command in WebKit
		case 93: // Right Command in WebKit
		case 224: // Command in FireFox
			//this.keyboard.keys.command = true;
			break;
		case 36: // Home
			this.moveCursor( 'left', 'line' );
			break;
		case 35: // End
			this.moveCursor( 'right', 'line' );
			break;
		case 37: // Left arrow
			if ( !this.mac ) {
				if ( e.ctrlKey ) {
					this.moveCursor( 'left', 'word' );
				} else {
					this.moveCursor( 'left', 'char' );
				}
			} else {
				if ( e.metaKey || e.ctrlKey ) {
					this.moveCursor( 'left', 'line' );
				} else  if ( e.altKey ) {
					this.moveCursor( 'left', 'word' );
				} else {
					this.moveCursor( 'left', 'char' );
				}
			}
			break;
		case 38: // Up arrow
			if ( !this.mac ) {
				if ( e.ctrlKey ) {
					this.moveCursor( 'up', 'unit' );
				} else {
					this.moveCursor( 'up', 'char' );
				}
			} else {
				if ( e.altKey ) {
					this.moveCursor( 'up', 'unit' );
				} else {
					this.moveCursor( 'up', 'char' );
				}
			}
			break;
		case 39: // Right arrow
			if ( !this.mac ) {
				if ( e.ctrlKey ) {
					this.moveCursor( 'right', 'word' );
				} else {
					this.moveCursor( 'right', 'char' );
				}
			} else {
				if ( e.metaKey || e.ctrlKey ) {
					this.moveCursor( 'right', 'line' );
				} else  if ( e.altKey ) {
					this.moveCursor( 'right', 'word' );
				} else {
					this.moveCursor( 'right', 'char' );
				}
			}
			break;
		case 40: // Down arrow
			if ( !this.mac ) {
				if ( e.ctrlKey ) {
					this.moveCursor( 'down', 'unit' );
				} else {
					this.moveCursor( 'down', 'char' );
				}
			} else {
				if ( e.altKey ) {
					this.moveCursor( 'down', 'unit' );
				} else {
					this.moveCursor( 'down', 'char' );
				}
			}
			break;
		case 8: // Backspace
			this.selection.normalize();

			if ( this.selection.from != this.selection.to ) { // delete selection
				var tx = this.documentView.model.prepareRemoval( this.selection );
				this.documentView.model.commit ( tx );
				this.documentView.clearSelection();
				this.selection.from = this.selection.to = this.selection.start;
				this.showCursor();
			}

			break;
		case 46: // Delete
			this.selection.normalize();

			if ( this.selection.from != this.selection.to ) { // delete selection
				var tx = this.documentView.model.prepareRemoval( this.selection );
				this.documentView.model.commit ( tx );
				this.documentView.clearSelection();
				this.selection.from = this.selection.to = this.selection.start;
				this.showCursor();
			}

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
			//this.keyboard.keys.control = false;
			break;
		case 18: // Alt
			//this.keyboard.keys.alt = false;
			break;
		case 91: // Left Command in WebKit
		case 93: // Right Command in WebKit
		case 224: // Command in FireFox
			//this.keyboard.keys.command = false;
			break;
		default:
			break;
	}
	return true;
};

/**
 * @param {String} direction up | down | left | right
 * @param {String} unit char | word | line | node | page
 */
es.SurfaceView.prototype.moveCursor = function( direction, unit ) {
	console.log('moveCursor; direction: ' + direction + ', unit: ' + unit);

	if ( direction !== 'up' && direction !== 'down' ) {
		this.cursor.initialLeft = null;
	}

	this.selection.normalize();
	
	var to;

	switch ( direction ) {
		case 'left':
		case 'right':
			switch ( unit ) {
				case 'char':
				case 'word':
					var offset;
					if ( this.keyboard.keys.shift || this.selection.from === this.selection.to ) {
						offset = this.selection.to;
					} else {
						offset = direction === 'left' ? this.selection.start : this.selection.end;
					}
					to = this.documentView.getModel().getRelativeContentOffset(
							offset,
							direction === 'left' ? -1 : 1
					);
					if ( unit === 'word' ) {
						var wordRange = this.documentView.model.getWordBoundaries(
							direction === 'left' ? to : offset
						);
						if ( wordRange ) {
							to = direction === 'left' ? wordRange.start : wordRange.end;
						}
					}
					break;
				case 'line':
					var offset = this.cursor.initialBias ?
						this.documentView.getModel().getRelativeContentOffset(
							this.selection.to,
							-1) :
								this.selection.to;
					var range = this.documentView.getRenderedLineRangeFromOffset( offset );
					to = direction === 'left' ? range.start : range.end;
					break;
			}
			break;
		case 'up':
		case 'down':
			switch ( unit ) {
				case 'unit':
					var toNode = null;
					this.documentView.model.traverseLeafNodes(
						function( node  ) {
							if ( toNode === null) {
								toNode = node;
							} else {
								toNode = node;
								return false;
							}
						},
						this.documentView.getNodeFromOffset( this.selection.to, false ).getModel(),
						direction === 'up' ? true : false
					);
					to = this.documentView.model.getOffsetFromNode( toNode, false ) + 1;
					break;
				case 'char':
					/*
					 * Looks for the in-document character position that would match up with the
					 * same horizontal position - jumping a few pixels up/down at a time until we
					 * reach the next/previous line
					 */
					var position = this.documentView.getRenderedPositionFromOffset(
						this.selection.to
					);
					if ( this.cursor.initialLeft === null ) {
						this.cursor.initialLeft = position.left;
					}
					var	fakePosition = new es.Position( this.cursor.initialLeft, position.top ),
						i = 0,
						step = direction === 'up' ? -5 : 5,
						top = this.$.position().top;
					do {
						fakePosition.top += ++i * step;
						if ( fakePosition.top < top ) {
							break;
						} else if (fakePosition.top > top + this.dimensions.height + this.dimensions.scrollTop ) {
							break;
						}
						fakePosition = this.documentView.getRenderedPositionFromOffset(
							this.documentView.getOffsetFromRenderedPosition( fakePosition )
						);
						fakePosition.left = this.cursor.initialLeft;
					} while ( position.top === fakePosition.top );
					to = this.documentView.getOffsetFromRenderedPosition( fakePosition );
					break;
			}
			break;		
	}

	this.cursor.initialBias =  direction === 'right' && unit === 'line' ? true : false;
	
	if ( this.keyboard.keys.shift && this.selection.from !== to) {
		this.selection.to = to;
		this.documentView.drawSelection( this.selection );
		this.hideCursor();
	} else {
		if ( this.selection.from !== this.selection.to ) { 
			this.documentView.clearSelection();
		}
		this.selection.from = this.selection.to = to;
		this.showCursor();
	}
	this.emitSelect();	
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

/* Inheritance */

es.extendClass( es.SurfaceView, es.EventEmitter );