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
	this.documentView = new ve.ce.Document( model.getDocument() );
	this.contextView = new ve.ui.Context( this );
	this.$ = $container;
	this.isMouseDown = false;
	this.clipboard = {};
	
	// Events
	this.$.on( {
		'keydown': this.proxy( this.onKeyDown ),
		'mousedown': this.proxy( this.onMouseDown ),
		'mouseup': this.proxy( this.onMouseUp ),
		'mousemove': this.proxy( this.onMouseMove ),
		'cut copy': this.proxy( this.onCutCopy ),
		'beforepaste paste': this.proxy( this.onPaste )
	} );

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

ve.ce.Surface.prototype.onKeyDown = function( e ) {
	var rangySel = rangy.getSelection();
	var offset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
	console.log( 'onKeyDown', 'offset', offset );

	var relativeContentOffset,
		relativeStructuralOffset,
		relativeStructuralOffsetNode,
		hasSlug;

	switch ( e.which ) {
		case 37: // left arrow key
			relativeContentOffset = this.documentView.model.getRelativeContentOffset( offset, -1 );
			relativeStructuralOffset =
				this.documentView.model.getRelativeStructuralOffset( offset - 1, -1, true );
			relativeStructuralOffsetNode =
				this.documentView.documentNode.getNodeFromOffset( relativeStructuralOffset );
			hasSlug = relativeStructuralOffsetNode.hasSlugAtOffset( relativeStructuralOffset );
			if ( hasSlug ) {
				if ( relativeContentOffset > offset ) {
					this.showCursor( relativeStructuralOffset );
				} else {
					this.showCursor( Math.max( relativeContentOffset, relativeStructuralOffset ) );
				}
			} else {
				this.showCursor( relativeContentOffset );
			}
			return false;
		case 39: // right arrow key
			relativeContentOffset = this.documentView.model.getRelativeContentOffset( offset, 1 );
			relativeStructuralOffset =
				this.documentView.model.getRelativeStructuralOffset( offset + 1, 1, true );
			relativeStructuralOffsetNode =
				this.documentView.documentNode.getNodeFromOffset( relativeStructuralOffset );
			hasSlug = relativeStructuralOffsetNode.hasSlugAtOffset( relativeStructuralOffset );
			if ( hasSlug ) {
				if ( relativeContentOffset < offset ) {
					this.showCursor( relativeStructuralOffset );
				} else {
					this.showCursor( Math.min( relativeContentOffset, relativeStructuralOffset ) );
				}
			} else {
				this.showCursor( relativeContentOffset );
			}
			return false;
	}
};

ve.ce.Surface.prototype.onMouseDown = function( e ) {
	this.isMouseDown = true;

	var _this = this;

	setTimeout( function() {
		var rangySel = rangy.getSelection();
		var offset = _this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
		console.log( 'onMouseDown', 'rangySel', rangySel.anchorNode, rangySel.anchorOffset );
		console.log( 'onMouseDown', 'offset', offset );
	}, 0 );

	var $closestLeaf = $( e.target ).closest( '.ve-ce-leafNode' );

	if ( $closestLeaf.length > 0 ) {
		console.log( 'onMouseDown', 'closest leaf of e.target', $closestLeaf );

		var closestLeafModel = $closestLeaf.data( 'node' ).getModel();
		var closestLeafOffset = closestLeafModel.getRoot().getOffsetFromNode( closestLeafModel );
		console.log( 'onMouseDown', 'closestLeafOffset', closestLeafOffset );

		var nearestContentOffset =
			this.documentView.model.getNearestContentOffset( closestLeafOffset, -1 );
		console.log( 'onMouseDown', 'nearestContentOffset', nearestContentOffset );

		var nearestStructuralOffset =
			this.documentView.model.getNearestStructuralOffset( closestLeafOffset, 0, true );
		console.log( 'onMouseDown', 'nearestStructuralOffset', nearestStructuralOffset );

		var nearestStructuralOffsetNode =
			this.documentView.documentNode.getNodeFromOffset( nearestStructuralOffset );
		console.log( 'onMouseDown', 'nearestStructuralOffsetNode', nearestStructuralOffsetNode );

		var hasSlug = nearestStructuralOffsetNode.hasSlugAtOffset( nearestStructuralOffset );
		console.log( 'onMouseDown', 'hasSlug', hasSlug );

		if ( hasSlug ) {
			if ( nearestContentOffset > closestLeafOffset ) {
				this.showCursor( nearestStructuralOffset );
			} else {
				this.showCursor( Math.max( nearestStructuralOffset, nearestContentOffset ) );
			}
		} else {
			this.showCursor( nearestContentOffset );
		}

		return false;
	}
};

ve.ce.Surface.prototype.onMouseUp = function( e ) {
	this.isMouseDown = false;
};

ve.ce.Surface.prototype.onMouseMove = function( e ) {
	if ( this.isMouseDown === true ) {
		//...
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

	// Create key from text and element names
	$frag = $(sel.getRangeAt(0).cloneContents());
	$frag.contents().each(function() {
		key += this.textContent || this.nodeName;
	});
	key = key.replace( /\s/gm, '' );

	// Set surface clipboard
	this.clipboard[key] = ve.copyArray(
		this.documentView.model.getData( this.getSelectionRange() )
	);

	if ( e.type == 'cut' ) {
		setTimeout( function() {
			var	selection = null,
				tx = null;
		
			// We don't like how browsers cut, so let's undo it and do it ourselves.
			document.execCommand('undo', false, false);
			
			selection = _this.getSelectionRange();
			
			// Transact
			tx = ve.dm.Transaction.newFromRemoval( _this.documentView.model, selection );
			ve.dm.TransactionProcessor.commit( _this.documentView.model, tx );

			// Place cursor
			_this.showCursor( selection.start );
		}, 1 );
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.onPaste = function( e ) {
	var	_this = this,
		selection = this.getSelectionRange(),
		tx = null;
	
	// Pasting into a range? Remove first.	
	if (!rangy.getSelection().isCollapsed) {
		tx = ve.dm.Transaction.newFromRemoval( _this.documentView.model, selection );
		ve.dm.TransactionProcessor.commit( _this.documentView.model, tx );
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
		ve.dm.TransactionProcessor.commit( _this.documentView.model, tx );

		// Place cursor
		_this.showCursor( selection.start + pasteData.length );
		_this.documentView.documentNode.$.focus();
	}, 1 );
};

/**
 * Gets the linear offset based on a given DOM node (DOMnode) and offset (DOMoffset)
 *
 * @method
 * @param DOMnode {DOM Element} DOM Element
 * @param DOMoffset {Integer} DOM offset within the DOM Element
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffset = function( DOMnode, DOMoffset ) {
	if ( DOMnode.nodeType === Node.TEXT_NODE ) {
		var $branch = $( DOMnode ).closest( '.ve-ce-branchNode' ),
			current = [$branch.contents(), 0],
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
		var	branchModel = $branch.data( 'node' ).getModel(),
			branchOffset = branchModel.getRoot().getOffsetFromNode( branchModel );
		return offset + branchOffset + ( ( branchModel.isWrapped() ) ? 1 : 0 );
	} else if ( DOMnode.nodeType === Node.ELEMENT_NODE ) {
		var $DOMnode = $( DOMnode );
		if ( DOMoffset === 0 ) {
			throw "Not implemented";
		} else if ( $DOMnode.hasClass( 've-ce-slug' ) ) {
			var nodeModel;
			if ( $DOMnode.next().length > 0 ) {
				nodeModel = $DOMnode.next().data( 'node' ).getModel();
				return nodeModel.getRoot().getOffsetFromNode( nodeModel );
			} else if ( $DOMnode.prev().length > 0 ) {
				nodeModel = $DOMnode.prev().data( 'node' ).getModel();
				return nodeModel.getRoot().getOffsetFromNode( nodeModel ) + nodeModel.getOuterLength();
			}
		} else {
			var	$node = $DOMnode.contents().eq( DOMoffset - 1 ),
				nodeModel = $node.data( 'node' ).getModel(),
				nodeOffset = nodeModel.getRoot().getOffsetFromNode( nodeModel );
			return nodeOffset + nodeModel.getOuterLength();
		}
	}
	throw "Not implemented";
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
	throw "Not implemented";
};

/**
 * Gets closest BranchNode (.ve-ce-branchNode) based on a given DOM node
 *
 * @method
 * @param elem {DOM Element} DOM Element
 * @returns {jQuery} jQuery element
 */
ve.ce.Surface.getBranchNode = function( elem ) {
	var $branch = $( elem ).closest( '.ve-ce-branchNode' );
	return $branch.length ? $branch : null;
};

/**
 * @method
 */
ve.ce.Surface.prototype.showCursor = function( offset ) {
	this.showSelection( new ve.Range( offset ) );
};

/**
 * @method
 */
ve.ce.Surface.prototype.showSelection = function( range ) {
	var	start = this.getNodeAndOffset( range.start ),
		stop = this.getNodeAndOffset( range.end ),
		rangySel = rangy.getSelection(),
		rangyRange = rangy.createRange();

	rangyRange.setStart( start.node, start.offset );
	rangyRange.setEnd( stop.node, stop.offset );
	rangySel.setSingleRange( rangyRange, range.start !== range.from );
};

/**
 * @method
 * @returns {ve.Range} Current selection range
 */
ve.ce.Surface.prototype.getSelectionRange = function() {
	var rangySel = rangy.getSelection();

	if ( rangySel.isCollapsed ) {
		var offset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true );
		return new ve.Range( offset, offset );
	} else {
		return new ve.Range(
			this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true ),
			this.getOffset( rangySel.focusNode, rangySel.focusOffset, true )
		);
	}
};

/**
 * @method
 */
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
