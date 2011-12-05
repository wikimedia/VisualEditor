/**
 * Creates an es.SurfaceView object.
 * 
 * @class
 * @constructor
 * @param {jQuery} $container DOM Container to render surface into
 * @param {es.SurfaceModel} model Surface model to view
 */
es.SurfaceView = function( $container, model ) {
	// Inheritance
	es.EventEmitter.call( this );

	// References for use in closures
	var	_this = this,
		$document = $( document ),
		$window = $( window );
	
	// Properties
	this.model = model;
	this.currentSelection = new es.Range();
	this.documentView = new es.DocumentView( this.model.getDocument(), this );
	this.contextView = new es.ContextView( this );
	this.$ = $container
		.addClass( 'es-surfaceView' )
		.append( this.documentView.$ );
	this.$input = $( '<textarea class="es-surfaceView-textarea" />' )
		.appendTo( 'body' );
	this.$cursor = $( '<div class="es-surfaceView-cursor"></div>' )
		.appendTo( 'body' );
	this.insertionAnnotations = [];
	this.updateSelectionTimeout = undefined;
	this.emitUpdateTimeout = undefined;
	this.emitCursorTimeout = undefined;

	// Interaction states
	
	/*
	 * There are three different selection modes available for mouse. Selection of:
	 *     1 - chars
	 *     2 - words
	 *     3 - nodes (e.g. paragraph, listitem)
	 *
	 * In case of 2 and 3 selectedRange stores the range of original selection caused by double
	 * or triple mousedowns.
	 */
	this.mouse = {
		selectingMode: null,
		selectedRange: null
	};
	this.cursor = {
		interval: null,
		initialLeft: null,
		initialBias: false
	};
	this.keyboard = {
		selecting: false,
		cursorAnchor: null,
		keydownTimeout: null,
		keys: { shift: false }
	};
	this.dimensions = {
		width: this.$.width(),
		height: $window.height(),
		scrollTop: $window.scrollTop(),
		// XXX: This is a dirty hack!
		toolbarTop: $( '#es-toolbar' ).offset().top,
		toolbarHeight: $( '#es-toolbar' ).height()
	};

	// Events

	this.model.on( 'select', function( selection ) {

		

		// Keep a copy of the current selection on hand
		_this.currentSelection = selection.clone();
		// Respond to selection changes
		_this.updateSelection();
		if ( selection.getLength() ) {
			_this.$input.val('#COPY#').select();
			_this.clearInsertionAnnotations();
		} else {
			_this.$input.val('').select();
			_this.loadInsertionAnnotations();
		}
	} );
	this.model.getDocument().on( 'update', function() {
		_this.emitUpdate( 25 );
	} );
	this.on( 'update', function() {
		_this.updateSelection( 25 );
	} );
	this.$.mousedown( function(e) {
		return _this.onMouseDown( e );
	} );
	this.$input.bind( {
			'focus': function() {
				// Make sure we aren't double-binding
				$document.unbind( '.es-surfaceView' );
				// Bind mouse and key events to the document to ensure we don't miss anything
				$document.bind( {
					'mousemove.es-surfaceView': function(e) {
						return _this.onMouseMove( e );
					},
					'mouseup.es-surfaceView': function(e) {
						return _this.onMouseUp( e );
					},
					'keydown.es-surfaceView': function( e ) {
						return _this.onKeyDown( e );			
					},
					'keyup.es-surfaceView': function( e ) {
						return _this.onKeyUp( e );		
					}
				} );
			},
			'blur': function( e ) {
				// Release our event handlers when not focused
				$document.unbind( '.es-surfaceView' );
				_this.hideCursor();
			},
			'paste': function() {
				setTimeout( function() {
					_this.insertFromInput();
				}, 0 );
			}
		} );
	$window.resize( function() {
		// Re-render when resizing horizontally
		// TODO: Instead of re-rendering on every single 'resize' event wait till user is done with
		// resizing - can be implemented with setTimeout
		_this.hideCursor();
		_this.dimensions.height = $window.height();
		var width = _this.$.width();
		if ( _this.dimensions.width !== width ) {
			_this.dimensions.width = width;
			_this.documentView.renderContent();
			_this.emitUpdate( 25 );
		}
	} );
	$window.scroll( function() {
		_this.dimensions.scrollTop = $window.scrollTop();
		if ( _this.currentSelection.getLength() && !_this.mouse.selectingMode ) {
			_this.contextView.set();
		} else {
			_this.contextView.clear();
		}
	} );

	// Configuration
	this.mac = navigator.userAgent.match(/mac/i) ? true : false; // (yes it's evil, for keys only!)

	// Initialization
	this.$input.focus();
	this.documentView.renderContent();
};

/* Methods */
es.SurfaceView.prototype.emitCursor = function() {
	if ( this.emitCursorTimeout ) {
		clearTimeout( this.emitCursorTimeout );
	}
	var _this = this;
	this.emitCursorTimeout = setTimeout( function() {
		var	annotations,
			nodes = [],
			model = _this.documentView.model;
	
		if( _this.currentSelection.from === _this.currentSelection.to ) {
			var insertionAnnotations = _this.getInsertionAnnotations();
			annotations = {
				'full': insertionAnnotations,
				'partial': [],
				'all': insertionAnnotations
			};
			nodes.push( model.getNodeFromOffset( _this.currentSelection.from ) );
		} else {
			annotations = model.getAnnotationsFromRange( _this.currentSelection );
			var	startNode = model.getNodeFromOffset( _this.currentSelection.start ),
				endNode = model.getNodeFromOffset( _this.currentSelection.end );
			if ( startNode === endNode ) {
				nodes.push( startNode );
			} else {
				model.traverseLeafNodes( function( node ) {
					nodes.push( node );
					if( node === endNode ) {
						return false;
					}
				}, startNode );			
			}
		}
		_this.emit( 'cursor', annotations, nodes );
	}, 50 );
};

es.SurfaceView.prototype.getInsertionAnnotations = function() {
	return this.insertionAnnotations;
};

es.SurfaceView.prototype.addInsertionAnnotation = function( annotation ) {
	this.insertionAnnotations.push( annotation );
	this.emitCursor();
};

es.SurfaceView.prototype.loadInsertionAnnotations = function( annotation ) {
	this.insertionAnnotations =
		this.model.getDocument().getAnnotationsFromOffset( this.currentSelection.to - 1 );
	// Filter out annotations that aren't textStyles or links
	for ( var i = 0; i < this.insertionAnnotations.length; i++ ) {
		if ( !this.insertionAnnotations[i].type.match( /(textStyle\/|link\/)/ ) ) {
			this.insertionAnnotations.splice( i, 1 );
			i--;
		}
	}
	this.emitCursor();
};

es.SurfaceView.prototype.removeInsertionAnnotation = function( annotation ) {
	var index = es.DocumentModel.getIndexOfAnnotation( this.insertionAnnotations, annotation );
	if ( index !== -1 ) {
		this.insertionAnnotations.splice( index, 1 );
	}
	this.emitCursor();
};

es.SurfaceView.prototype.clearInsertionAnnotations = function() {
	this.insertionAnnotations = [];
	this.emitCursor();
};

es.SurfaceView.prototype.getModel = function() {
	return this.model;
};

es.SurfaceView.prototype.updateSelection = function( delay ) {
	var _this = this;
	function update() {
		if ( _this.currentSelection.getLength() ) {
			_this.clearInsertionAnnotations();
			_this.hideCursor();
			_this.documentView.drawSelection( _this.currentSelection );
		} else {
			_this.showCursor();
			_this.documentView.clearSelection( _this.currentSelection );
		}
		if ( _this.currentSelection.getLength() && !_this.mouse.selectingMode ) {
			_this.contextView.set();
		} else {
			_this.contextView.clear();
		}
		_this.updateSelectionTimeout = undefined;
	}
	if ( delay ) {
		if ( this.updateSelectionTimeout !== undefined ) {
			return;
		}
		this.updateSelectionTimeout = setTimeout( update, delay );
	} else {
		update();
	}
};

es.SurfaceView.prototype.emitUpdate = function( delay ) {
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

es.SurfaceView.prototype.onMouseDown = function( e ) {
	// Only for left mouse button
	if ( e.button === 0 ) {
		var selection = this.currentSelection.clone(),
			offset = this.documentView.getOffsetFromEvent( e );
		// Single click
		if ( e.originalEvent.detail === 1 ) {
			// @see {es.SurfaceView.prototype.onMouseMove}
			this.mouse.selectingMode = 1;

			if ( this.keyboard.keys.shift && offset !== selection.from ) {
				// Extend current or create new selection
				selection.to = offset;
			} else {
				selection.from = selection.to = offset;

				var	position = es.Position.newFromEventPagePosition( e ),
					nodeView = this.documentView.getNodeFromOffset( offset, false );
				this.cursor.initialBias = position.left > nodeView.contentView.$.offset().left;
			}
		}
		// Double click
		else if ( e.originalEvent.detail === 2 ) {
			// @see {es.SurfaceView.prototype.onMouseMove}
			this.mouse.selectingMode = 2;
			
			var wordRange = this.model.getDocument().getWordBoundaries( offset );
			if( wordRange ) {
				selection = wordRange;
				this.mouse.selectedRange = selection.clone();
			}
		}
		// Triple click
		else if ( e.originalEvent.detail >= 3 ) {
			// @see {es.SurfaceView.prototype.onMouseMove}
			this.mouse.selectingMode = 3;

			var node = this.documentView.getNodeFromOffset( offset ),
				nodeOffset = this.documentView.getOffsetFromNode( node, false );

			selection.from = this.model.getDocument().getRelativeContentOffset( nodeOffset, 1 );
			selection.to = this.model.getDocument().getRelativeContentOffset(
				nodeOffset + node.getElementLength(), -1
			);
			this.mouse.selectedRange = selection.clone();
		}
		// Reset the initial left position
		this.cursor.initialLeft = null;
		// Apply new selection
		this.model.select( selection );
	}
	// If the inut isn't already focused, focus it and select it's contents
	if ( !this.$input.is( ':focus' ) ) {
		this.$input.focus().select();
	}
	return false;
};

es.SurfaceView.prototype.onMouseMove = function( e ) {
	// Only with the left mouse button while in selecting mode
	if ( e.button === 0 && this.mouse.selectingMode ) {
		var selection = this.currentSelection.clone(),
			offset = this.documentView.getOffsetFromEvent( e );

		// Character selection
		if ( this.mouse.selectingMode === 1 ) {
			selection.to = offset;
		}
		// Word selection
		else if ( this.mouse.selectingMode === 2 ) {
			var wordRange = this.model.getDocument().getWordBoundaries( offset );
			if ( wordRange ) {
				if ( wordRange.to <= this.mouse.selectedRange.from ) {
					selection.from = wordRange.from;
					selection.to = this.mouse.selectedRange.to;
				} else {
					selection.from = this.mouse.selectedRange.from;
					selection.to = wordRange.to;
				}
			}
		}
		// Node selection
		else if ( this.mouse.selectingMode === 3 ) {
			// @see {es.SurfaceView.prototype.onMouseMove}
			this.mouse.selectingMode = 3;

			var nodeRange = this.documentView.getRangeFromNode(
				this.documentView.getNodeFromOffset( offset )
			);
			if ( nodeRange.to <= this.mouse.selectedRange.from ) {
				selection.from = this.model.getDocument().getRelativeContentOffset(
					nodeRange.from, 1
				);
				selection.to = this.mouse.selectedRange.to;
			} else {
				selection.from = this.mouse.selectedRange.from;
				selection.to = this.model.getDocument().getRelativeContentOffset(
					nodeRange.to, -1
				);
			}	
		}
		// Apply new selection
		this.model.select( selection );
	}
};

es.SurfaceView.prototype.onMouseUp = function( e ) {
	if ( e.button === 0 ) { // left mouse button 
		this.mouse.selectingMode = this.mouse.selectedRange = null;
		this.model.select( this.currentSelection );
		// We have to manually call this because the selection will not have changed between the
		// most recent mousemove and this mouseup
		this.contextView.set();
	}
};

es.SurfaceView.prototype.onKeyDown = function( e ) {
	var _this = this;
	function handleInsert() {
		if ( _this.keyboard.keydownTimeout ) {
			clearTimeout( _this.keyboard.keydownTimeout );
		}
		_this.keyboard.keydownTimeout = setTimeout( function () {
			_this.insertFromInput();
		}, 10 );
	}
	switch ( e.keyCode ) {
		// Shift
		case 16:
			this.keyboard.keys.shift = true;
			this.keyboard.selecting = true;
			break;
		// Ctrl
		case 17:
			break;
		// Home
		case 36:
			this.moveCursor( 'left', 'line' );
			break;
		// End
		case 35:
			this.moveCursor( 'right', 'line' );
			break;
		// Left arrow
		case 37:
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
		// Up arrow
		case 38:
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
		// Right arrow
		case 39:
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
		// Down arrow
		case 40:
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
		// Backspace
		case 8:
			this.handleDelete( true );
			break;
		// Delete
		case 46:
			this.handleDelete();
			break;
		// Enter
		case 13:
			this.handleEnter();
			e.preventDefault();
			break;
		// Z (undo/redo)
		case 90:
			if ( e.metaKey || e.ctrlKey ) {
				if ( this.keyboard.keys.shift ) {
					this.model.redo( 1 );
				} else {
					this.model.undo( 1 );
				}
				return false;
			}
			handleInsert();
			break;

		// a (select all)
		case 65:
			if ( e.metaKey || e.ctrlKey ) {
				this.model.select( new es.Range(
					this.model.getDocument().getRelativeContentOffset( 0, 1 ),
					this.model.getDocument().getRelativeContentOffset(
						this.model.getDocument().getContentLength(), -1
					)
				) );
				break;			
			}
		// Insert content (maybe)
		default:
			if ( !e.ctrlKey || ( e.ctrlKey && e.keyCode === 86 ) ) {
				handleInsert();
			}
			break;
	}
	return true;
};

es.SurfaceView.prototype.onKeyUp = function( e ) {
	switch ( e.keyCode ) {
		case 16: // Shift
			this.keyboard.keys.shift = false;
			if ( this.keyboard.selecting ) {
				this.keyboard.selecting = false;
			}
			break;
		default:
			break;
	}
	return true;
};

es.SurfaceView.prototype.handleDelete = function( backspace ) {
	var selection = this.currentSelection.clone(),
		sourceOffset,
		targetOffset,
		sourceSplitableNode,
		targetSplitableNode,
		tx;
	if ( selection.from === selection.to ) {
		if ( backspace ) {
			sourceOffset = selection.to;
			targetOffset = this.model.getDocument().getRelativeContentOffset(
				sourceOffset,
				-1
			);
		} else {
			sourceOffset = this.model.getDocument().getRelativeContentOffset(
				selection.to,
				1
			);
			targetOffset = selection.to;
		}

		var	sourceNode = this.documentView.getNodeFromOffset( sourceOffset, false ),
			targetNode = this.documentView.getNodeFromOffset( targetOffset, false );
	
		if ( sourceNode.model.getElementType() === targetNode.model.getElementType() ) {
			sourceSplitableNode = es.DocumentViewNode.getSplitableNode( sourceNode );
			targetSplitableNode = es.DocumentViewNode.getSplitableNode( targetNode );
		}
		
		selection.from = selection.to = targetOffset;
		this.model.select( selection );
		
		if ( sourceNode === targetNode ||
			( typeof sourceSplitableNode !== 'undefined' &&
			sourceSplitableNode.getParent()  === targetSplitableNode.getParent() ) ) {
			tx = this.model.getDocument().prepareRemoval(
				new es.Range( targetOffset, sourceOffset )
			);
			this.model.transact( tx, true );
		} else {
			tx = this.model.getDocument().prepareInsertion(
				targetOffset, sourceNode.model.getContentData()
			);
			this.model.transact( tx, true );
			
			var nodeToDelete = sourceNode;
			es.DocumentNode.traverseUpstream( nodeToDelete, function( node ) {
				if ( node.getParent().children.length === 1 ) {
					nodeToDelete = node.getParent();
					return true;
				} else {
					return false;
				}
			} );
			var range = new es.Range();
			range.from = this.documentView.getOffsetFromNode( nodeToDelete, false );
			range.to = range.from + nodeToDelete.getElementLength();
			tx = this.model.getDocument().prepareRemoval( range );
			this.model.transact( tx, true );
		}
	} else {
		// selection removal
		tx = this.model.getDocument().prepareRemoval( selection );
		this.model.transact( tx, true );
		selection.from = selection.to = selection.start;
		this.model.select( selection );
	}
};

es.SurfaceView.prototype.handleEnter = function() {
	var selection = this.currentSelection.clone(),
		tx;
	if ( selection.from !== selection.to ) {
		this.handleDelete();
	}
	var	node = this.documentView.getNodeFromOffset( selection.to, false ),
		nodeOffset = this.documentView.getOffsetFromNode( node, false );

	if (
		nodeOffset + node.getContentLength() + 1 === selection.to &&
		node ===  es.DocumentViewNode.getSplitableNode( node )
	) {
		tx = this.documentView.model.prepareInsertion(
			nodeOffset + node.getElementLength(),
			[ { 'type': 'paragraph' }, { 'type': '/paragraph' } ]
		);
		this.model.transact( tx, true );
		selection.from = selection.to = nodeOffset + node.getElementLength() + 1;	
	} else {
		var	stack = [],
			splitable = false;

		es.DocumentNode.traverseUpstream( node, function( node ) {
			var elementType = node.model.getElementType();
			if (
				splitable === true &&
				es.DocumentView.splitRules[ elementType ].children === true
			) {
				return false;
			}
			stack.splice(
				stack.length / 2,
				0,
				{ 'type': '/' + elementType },
				{
					'type': elementType,
					'attributes': es.copyObject( node.model.element.attributes )
				}
			);
			splitable = es.DocumentView.splitRules[ elementType ].self;
			return true;
		} );
		tx = this.documentView.model.prepareInsertion( selection.to, stack );
		this.model.transact( tx, true );
		selection.from = selection.to =
			this.model.getDocument().getRelativeContentOffset( selection.to, 1 );
	}
	this.model.select( selection );
};

es.SurfaceView.prototype.insertFromInput = function() {
	var selection = this.currentSelection.clone(),
		val = this.$input.val();
	this.$input.val( '' );
	if ( val.length > 0 ) {
		//debugger;
		var tx;
		if ( selection.from != selection.to ) {
			tx = this.model.getDocument().prepareRemoval( selection );
			this.model.transact( tx, true );
			selection.from = selection.to =
				Math.min( selection.from, selection.to );
		}
		var data = val.split('');
		es.DocumentModel.addAnnotationsToData( data, this.getInsertionAnnotations() );
		
		tx = this.model.getDocument().prepareInsertion( selection.from, data );
		this.model.transact( tx, true );

		selection.from += val.length;
		selection.to += val.length;
		this.model.select( selection );
	}
};

/**
 * @param {String} direction up | down | left | right
 * @param {String} unit char | word | line | node | page
 */
es.SurfaceView.prototype.moveCursor = function( direction, unit ) {
	if ( direction !== 'up' && direction !== 'down' ) {
		this.cursor.initialLeft = null;
	}
	var selection = this.currentSelection.clone(),
		to,
		offset;
	switch ( direction ) {
		case 'left':
		case 'right':
			switch ( unit ) {
				case 'char':
				case 'word':
					if ( this.keyboard.keys.shift || selection.from === selection.to ) {
						offset = selection.to;
					} else {
						offset = direction === 'left' ? selection.start : selection.end;
					}
					to = this.model.getDocument().getRelativeContentOffset(
							offset,
							direction === 'left' ? -1 : 1
					);
					if ( unit === 'word' ) {
						var wordRange = this.model.getDocument().getWordBoundaries(
							direction === 'left' ? to : offset
						);
						if ( wordRange ) {
							to = direction === 'left' ? wordRange.start : wordRange.end;
						}
					}
					break;
				case 'line':
					offset = this.cursor.initialBias ?
						this.model.getDocument().getRelativeContentOffset(
							selection.to,
							-1) :
								selection.to;
					var range = this.documentView.getRenderedLineRangeFromOffset( offset );
					to = direction === 'left' ? range.start : range.end;
					break;
				default:
					throw new Error( 'unrecognized cursor movement unit' );
					break;
			}
			break;
		case 'up':
		case 'down':
			switch ( unit ) {
				case 'unit':
					var toNode = null;
					this.model.getDocument().traverseLeafNodes(
						function( node ) {
							var doNextChild = toNode === null;
							toNode = node;
							return doNextChild;
						},
						this.documentView.getNodeFromOffset( selection.to, false ).getModel(),
						direction === 'up' ? true : false
					);
					to = this.model.getDocument().getOffsetFromNode( toNode, false ) + 1;
					break;
				case 'char':
					/*
					 * Looks for the in-document character position that would match up with the
					 * same horizontal position - jumping a few pixels up/down at a time until we
					 * reach the next/previous line
					 */
					var position = this.documentView.getRenderedPositionFromOffset(
						selection.to,
						this.cursor.initialBias
					);
					
					if ( this.cursor.initialLeft === null ) {
						this.cursor.initialLeft = position.left;
					}
					var	fakePosition = new es.Position( this.cursor.initialLeft, position.top ),
						i = 0,
						step = direction === 'up' ? -5 : 5,
						top = this.$.position().top;

					this.cursor.initialBias = position.left > this.documentView.getNodeFromOffset(
						selection.to, false
					).contentView.$.offset().left;

					do {
						i++;
						fakePosition.top += i * step;
						if ( fakePosition.top < top ) {
							break;
						} else if (
							fakePosition.top > top + this.dimensions.height +
								this.dimensions.scrollTop
						) {
							break;
						}
						fakePosition = this.documentView.getRenderedPositionFromOffset(
							this.documentView.getOffsetFromRenderedPosition( fakePosition ),
							this.cursor.initialBias
						);
						fakePosition.left = this.cursor.initialLeft;
					} while ( position.top === fakePosition.top );
					to = this.documentView.getOffsetFromRenderedPosition( fakePosition );
					break;
				default:
					throw new Error( 'unrecognized cursor movement unit' );
					break;
			}
			break;	
		default:
			throw new Error( 'unrecognized cursor direction' );
			break;
	}

	if( direction != 'up' && direction != 'down' ) {
		this.cursor.initialBias = direction === 'right' && unit === 'line' ? true : false;
	}

	if ( this.keyboard.keys.shift && selection.from !== to) {
		selection.to = to;
	} else {
		selection.from = selection.to = to;
	}
	this.model.select( selection );
};

/**
 * Shows the cursor in a new position.
 * 
 * @method
 * @param offset {Integer} Position to show the cursor at
 */
es.SurfaceView.prototype.showCursor = function() {	
	var $window = $( window ),
		position = this.documentView.getRenderedPositionFromOffset(
			this.currentSelection.to, this.cursor.initialBias
		);
	
	this.$cursor.css( {
		'left': position.left,
		'top': position.top,
		'height': position.bottom - position.top
	} ).show();
	this.$input.css({
		'top': position.top,
		'height': position.bottom - position.top
	});

	// Auto scroll to cursor
	var inputTop = this.$input.offset().top,
		inputBottom = inputTop + position.bottom - position.top;	
	if ( inputTop - this.dimensions.toolbarHeight < this.dimensions.scrollTop ) {
		$window.scrollTop( inputTop - this.dimensions.toolbarHeight );
	} else if ( inputBottom > ( this.dimensions.scrollTop + this.dimensions.height ) ) {
		$window.scrollTop( inputBottom - this.dimensions.height );
	}

	// cursor blinking
	if ( this.cursor.interval ) {
		clearInterval( this.cursor.interval );
	}

	var _this = this;
	this.cursor.interval = setInterval( function( surface ) {
		_this.$cursor.css( 'display', function( index, value ) {
			return value === 'block' ? 'none' : 'block';
		} );
	}, 500 );
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
	this.$cursor.hide();
};

/* Inheritance */

es.extendClass( es.SurfaceView, es.EventEmitter );
