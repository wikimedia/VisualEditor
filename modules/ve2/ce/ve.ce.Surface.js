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
	this.documentView = new ve.ce.Document( model.getDocument(), this );
	this.contextView = new ve.ui.Context( this );
	this.$ = $container;
	this.clipboard = {};
	this.autoRender = false;

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
	this.documentView.documentNode.$.on( {
		focus: this.proxy( this.documentOnFocus ),
		blur: this.proxy( this.documentOnBlur )
	} );
	this.on( 'contentChange', this.proxy( this.onContentChange ) );

	// Driven by mousedown and mouseup events
	this.isMouseDown = false;
	this.range = {
		anchorNode: null,
		anchorOffset: null,
		focusNode: null,
		focusOffset: null
	};

	// init rangy in case of Toshiba...
	rangy.init();

	// Events
	this.$.on( {
		//'keypress': this.proxy( this.onKeyPress ),
		//'keydown': this.proxy( this.onKeyDown ),
		//'mousedown': this.proxy( this.onMouseDown ),
		//'mouseup': this.proxy( this.onMouseUp ),
		//'mousemove': this.proxy( this.onMouseMove ),
		'cut copy': this.proxy( this.onCutCopy ),
		'beforepaste paste': this.proxy( this.onPaste ),
		'dragover drop': function( e ) {
			// Prevent content drag & drop
			e.preventDefault();
			return false;
		}
	} );

	this.model.on( 'select', this.proxy( this.onSelect ) );

	// Initialization
	this.$.append( this.documentView.documentNode.$ );

	try {
		document.execCommand( "enableObjectResizing", false, false );
		document.execCommand( "enableInlineTableEditing", false, false );
	} catch (e) { }
};


/* Methods */

ve.ce.Surface.prototype.proxy = function( func ) {
	var _this = this;
	return( function() {
		return func.apply( _this, arguments );
	});
};

ve.ce.Surface.prototype.documentOnFocus = function() {
	console.log( 'documentOnFocus' );
	this.startPolling( true );
};

ve.ce.Surface.prototype.documentOnBlur = function() {
	console.log( 'documentOnBlur' );
	this.stopPolling();
};

ve.ce.Surface.prototype.startPolling = function( async ) {
	console.log( 'startPolling', async );

	if ( this.poll.polling === false ) {
		this.poll.polling = true;
		this.pollChanges( async );
	}
};

ve.ce.Surface.prototype.stopPolling = function() {
	console.log( 'stopPolling' );

	if ( this.poll.polling === true ) {
		this.poll.polling = false;
		clearTimeout( this.poll.timeout );
	}
};

ve.ce.Surface.prototype.pollChanges = function( async ) {
	var delay = this.proxy( function( now ) {
		this.poll.timeout = setTimeout( this.proxy( this.pollChanges ), async ? 0 : this.poll.frequency );
	} );

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

		// Do we really need to figure out range even if node is null?

		range = new ve.Range(
			this.getOffset( rangySelection.anchorNode, rangySelection.anchorOffset ),
			this.getOffset( rangySelection.focusNode, rangySelection.focusOffset )
		);
	}

	if ( this.poll.node !== node ) {
		this.poll.text = ve.ce.Surface.getDOMText( node );
		this.poll.hash = ve.ce.Surface.getDOMHash( node );
		this.poll.node = node;
	} else {
		var	text = ve.ce.Surface.getDOMText( node ),
			hash = ve.ce.Surface.getDOMHash( node );
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

	if ( this.poll.range !== range ) {
		this.poll.range = range;
		this.model.setSelection( range );
	}

	delay();
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
		e.old.text.substring( 0, e.old.range.start - nodeOffset - 1 ) === e.new.text.substring( 0, e.old.range.start - nodeOffset - 1 )
	) {
		var	data = e.new.text.substring( e.old.range.start - nodeOffset - 1, e.new.range.start - nodeOffset - 1).split( '' ),
			annotations = this.model.getDocument().getAnnotationsFromOffset( e.old.range.start - 1 );

		// TODO: Add annotations to data

		this.model.transact( ve.dm.Transaction.newFromInsertion(
			this.documentView.model, e.old.range.start, data
		) );

	} else {
		// ...
	}
};

ve.ce.Surface.prototype.onSelect = function( e ) {
	console.log("onSelect", e);
};

ve.ce.Surface.prototype.onKeyPress = function( e ) {
	console.log('onKeyPress');
};

ve.ce.Surface.prototype.onKeyDown = function( e ) {
	console.log('onKeyDown');
	// Prevent all interactions coming from keyboard when mouse is down (possibly selecting)
	if ( this.isMouseDown === true ) {
		e.preventDefault();
		return false;
	}

	switch ( e.keyCode ) {
		// Left arrow
		case 37:
			break;
		// Right arrow
		case 39:
			break;
		// Backspace
		case 8:

			tx = ve.dm.Transaction.newFromRemoval( this.documentView.model, this.model.getSelection() );
			ve.dm.TransactionProcessor.commit( this.documentView.model, tx );
			this.showCursor(this.model.getSelection().start);


			e.preventDefault();
			break;
		// Delete
		case 46:
			e.preventDefault();
			break;
	}
};

ve.ce.Surface.prototype.onMouseDown = function( e ) {
	this.isMouseDown = true;

	// TODO: Add special handling for clicking on images and alien nodes
	var $leaf = $( e.target ).closest( '.ve-ce-leafNode' );
};

ve.ce.Surface.prototype.onMouseUp = function( e ) {
	var handler = function() {
		var rangySel = rangy.getSelection();

		if ( rangySel.anchorNode === null && rangySel.focusNode === null ) {
			setTimeout( this.proxy( handler ), 100 );
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
					var offset1 = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset ),
						offset2 = this.getOffset( rangySel.focusNode, rangySel.focusOffset );
				} else {
					var offset1 = this.getOffset( rangySel.focusNode, rangySel.focusOffset ),
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
	setTimeout( this.proxy( handler ), 0 );
};

ve.ce.Surface.prototype.onMouseMove = function( e ) {
	if ( this.isMouseDown === true ) {
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.onCutCopy = function( e ) {
	var _this = this,
		sel = rangy.getSelection(),
		$frag = null,
		key = '';

	this.stopPolling();

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
			_this.startPolling();

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
		rangySel.setSingleRange( rangyRange, range.start !== range.from );
	} else {
		start = end = this.getNodeAndOffset( range.start );
		rangyRange.setStart( start.node, start.offset );
		rangySel.setSingleRange( rangyRange );
	}
};

// TODO: Find a better name and a better place for this method
ve.ce.Surface.prototype.getNearestCorrectOffset = function( offset, direction ) {
	direction = direction > 0 ? 1 : -1;

	if ( ve.dm.Document.isContentOffset( this.documentView.model.data, offset ) || this.hasSlugAtOffset( offset ) ) {
		return offset;
	}

	var	contentOffset = this.documentView.model.getNearestContentOffset( offset, direction ),
		structuralOffset = this.documentView.model.getNearestStructuralOffset( offset, direction, true );

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
		return this.documentView.documentNode.getNodeFromOffset( offset ).hasSlugAtOffset( offset );	
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
 * @param DOMnode {DOM Node} DOM node
 * @param DOMoffset {Integer} DOM offset within the DOM Element
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffset = function( DOMnode, DOMoffset ) {
	if ( DOMnode.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( DOMnode, DOMoffset );
	} else {
		return this.getOffsetFromElementNode( DOMnode, DOMoffset );
	}
};

ve.ce.Surface.prototype.getOffsetFromTextNode = function( DOMnode, DOMoffset ) {
	var	$node = $( DOMnode ).closest( '.ve-ce-branchNode, .ve-ce-alienBlockNode, .ve-ce-alienInlineNode' ),
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
			if ( item === DOMnode ) {
				offset += DOMoffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current[0].eq( current[1] );
			if ( $item.hasClass( 've-ce-slug' ) ) {
				if ( $item.contents()[0] === DOMnode ) {
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

ve.ce.Surface.prototype.getOffsetFromElementNode = function( DOMnode, DOMoffset, addOuterLength ) {
	var	$DOMnode = $( DOMnode ),
		nodeModel,
		node;

	if ( $DOMnode.hasClass( 've-ce-slug' ) ) {
		if ( $DOMnode.prev().length > 0 ) {
			nodeModel = $DOMnode.prev().data( 'node' ).getModel();
			return nodeModel.getOffset() + nodeModel.getOuterLength();
		}
		if ( $DOMnode.next().length > 0 ) {
			nodeModel = $DOMnode.next().data( 'node' ).getModel();
			return nodeModel.getOffset();
		}
	}

	if ( DOMoffset === 0 ) {
		node = $DOMnode.data( 'node' );
		if ( node ) {
			nodeModel = $DOMnode.data( 'node' ).getModel();
			if ( addOuterLength === true ) {
				return nodeModel.getOffset() + nodeModel.getOuterLength();
			} else {
				return nodeModel.getOffset();
			}
		} else {
			node = $DOMnode.contents().last()[0];
		}
	} else {
		node = $DOMnode.contents()[ DOMoffset - 1 ];
	}

	if ( node.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( node, node.length );
	} else {
		return this.getOffsetFromElementNode( node, 0, true );
	}
};

ve.ce.Surface.prototype.getModel = function() {
	return this.model;
};
/* Supplies the selection anchor coordinates to contextView */
ve.ce.Surface.prototype.getSelectionRect = function() {
	var rangySel = rangy.getSelection();
	return {
		start: rangySel.getStartDocumentPos(),
		end: rangySel.getEndDocumentPos()
	};
};

ve.ce.Surface.getDOMHash = function( elem ) {
	var nodeType = elem.nodeType,
		nodeName = elem.nodeName,
		ret = '';

	if ( nodeType === 3 || nodeType === 4 ) {
		return '#';
	} else if ( nodeType === 1 || nodeType === 9 ) {
		ret += '<' + nodeName + '>';
		// Traverse it's children
		for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
			ret += ve.ce.Surface.getDOMHash( elem );
		}
		ret += '</' + nodeName + '>';
	}
	return ret;
};

ve.ce.Surface.getDOMText = function( elem ) {
	var func = function( elem ) {
		var nodeType = elem.nodeType,
			ret = '';
		if ( nodeType === 1 || nodeType === 9 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( /\r\n/g, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += func( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	};
	return func( elem ).replace( /\u00A0|\u0020/g, ' ' );
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );
