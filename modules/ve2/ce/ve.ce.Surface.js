/**
 * ContentEditable surface.
 *
 * @class
 * @constructor
 * @param model {ve.dm.Surface} Model to observe
 */
ve.ce.Surface = function( $container, model ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.model = model;
	this.documentView = null; // See initialization below
	this.contextView = null; // See initialization below
	this.selectionTimeout = null;
	this.$ = $container;
	this.$document = $( document );
	this.clipboard = {};
	this.render = true; // Used in ve.ce.TextNode

	this.poll = {
		text: null,
		hash: null,
		node: null,
		range: null,
		rangySelection: {
			anchorNode: null,
			anchorOffset: null,
			focusNode: null,
			focusOffset: null
		},
		polling: false,
		timeout: null,
		frequency: 100
	};

	// Events
	this.model.on( 'select', ve.proxy( this.onSelect, this ) );
	this.model.on( 'transact', ve.proxy( this.onTransact, this ) );
	this.on( 'contentChange', ve.proxy( this.onContentChange, this ) );
	this.$.on( {
		'cut copy': ve.proxy( this.onCutCopy, this ),
		'paste': ve.proxy( this.onPaste, this ),
		'dragover drop': function( e ) {
			// Prevent content drag & drop
			e.preventDefault();
			return false;
		}
	} );
	if ( $.browser.msie ) {
		this.$.on( 'beforepaste', ve.proxy( this.onPaste, this ) );
	}

	// Initialization
	try {
		document.execCommand( 'enableObjectResizing', false, false );
		document.execCommand( 'enableInlineTableEditing', false, false );
	} catch ( e ) {
		// Silently ignore
	}
	rangy.init();
	// Must be initialized after select and transact listeners are added to model so respond first
	this.documentView = new ve.ce.Document( model.getDocument(), this );
	this.contextView = new ve.ui.Context( this );
	this.$.append( this.documentView.getDocumentNode().$ );

	// DocumentNode Events
	this.documentView.getDocumentNode().$.on( {
		'focus': ve.proxy( this.documentOnFocus, this ),
		'blur': ve.proxy( this.documentOnBlur, this ),
	} );
};

/* Methods */

ve.ce.Surface.prototype.documentOnFocus = function() {
	ve.log( 'documentOnFocus' );

	this.$document.on( {
		// key
		'keydown.ve-ce-Surface': ve.proxy( this.onKeyDown, this ),
		// mouse
		'mousedown.ve-ce-Surface': ve.proxy( this.onMouseDown, this ),
		'mouseup.ve-ce-Surface': ve.proxy( this.onMouseUp, this ),
	} );
	this.startPolling( true );
};

ve.ce.Surface.prototype.documentOnBlur = function() {
	ve.log( 'documentOnBlur' );

	this.$document.off( '.ve-ce-Surface' );
	this.stopPolling();
};

ve.ce.Surface.prototype.onMouseDown = function( e ) {
	ve.log( 'onMouseDown' );

	if ( this.poll.polling === true ) {
		this.pollChanges();
		if ( $( e.target ).closest( '.ve-ce-documentNode' ).length === 0 ) {
			this.stopPolling();
		} else {
			this.pollChanges( true );
		}
	}

	// Block / prevent triple click
	if ( e.originalEvent.detail > 2 ) {
		e.preventDefault();
	}
};

ve.ce.Surface.prototype.onMouseUp = function( e ) {
	ve.log( 'onMouseUp' );
};

ve.ce.Surface.prototype.stopPolling = function() {
	ve.log( 'stopPolling' );

	this.poll.polling = false;
	clearTimeout( this.poll.timeout );
};

ve.ce.Surface.prototype.startPolling = function( async ) {
	ve.log( 'startPolling' );

	this.poll.polling = true;
	this.pollChanges( async );
};

ve.ce.Surface.prototype.clearPollData = function() {
	ve.log( 'clearPollData' );

	this.poll.text = null;
	this.poll.hash = null;
	this.poll.node = null;
	this.poll.rangySelection = {
		anchorNode: null,
		anchorOffset: null,
		focusNode: null,
		focusOffset: null
	};
};

/* Responsible for Debouncing the ContextView Icon
   until select events are finished being fired. */
ve.ce.Surface.prototype.onSelect = function( range ) {
	var _this = this;

	clearTimeout(this.selectionTimeout);
	this.selectionTimeout = setTimeout(function(){
		var selection = _this.model.getSelection();
		if ( _this.contextView ) {
			if ( selection.getLength() > 0 ) {
				_this.contextView.set();
			} else {
				_this.contextView.clear();
			}
		}
	}, 500);
};

ve.ce.Surface.prototype.onTransact = function( tx ) {
	this.showSelection( this.model.getSelection() );
};

ve.ce.Surface.prototype.onKeyDown = function( e ) {
	switch ( e.keyCode ) {
		// Left arrow
		case 37:
			break;
		// Right arrow
		case 39:
			break;
		// Enter
		case 13:
			e.preventDefault();
			this.handleEnter();
			break;
		// Backspace
		case 8:
			this.handleDelete( true );
			e.preventDefault();
			break;
		// Delete
		case 46:
			this.handleDelete( false );
			e.preventDefault();
			break;
		default:
			if ( this.poll.polling === false ) {
				this.poll.polling = true;
				this.pollChanges();
			}
	}
};

ve.ce.Surface.prototype.onKeyPress = function( e ) {
	console.log('onKeyPress');
};



ve.ce.Surface.prototype.pollChanges = function( async ) {
	var delay = ve.proxy( function( async ) {
		if ( this.poll.polling ) {
			if ( this.poll.timeout !== null ) {
				clearTimeout( this.poll.timeout );
			}
			this.poll.timeout = setTimeout( ve.proxy( this.pollChanges, this ), async ? 0 : this.poll.frequency );
		}
	}, this );

	if ( async ) {
		delay( true );
		return;
	}

	var node = this.poll.node,
		range = this.poll.range,
		rangySelection = rangy.getSelection();

	if (
		rangySelection.anchorNode !== this.poll.rangySelection.anchorNode ||
		rangySelection.anchorOffset !== this.poll.rangySelection.anchorOffset ||
		rangySelection.focusNode !== this.poll.rangySelection.focusNode ||
		rangySelection.focusOffset !== this.poll.rangySelection.focusOffset
	) {
		this.poll.rangySelection.anchorNode = rangySelection.anchorNode;
		this.poll.rangySelection.anchorOffset = rangySelection.anchorOffset;
		this.poll.rangySelection.focusNode = rangySelection.focusNode;
		this.poll.rangySelection.focusOffset = rangySelection.focusOffset;

		// TODO: Optimize for the case of collapsed (rangySelection.isCollapsed) range

		var	$anchorNode = $( rangySelection.anchorNode ).closest( '.ve-ce-branchNode' ),
			$focusNode = $( rangySelection.focusNode ).closest( '.ve-ce-branchNode' );

		if ( $anchorNode[0] === $focusNode[0] ) {
			node = $anchorNode[0]
		} else {
			node = null;
		}

		// TODO: Do we really need to figure out range even if node is null? (YES)

		range = new ve.Range(
			this.getOffset( rangySelection.anchorNode, rangySelection.anchorOffset ),
			this.getOffset( rangySelection.focusNode, rangySelection.focusOffset )
		);
		this.model.setSelection( range );
	}

	// TODO: Invastigate more when and why node is null and what to do in those cases

	if ( this.poll.node !== node ) {
		if ( node === null ) {
			this.poll.text = this.poll.hash = this.poll.node = null;
		} else {
			this.poll.text = ve.ce.getDomText( node );
			this.poll.hash = ve.ce.getDomHash( node );
			this.poll.node = node;
		}
	} else {
		if ( node !== null ) {
			var	text = ve.ce.getDomText( node ),
				hash = ve.ce.getDomHash( node );
			if ( this.poll.text !== text || this.poll.hash !== hash ) {
				this.emit( 'contentChange', {
					'node': node,
					'old': {
						'text': this.poll.text,
						'hash': this.poll.hash,
						'range': this.poll.range,
					},
					'new': {
						'text': text,
						'hash': hash,
						'range': range					
					}
				} );
				this.poll.text = text;
				this.poll.hash = hash;
			}
		}
	}

	if ( this.poll.range !== range ) {
		this.poll.range = range;
	}

	delay();
};

ve.ce.Surface.prototype.clearPollData = function() {
	this.poll.text = null;
	this.poll.hash = null;
	this.poll.node = null;
	this.poll.rangySelection = {
		anchorNode: null,
		anchorOffset: null,
		focusNode: null,
		focusOffset: null
	};
};

ve.ce.Surface.prototype.onContentChange = function( e ) {
	var	nodeOffset = $( e.node ).data( 'node' ).model.getOffset(),
		offsetDiff = (
			e.old.range !== null &&
			e.new.range !== null &&
			e.old.range.getLength() === 0 &&
			e.new.range.getLength() === 0
		) ? e.new.range.start - e.old.range.start : null,
		lengthDiff = e.new.text.length - e.old.text.length;

	if (
		offsetDiff === lengthDiff &&
		e.old.text.substring( 0, e.old.range.start - nodeOffset - 1 ) ===
		e.new.text.substring( 0, e.old.range.start - nodeOffset - 1 )
	) {
		var	data = e.new.text.substring(
				e.old.range.start - nodeOffset - 1,
				e.new.range.start - nodeOffset - 1
			).split( '' ),
			annotations = this.model.getDocument().getAnnotationsFromOffset( e.old.range.start - 1 );

		if ( !ve.isEmptyObject( annotations ) ) {
			ve.dm.Document.addAnnotationsToData( data, annotations );
		}

		this.render = false;

		this.model.transact( ve.dm.Transaction.newFromInsertion(
			this.documentView.model, e.old.range.start, data
		) );

		this.render = true;

	} else {
		var	fromLeft = 0,
			fromRight = 0,
			len = Math.min( e.old.text.length, e.new.text.length );

		while ( fromLeft < len && e.old.text[fromLeft] === e.new.text[fromLeft] ) {
			++fromLeft;
		}
		while (
			fromRight < len - fromLeft &&
			e.old.text[e.old.text.length - 1 - fromRight] ===
			e.new.text[e.new.text.length - 1 - fromRight]
		) {
			++fromRight;
		}

		var	annotations = this.model.getDocument().getAnnotationsFromOffset( nodeOffset + 1 + fromLeft ),
			data = e.new.text.substring( fromLeft, e.new.text.length - fromRight ).split( '' );

		if ( !ve.isEmptyObject( annotations ) ) {
			ve.dm.Document.addAnnotationsToData( data, annotations );
		}


		this.hideSelection();
		this.poll.node = null;
		this.poll.rangySelection.anchorNode = null;
		/*


		this.poll.polling = false;
		clearTimeout( this.poll.timeout );
		this.poll.node = null;
*/
		// TODO: combine newFromRemoval and newFromInsertion into one newFromReplacement
		if ( fromLeft + fromRight < e.old.text.length ) {
			this.model.transact( ve.dm.Transaction.newFromRemoval( this.documentView.model, new ve.Range(
				nodeOffset + 1 + fromLeft,
				nodeOffset + 1 + e.old.text.length - fromRight
			) ) );
		}
		this.model.transact( ve.dm.Transaction.newFromInsertion(
				this.documentView.model, nodeOffset + 1 + fromLeft, data
		) );
	}
};

/*
ve.ce.Surface.prototype.onMouseUp = function( e ) {
	var handler = function() {
		var rangySel = rangy.getSelection(),
			offset1,
			offset2;

		if ( rangySel.anchorNode === null && rangySel.focusNode === null ) {
			setTimeout( ve.proxy( handler, this ), 100 );
			return;
		}

		if (
			rangySel.anchorNode !== this.range.anchorNode ||
			rangySel.anchorOffset !== this.range.anchorOffset ||
			rangySel.focusNode !== this.range.focusNode ||
			rangySel.focusOffset !== this.range.focusOffset
		) {
			if ( rangySel.isCollapsed ) {
				var offset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
				this.model.setSelection( new ve.Range( offset ) );
			} else {
				if ( !rangySel.isBackwards() ) {
					offset1 = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
					offset2 = this.getOffset( rangySel.focusNode, rangySel.focusOffset );
				} else {
					offset1 = this.getOffset( rangySel.focusNode, rangySel.focusOffset );
					offset2 = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
				}

				var offset1Fixed = this.getNearestCorrectOffset( offset1, 1 ),
					offset2Fixed = this.getNearestCorrectOffset( offset2, -1 );

				var range;
				if ( !rangySel.isBackwards() ) {
					range = new ve.Range( offset1Fixed, offset2Fixed );
				} else {
					range = new ve.Range( offset2Fixed, offset1Fixed );
				}

				this.model.setSelection( range );

				if ( offset1 !== offset1Fixed || offset2 !== offset2Fixed ) {
					this.showSelection( range );
				}
			}
			this.range.anchorNode = rangySel.anchorNode;
			this.range.anchorOffset = rangySel.anchorOffset;
			this.range.focusNode = rangySel.focusNode;
			this.range.focusOffset = rangySel.focusOffset;
		}

		this.isMouseDown = false;
	};
	setTimeout( ve.proxy( handler, this ), 0 );
};

ve.ce.Surface.prototype.onMouseMove = function( e ) {
	if ( this.isMouseDown === true ) {
	}
};
*/

/**
 * @method
 */
ve.ce.Surface.prototype.onCutCopy = function( e ) {
	var _this = this,
		sel = rangy.getSelection(),
		$frag = null,
		key = '';

	//this.stopPolling();

	// Create key from text and element names
	$frag = $(sel.getRangeAt(0).cloneContents());
	$frag.contents().each(function() {
		key += this.textContent || this.nodeName;
	});
	key = key.replace( /\s/gm, '' );

	// Set surface clipboard
	this.clipboard[key] = ve.copyArray(
		this.documentView.model.getData( this.model.getSelection() )
	);

	if ( e.type == 'cut' ) {
		setTimeout( function() {
			var	selection = null,
				tx = null;
		
			// We don't like how browsers cut, so let's undo it and do it ourselves.
			document.execCommand('undo', false, false);
			
			selection = _this.model.getSelection();
			
			// Transact
			_this.autoRender = true;
			tx = ve.dm.Transaction.newFromRemoval( _this.documentView.model, selection );
			_this.model.transact( tx );
			_this.autoRender = false;
			//_this.startPolling();

			// Place cursor
			_this.showCursor( selection.start );
			_this.model.setSelection( new ve.Range( selection.start ) );
		}, 1 );
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.onPaste = function( e ) {
	debugger;
	var	_this = this,
		selection = this.model.getSelection(),
		tx = null;
	
	// Pasting into a range? Remove first.
	if (!rangy.getSelection().isCollapsed) {
		tx = ve.dm.Transaction.newFromRemoval( _this.documentView.model, selection );
		_this.model.transact( tx );
	}
	
	$('#paste').html('').show().focus();

	setTimeout( function() {
		var	key = '',
			pasteData = null,
			tx = null;
		
		// Create key from text and element names
		$('#paste').hide().contents().each(function() {
			key += this.textContent || this.nodeName;
		});
		key = key.replace( /\s/gm, '' );

		// Get linear model from surface clipboard or create array from unknown pasted content
		pasteData = ( _this.clipboard[key] ) ? _this.clipboard[key] : $('#paste').text().split('');

		// Transact
		tx = ve.dm.Transaction.newFromInsertion(
			_this.documentView.model, selection.start, pasteData
		);
		_this.model.transact( tx );

		// Place cursor
		_this.showCursor( selection.start + pasteData.length );
		_this.model.setSelection( new ve.Range( selection.start + pasteData.length ) );
		_this.documentView.documentNode.$.focus();
	}, 1 );
};

ve.ce.Surface.prototype.handleEnter = function() {
	this.stopPolling();

	var selection = this.model.getSelection(),
		tx;
		
	if ( selection.from !== selection.to ) {
		tx = ve.dm.Transaction.newFromRemoval( this.documentView.model, selection );
		this.model.transact( tx );
	}
	
	var	node = this.documentView.getNodeFromOffset( selection.to ),
		nodeOffset = this.documentView.getDocumentNode().getOffsetFromNode( node ),
		stack = [];
	
	// Build stack
	ve.Node.traverseUpstream( node, function( node ) {
		var elementType = node.type;
		if ( !node.canBeSplit() ) {
			return false;
		}
		stack.splice(
			stack.length / 2,
			0,
			{ 'type': '/' + elementType },
			{
				'type': elementType,
				'attributes': ve.copyObject( node.model.attributes )
			}
		);
		return true;
	} );

	// Transact
	tx = ve.dm.Transaction.newFromInsertion( this.documentView.model, selection.from, stack );
	this.model.transact( tx );

	// Place cursor
	selection.from = selection.to = this.model.getDocument().getRelativeContentOffset( selection.from, 1 );

	this.showCursor(selection.from);
	this.model.setSelection( new ve.Range( selection.from ) );
	
	this.clearPollData();
	this.startPolling();
};

ve.ce.Surface.prototype.handleDelete = function( backspace ) {	
	this.stopPolling();

	var selection = this.model.getSelection(),
		sourceOffset,
		targetOffset,
		sourceSplitableNode,
		targetSplitableNode,
		tx,
		cursorAt;

	if ( selection.from === selection.to ) {
		if ( backspace ) {
			sourceOffset = selection.to; 
			targetOffset = this.model.getDocument().getRelativeContentOffset( sourceOffset, -1 );
			this.model.setSelection( new ve.Range( targetOffset, targetOffset ) );
		} else {
			sourceOffset = this.model.getDocument().getRelativeContentOffset( selection.to, 1 );
			targetOffset = selection.to;
		}

		var	sourceNode = this.documentView.getNodeFromOffset( sourceOffset, false ),
			targetNode = this.documentView.getNodeFromOffset( targetOffset, false );
		
		if ( sourceNode.type === targetNode.type ) {
			sourceSplitableNode = ve.ce.Node.getSplitableNode( sourceNode );
			targetSplitableNode = ve.ce.Node.getSplitableNode( targetNode );
		}
		//console.log(sourceSplitableNode, targetSplitableNode);
		
		cursorAt = targetOffset;


		if ( sourceNode === targetNode ||
			( typeof sourceSplitableNode !== 'undefined' &&
			sourceSplitableNode.getParent()  === targetSplitableNode.getParent() ) ) {
			// Source and target are the same node or have the same parent (list items)
			
			// Transact
			tx = ve.dm.Transaction.newFromRemoval( this.documentView.model, new ve.Range( targetOffset, sourceOffset ) );
			this.model.transact( tx );
		} else {
			// Source and target are different nodes and do not share a parent. Perform tricky merge.

			// !!!This portion still in development
			return;
			
			// Transact
			/*
			tx = ve.dm.Transaction.newFromInsertion(
				this.documentView.model, targetOffset, sourceNode.model.getContentData()
			);
			*/
	
			console.log('sourceNode', sourceNode);
			console.log('sourceOffset', sourceOffset);
			console.log('targetNode', targetNode);
			console.log('targetOffset', targetOffset);
return;
			console.log('length: ', sourceNode.model.getLength());
			console.log('outerlength: ', sourceNode.model.getOuterLength());
			console.log('offset', this.documentView.getDocumentNode().getOffsetFromNode( sourceNode ));
			console.log('some data: ', this.documentView.model.getData( this.model.getSelection() ) )
			
			// Find the node that should be completely removed
			var nodeToDelete = sourceNode;
			ve.Node.traverseUpstream( nodeToDelete, function( node ) {
				if ( node.getParent().children.length === 1 ) {
					nodeToDelete = node.getParent();
					return true;
				} else {
					return false;
				}
			} );
			
			// Create range surrounding the entire sourceNode and remove
			/*var range = new ve.Range();
			range.from = this.documentView.getDocumentNode().getOffsetFromNode( sourceNode )
			range.to = range.from + sourceNode.model.getOuterLength();*/
			// Just setting .from and .to produces an invalid range with .start and .end unset --Roan
			var from = this.documentView.getDocumentNode().getOffsetFromNode( sourceNode ),
				range = new ve.Range(
					from,
					from + sourceNode.model.getOuterLength()
				);
			tx = ve.dm.Transaction.newFromRemoval( this.documentView.model, range );
			this.model.transact( tx );
		}
	} else {
		// selection removal
		this.model.setSelection( new ve.Range( selection.start, selection.start ) );
		tx = ve.dm.Transaction.newFromRemoval( this.documentView.model, selection );
		this.model.transact( tx );
		cursorAt = selection.start;
	}

	this.showCursor(cursorAt);
	this.model.setSelection( new ve.Range( cursorAt ) );

	this.clearPollData();
	this.startPolling();
};

ve.ce.Surface.prototype.showCursor = function( offset ) {
	this.showSelection( new ve.Range( offset ) );
};

ve.ce.Surface.prototype.showSelection = function( range ) {
	var rangySel = rangy.getSelection(),
		rangyRange = rangy.createRange(),
		start,
		end;

	if ( range.start !== range.end ) {
		start = this.getNodeAndOffset( range.start );
		end = this.getNodeAndOffset( range.end ),
		rangyRange.setStart( start.node, start.offset );
		rangyRange.setEnd( end.node, end.offset );
		rangySel.removeAllRanges();
		rangySel.addRange( rangyRange, range.start !== range.from );
	} else {
		start = end = this.getNodeAndOffset( range.start );
		rangyRange.setStart( start.node, start.offset );
		rangySel.setSingleRange( rangyRange );
	}
};

ve.ce.Surface.prototype.hideSelection = function() {
	rangy.getSelection().removeAllRanges();
};

// TODO: Find a better name and a better place for this method
ve.ce.Surface.prototype.getNearestCorrectOffset = function( offset, direction ) {
	direction = direction > 0 ? 1 : -1;

	if (
		ve.dm.Document.isContentOffset( this.documentView.model.data, offset ) ||
		this.hasSlugAtOffset( offset )
	) {
		return offset;
	}

	var	contentOffset = this.documentView.model.getNearestContentOffset( offset, direction ),
		structuralOffset =
			this.documentView.model.getNearestStructuralOffset( offset, direction, true );

	if ( !this.hasSlugAtOffset( structuralOffset ) ) {
		return contentOffset;
	}

	if ( direction === 1 ) {
		if ( contentOffset < offset ) {
			return structuralOffset;
		} else {
			return Math.min( contentOffset, structuralOffset );
		}
	} else {
		if ( contentOffset > offset ) {
			return structuralOffset;
		} else {
			return Math.max( contentOffset, structuralOffset );
		}
	}
};

// TODO: Find a better name and a better place for this method - probably in a document view?
ve.ce.Surface.prototype.hasSlugAtOffset = function( offset ) {
	var node = this.documentView.documentNode.getNodeFromOffset( offset );
	if ( node.canHaveChildren() ) {
		return node.hasSlugAtOffset( offset );
	} else {
		return false;
	}
};

/**
 * Based on a given offset returns DOM node and offset that can be used to place a cursor.
 *
 * The results of this function are meant to be used with rangy.
 *
 * @method
 * @param offset {Integer} Linear model offset
 * @returns {Object} Object containing a node and offset property where node is an HTML element and
 * offset is the position within the element
 */
ve.ce.Surface.prototype.getNodeAndOffset = function( offset ) {
	var	node = this.documentView.getNodeFromOffset( offset ),
		startOffset = this.documentView.getDocumentNode().getOffsetFromNode( node ) +
			( ( node.isWrapped() ) ? 1 : 0 ),
		current = [node.$.contents(), 0],
		stack = [current],
		item,
		$item,
		length;

	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		item = current[0][current[1]];
		if ( item.nodeType === Node.TEXT_NODE ) {
			length = item.textContent.length;
			if ( offset >= startOffset && offset <= startOffset + length ) {
				return {
					node: item,
					offset: offset - startOffset
				};
			} else {
				startOffset += length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current[0].eq( current[1] );
			if ( $item.hasClass('ve-ce-slug') ) {
				if ( offset === startOffset ) {
					return {
						node: $item[0],
						offset: 1
					};
				}
			} else if ( $item.is( '.ve-ce-branchNode, .ve-ce-leafNode' ) ) {
				length = $item.data( 'node' ).model.getOuterLength();
				if ( offset >= startOffset && offset < startOffset + length ) {
					stack.push( [$item.contents(), 0] );
					current[1]++;
					current = stack[stack.length-1];
					continue;
				} else {
					startOffset += length;
				}
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}

		}
		current[1]++;
	}
};

/**
 * Gets the linear offset based on a given DOM node and DOM offset
 *
 * @method
 * @param domNode {DOM Node} DOM node
 * @param domOffset {Integer} DOM offset within the DOM Element
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffset = function( domNode, domOffset ) {
	if ( domNode.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( domNode, domOffset );
	} else {
		return this.getOffsetFromElementNode( domNode, domOffset );
	}
};

ve.ce.Surface.prototype.getOffsetFromTextNode = function( domNode, domOffset ) {
	var	$node = $( domNode ).closest(
			'.ve-ce-branchNode, .ve-ce-alienBlockNode, .ve-ce-alienInlineNode'
		),
		nodeModel = $node.data( 'node' ).getModel();
	if ( ! $node.hasClass( 've-ce-branchNode' ) ) {
		return nodeModel.getOffset();
	}
	var	current = [$node.contents(), 0],
		stack = [current],
		offset = 0,
		item,
		$item;
	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		item = current[0][current[1]];
		if ( item.nodeType === Node.TEXT_NODE ) {
			if ( item === domNode ) {
				offset += domOffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current[0].eq( current[1] );
			if ( $item.hasClass( 've-ce-slug' ) ) {
				if ( $item.contents()[0] === domNode ) {
					break;
				}
			} else if ( $item.hasClass( 've-ce-leafNode' ) ) {
				offset += 2;
			} else if ( $item.hasClass( 've-ce-branchNode' ) ) {
				offset += $item.data( 'node' ).getOuterLength();
			} else {
				stack.push( [$item.contents(), 0 ] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}
	return offset + nodeModel.getOffset() + ( nodeModel.isWrapped() ? 1 : 0 );
};

ve.ce.Surface.prototype.getOffsetFromElementNode = function( domNode, domOffset, addOuterLength ) {
	var	$domNode = $( domNode ),
		nodeModel,
		node;

	if ( $domNode.hasClass( 've-ce-slug' ) ) {
		if ( $domNode.prev().length > 0 ) {
			nodeModel = $domNode.prev().data( 'node' ).getModel();
			return nodeModel.getOffset() + nodeModel.getOuterLength();
		}
		if ( $domNode.next().length > 0 ) {
			nodeModel = $domNode.next().data( 'node' ).getModel();
			return nodeModel.getOffset();
		}
	}

	if ( domOffset === 0 ) {
		node = $domNode.data( 'node' );
		if ( node ) {
			nodeModel = $domNode.data( 'node' ).getModel();
			if ( addOuterLength === true ) {
				return nodeModel.getOffset() + nodeModel.getOuterLength();
			} else {
				return nodeModel.getOffset();
			}
		} else {
			node = $domNode.contents().last()[0];
		}
	} else {
		node = $domNode.contents()[ domOffset - 1 ];
	}

	if ( node.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( node, node.length );
	} else {
		return this.getOffsetFromElementNode( node, 0, true );
	}
};

ve.ce.Surface.prototype.updateContextIcon = function() {
	var _this = this,
		selection = this.model.getSelection();
	
		if ( this.contextView ) {
			if ( selection.getLength() > 0 ) {
				this.contextView.set();
			} else {
				this.contextView.clear();
			}
		}

};

/* Supplies the selection anchor coordinates to contextView */
ve.ce.Surface.prototype.getSelectionRect = function() {
	var rangySel = rangy.getSelection();
	return {
		start: rangySel.getStartDocumentPos(),
		end: rangySel.getEndDocumentPos()
	};
};

ve.ce.Surface.prototype.getModel = function() {
	return this.model;
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );
