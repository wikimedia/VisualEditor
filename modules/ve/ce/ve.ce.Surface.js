/**
 * Creates an ve.ce.Surface object.
 *
 * @class
 * @constructor
 * @param {jQuery} $container DOM Container to render surface into
 * @param {ve.dm.Surface} model Surface model to view
 */
ve.ce.Surface = function( $container, model ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// References for use in closures
	var	_this = this,
		$document = $( document ),
		$window = $( window );
	
	// Properties
	this.model = model;
	this.documentView = new ve.ce.DocumentNode( this.model.getDocument(), this );
	this.contextView = null;
	this.$ = $container
		.addClass( 'es-surfaceView' )
		.append( this.documentView.$ );
	this.insertionAnnotations = [];
	this.emitUpdateTimeout = undefined;
	this.clipboard = {};
	this.autoRender = false;

	// Events
	this.documentView.$.bind( {
		'focus': function( e ) {
			_this.documentOnFocus();
			$document.unbind( '.ce-surfaceView' );
			$document.bind( {
				'keydown.ce-surfaceView': function( e ) {
					return _this.onKeyDown( e );
				}
			} );
		},
		'blur': function( e ) {
			_this.documentOnBlur();
			$document.unbind( '.ce-surfaceView' );
		}
	} );

	this.$
		.on( 'cut copy', function( e ) {
			_this.onCutCopy( e );
		} )
		.on( 'paste', function( e ) {
			_this.onPaste( e );
		} )
		.on( 'mousedown', function( e ) {
			 return _this.onMouseDown( e );
		} )
		.on( 'compositionstart', function( e ) {
			console.log('comp start');
			_this.onCompositionStart( e );
		} )
		.on( 'compositionend', function( e ) {
			console.log('comp end');
			_this.onCompositionEnd( e );
		} )
		.on('dragover drop', function( e ) {
			e.preventDefault();
		} );

	// Initialization
	this.documentView.renderContent();

	this.poll = {
		'interval': null,
		'frequency': 75,
		'node': null,
		'prevText': null,
		'prevHash': null,
		'prevOffset': null,
		'compositionStart': null,
		'compositionEnd': null
	};
};

/* Methods */

ve.ce.Surface.prototype.annotate = function( method, annotation ) {
	var range = this.getSelectionRange(),
		_this = this;

	if ( method === 'toggle' ) {
		var annotations = this.getAnnotations();
		if ( ve.dm.DocumentNode.getIndexOfAnnotation( annotations.full, annotation ) !== -1 ) {
			method = 'clear';
		} else {
			method = 'set';
		}
	}
	if ( range.getLength() ) {
		var tx = this.model.getDocument().prepareContentAnnotation(
			range, method, annotation
		);

		// transact with autoRender
		this.autoRender = true;
		this.model.transact( tx );
		this.autoRender = false;

		this.clearPollData();

		_this.showSelection( range );
	} else {
		if ( method === 'set' ) {
			this.addInsertionAnnotation( annotation );
		} else if ( method === 'clear' ) {
			this.removeInsertionAnnotation( annotation );
		}
	}
};

ve.ce.Surface.prototype.getAnnotations = function() {
	return this.getSelection().getLength() ?
		this.model.getDocument().getAnnotationsFromRange( this.getSelection() ) :
		{
			'full': this.insertionAnnotations,
			'partial': [],
			'all': this.insertionAnnotations
		};
};

ve.ce.Surface.prototype.getInsertionAnnotations = function() {
	return this.insertionAnnotations;
};

ve.ce.Surface.prototype.addInsertionAnnotation = function( annotation ) {
	this.insertionAnnotations.push( annotation );
};

ve.ce.Surface.prototype.loadInsertionAnnotations = function( annotation ) {
	this.insertionAnnotations =
		this.model.getDocument().getAnnotationsFromOffset( this.getSelection().to - 1 );
	// Filter out annotations that aren't textStyles or links
	for ( var i = 0; i < this.insertionAnnotations.length; i++ ) {
		if ( !this.insertionAnnotations[i].type.match( /(textStyle\/|link\/)/ ) ) {
			this.insertionAnnotations.splice( i, 1 );
			i--;
		}
	}
};

ve.ce.Surface.prototype.removeInsertionAnnotation = function( annotation ) {
	var index = ve.dm.DocumentNode.getIndexOfAnnotation( this.insertionAnnotations, annotation );
	if ( index !== -1 ) {
		this.insertionAnnotations.splice( index, 1 );
	}
};

ve.ce.Surface.prototype.clearInsertionAnnotations = function() {
	this.insertionAnnotations = [];
};

ve.ce.Surface.prototype.onCutCopy = function( e ) {
	var _this = this,
		sel = rangy.getSelection(),
		key = sel.getRangeAt(0).toString().replace( /\s/gm, '' );

	_this.clipboard[key] = ve.copyArray(
		_this.documentView.model.getData( _this.getSelectionRange() )
	);

	if ( event.type == 'cut' ) {
		setTimeout( function() {
			// we don't like how browsers cut, so let's undo it and do it ourselves.
			document.execCommand('undo', false, false);
			
			var selection = _this.getSelectionRange();
			
			// transact
			var tx = _this.model.getDocument().prepareRemoval( selection );
			
			_this.autoRender = true;
			_this.model.transact( tx );
			_this.autoRender = false;
			
			_this.clearPollData();

			// place cursor
			_this.showCursor( selection.start );
		}, 1 );
	}
};

ve.ce.Surface.prototype.onPaste = function( e ) {
	var	_this = this,
		insertionPoint = _this.getSelectionRange().start;
	
	$('#paste')
		.html('')
		.show()
		.css( 'top', $(window).scrollTop() )
		.css( 'left', $(window).scrollLeft() )
		.focus();

	setTimeout( function() {
		var key = $('#paste').hide().text().replace( /\s/gm, '' );

		if ( _this.clipboard[key] ) {
			// transact
			var tx = _this.documentView.model.prepareInsertion(
				insertionPoint, _this.clipboard[key]
			);
			_this.autoRender = true;
			_this.model.transact( tx );
			_this.autoRender = false;

			_this.clearPollData();

			// place cursor
			_this.showCursor( insertionPoint + _this.clipboard[key].length );
		} else {
			alert('i can only handle copy/paste from hybrid surface. sorry. :(');
		}
	}, 1 );
};

ve.ce.Surface.prototype.onCompositionStart = function( e ) {
	this.stopPolling();
	var sel = rangy.getSelection();
	this.poll.compositionStart = this.getOffset( sel.anchorNode, sel.anchorOffset, false );
};

ve.ce.Surface.prototype.onCompositionEnd = function( e ) {
	var sel = rangy.getSelection();
	this.poll.compositionEnd = this.getOffset( sel.focusNode, sel.focusOffset, false );
	this.startPolling();
};

ve.ce.Surface.prototype.attachContextView = function( contextView ) {
	this.contextView = contextView;
};

ve.ce.Surface.prototype.getModel = function() {
	return this.model;
};

ve.ce.Surface.prototype.documentOnFocus = function() {
	this.startPolling();
};

ve.ce.Surface.prototype.documentOnBlur = function() {
	this.stopPolling();
};

ve.ce.Surface.prototype.startPolling = function() {
	if ( this.poll.interval === null ) {
		var _this = this;
		setTimeout( function()  {
			_this.pollContent();
		}, 0);
		this.poll.interval = setInterval( function() {
			_this.pollContent();
		}, this.poll.frequency );
	}
};

ve.ce.Surface.prototype.stopPolling = function() {
	if ( this.poll.interval !== null ) {
		clearInterval( this.poll.interval );
		this.poll.interval = null;
	}
};

ve.ce.Surface.prototype.clearPollData = function() {
	this.stopPolling();
	this.poll.prevText =
		this.poll.prevHash =
		this.poll.prevOffset =
		this.poll.node = null;
	this.startPolling();
};

ve.ce.Surface.prototype.pollContent = function() {
	var localOffset, text, hash;

	if ( this.poll.compositionStart !== null && this.poll.compositionEnd !== null ) {

		text = ve.ce.Surface.getDOMText2( this.poll.node );
		hash = ve.ce.Surface.getDOMHash( this.poll.node );
		localOffset = this.poll.compositionEnd;
		this.poll.compositionStart = null;
		this.poll.compositionEnd = null;

	} else {
		var sel = rangy.getSelection();

		if ( sel.anchorNode === null ) {
			return;
		}

		var	node = this.getLeafNode( sel.anchorNode )[0];
		text = ve.ce.Surface.getDOMText2( node );
		hash = ve.ce.Surface.getDOMHash( node );

		if ( sel.anchorNode !== sel.focusNode || sel.anchorOffset !== sel.focusOffset ) {
			localOffset = null;
		} else {
			localOffset = this.getOffset( sel.anchorNode, sel.anchorOffset, false );
		}

		if ( node !== this.poll.node ) {
			// TODO: Read content from old node one more time
			this.poll.node = node;
			this.poll.prevText = text;
			this.poll.prevHash = hash;
			this.poll.prevOffset = localOffset;
			return;
		}
	}
	
	var newData, annotations;

	if ( text !== this.poll.prevText ) {
		var	nodeOffset = this.documentView.getOffsetFromNode( $( this.poll.node ).data( 'view' ) ),
			lengthDiff = text.length - this.poll.prevText.length,
			offsetDiff = ( localOffset !== null && this.poll.prevOffset !== null ) ?
				localOffset - this.poll.prevOffset : null;

		if (
			lengthDiff === offsetDiff &&
			this.poll.prevText.substring( 0, this.poll.prevOffset ) ===
				text.substring( 0, this.poll.prevOffset )
		) {
			newData = text.substring( this.poll.prevOffset, localOffset ).split( '' );
			annotations = this.model.getDocument().getAnnotationsFromOffset(
				nodeOffset + 1 + this.poll.prevOffset - 1, true
			);
			ve.dm.DocumentNode.addAnnotationsToData( newData, annotations );
			this.model.transact( this.documentView.model.prepareInsertion(
				nodeOffset + 1 + this.poll.prevOffset,
				newData
			) );
		} else {
			var	sameFromLeft = 0,
				sameFromRight = 0,
				l = text.length > this.poll.prevText.length ?
					this.poll.prevText.length : text.length;
			while ( sameFromLeft < l && this.poll.prevText[sameFromLeft] === text[sameFromLeft] ) {
				++sameFromLeft;
			}
			l = l - sameFromLeft;
			while (
				sameFromRight < l &&
				this.poll.prevText[this.poll.prevText.length - 1 - sameFromRight] ===
					text[text.length - 1 - sameFromRight]
			) {
				++sameFromRight;
			}
			annotations = this.model.getDocument().getAnnotationsFromOffset(
				nodeOffset + 1 + sameFromLeft, true
			);
			this.model.transact( this.documentView.model.prepareRemoval( new ve.Range(
				nodeOffset + 1 + sameFromLeft,
				nodeOffset + 1 + this.poll.prevText.length - sameFromRight
			) ) );
			newData = text.substring( sameFromLeft, text.length - sameFromRight ).split( '' );
			ve.dm.DocumentNode.addAnnotationsToData( newData, annotations );
			this.model.transact( this.documentView.model.prepareInsertion(
				nodeOffset + 1 + sameFromLeft,
				newData
			) );
		}
		this.poll.prevText = text;
	}
	if ( hash !== this.poll.prevHash ) {
		// TODO: redisplay cursor in correct position (with setTimeout)
		this.getLeafNode( this.poll.node ).data( 'view' ).renderContent();
		this.poll.prevHash = hash;
	}
	
	this.poll.prevOffset = localOffset;
};

ve.ce.Surface.prototype.onMouseDown = function( e ) {
	if ( this.poll.interval !== null ) {
		this.stopPolling();
		this.pollContent();
		this.startPolling();
	}
};

ve.ce.Surface.prototype.onKeyDown = function( e ) {
	if ( this.poll.interval !== null ) {
		this.stopPolling();
		this.pollContent();
		this.startPolling();
	}
	var sel,
		globalOffset,
		newOffset,
		node,
		nodeOffset;
	switch ( e.keyCode ) {
		// Enter
		case 13:
			this.handleEnter();
			e.preventDefault();
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
		// Left arrow
		case 37:
			sel = rangy.getSelection();
			if (  sel.anchorOffset === 0 ) {
				globalOffset = this.getOffset( sel.anchorNode, sel.anchorOffset, true );
				node = this.documentView.getNodeFromOffset( globalOffset );
				nodeOffset = surfaceView.documentView.getOffsetFromNode( node );
				if ( nodeOffset + 1 === globalOffset ) {
					newOffset = this.documentView.model.getRelativeContentOffset(
						globalOffset, -1
					);
					this.showCursor(newOffset);
					e.preventDefault();
				}
			}
			break;
		// Right arrow
		case 39:
			sel = rangy.getSelection();
			if ( sel.anchorOffset === sel.anchorNode.length ) {
				globalOffset = this.getOffset( sel.anchorNode, sel.anchorOffset, true );
				node = this.documentView.getNodeFromOffset( globalOffset );
				nodeOffset = surfaceView.documentView.getOffsetFromNode( node );
				if ( nodeOffset + 1 + node.getContentLength() === globalOffset ) {
					newOffset = this.documentView.model.getRelativeContentOffset(
						globalOffset, 1
					);
					this.showCursor(newOffset);
					e.preventDefault();
				}
			}
			break;
	}
	var range = this.getSelectionRange();
	if ( range.getLength() !== 0 ) {
		e.preventDefault();
	}
};

ve.ce.Surface.prototype.getOffset = function( elem, offset, global ) {
	var	$leafNode = this.getLeafNode( elem ),
		current = [$leafNode.contents(), 0],
		stack = [current],
		localOffset = 0;

	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		var item = current[0][current[1]];
		var $item = current[0].eq( current[1] );
		
		if ( item.nodeType === 3 ) {
			if ( item === elem ) {
				localOffset += offset;
				break;
			} else {
				localOffset += item.textContent.length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $( item ).attr( 'contentEditable' ) === 'false' ) {
				offset += 1;
			} else {
				if ( item === elem ) {
					localOffset += offset;
					break;
				}
			
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}
	if ( global === true ) {
		return this.documentView.getOffsetFromNode( $leafNode.data( 'view' ) ) + 1 + localOffset;
	} else {
		return localOffset;
	}
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

ve.ce.Surface.prototype.getDOMNodeAndOffset = function( offset ) {
	var	$node = this.documentView.getNodeFromOffset( offset ).$,
		nodeOffset = this.documentView.getOffsetFromNode( $node.data('view') ) + 1,
		current = [$node.contents(), 0],
		stack = [current],
		localNode,
		localOffset;

	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		var	item = current[0][current[1]],
			$item = current[0].eq( current[1] );
		
		if ( item.nodeType === 3 ) {
			var length = item.textContent.length;
			if ( offset >= nodeOffset && offset <= nodeOffset + length ) {
				return {
					node: item,
					offset: offset - nodeOffset
				};
			} else {
				nodeOffset += length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $( item ).attr('contentEditable') === 'false' ) {
				nodeOffset += 1;
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}
	return null;
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
	var	start = this.getDOMNodeAndOffset( range.start ),
		stop = this.getDOMNodeAndOffset( range.end ),
		sel = rangy.getSelection();
	// FIXME: Shadowing range, really?
	range = rangy.createRange();
	range.setStart( start.node, start.offset );
	range.setEnd( stop.node, stop.offset );
	sel.setSingleRange( range );
};

ve.ce.Surface.prototype.getLeafNode = function( elem ) {
	var	$node = $( elem );
	while( !$node.hasClass( 'ce-leafNode' ) ) {
		$node = $node.parent();
	}
	return $node;
};
		
ve.ce.Surface.getDOMText2 = function( elem ) {
	// TODO: there must be some better way to write this regex replace
	var regex = new RegExp('[' + String.fromCharCode(32) + String.fromCharCode(160) + ']', 'g');
	return ve.ce.Surface.getDOMText( elem ).replace( regex, ' ' );
};

ve.ce.Surface.getDOMText = function( elem ) {
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
				ret += ve.ce.Surface.getDOMText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}

	return ret;
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

ve.ce.Surface.prototype.handleDelete = function( backspace, isPartial ) {
	this.stopPolling();
	this.clearPollData();
	var selection = this.getSelectionRange().clone(),
		sourceOffset,
		targetOffset,
		sourceSplitableNode,
		targetSplitableNode,
		tx,
		cursorAt;
//	this.resetText();
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
			sourceSplitableNode = ve.ce.Node.getSplitableNode( sourceNode );
			targetSplitableNode = ve.ce.Node.getSplitableNode( targetNode );
		}

		cursorAt = targetOffset;
		
		if ( sourceNode === targetNode ||
			( typeof sourceSplitableNode !== 'undefined' &&
			sourceSplitableNode.getParent()  === targetSplitableNode.getParent() ) ) {
			tx = this.model.getDocument().prepareRemoval(
				new ve.Range( targetOffset, sourceOffset )
			);
			this.model.transact( tx );
		} else {
			tx = this.model.getDocument().prepareInsertion(
				targetOffset, sourceNode.model.getContentData()
			);
			this.model.transact( tx );
			
			var nodeToDelete = sourceNode;
			ve.Node.traverseUpstream( nodeToDelete, function( node ) {
				if ( node.getParent().children.length === 1 ) {
					nodeToDelete = node.getParent();
					return true;
				} else {
					return false;
				}
			} );
			var range = new ve.Range();
			range.from = this.documentView.getOffsetFromNode( nodeToDelete, false );
			range.to = range.from + nodeToDelete.getElementLength();
			tx = this.model.getDocument().prepareRemoval( range );
			this.model.transact( tx  );
		}
	} else {
		// selection removal
		tx = this.model.getDocument().prepareRemoval( selection );
		this.model.transact( tx );
		cursorAt = selection.start;
	}
	this.documentView.renderContent();
	this.showCursorAt(cursorAt);
	var _this = this;
	setTimeout( function() {
		_this.poll.prevText = _this.poll.prevHash = _this.poll.prevOffset = _this.poll.node = null;
		_this.startPolling();
	}, 0 );
	
};

ve.ce.Surface.prototype.handleEnter = function() {
	this.stopPolling();
	var selection = this.getSelectionRange().clone(),
		tx;
	if ( selection.from !== selection.to ) {
		this.handleDelete( false, true );
	}
	var	node = this.documentView.getNodeFromOffset( selection.to, false ),
		nodeOffset = this.documentView.getOffsetFromNode( node, false );

	if (
		nodeOffset + node.getContentLength() + 1 === selection.to &&
		node ===  ve.ce.Node.getSplitableNode( node )
	) {
		tx = this.documentView.model.prepareInsertion(
			nodeOffset + node.getElementLength(),
			[ { 'type': 'paragraph' }, { 'type': '/paragraph' } ]
		);
		this.model.transact( tx );
		selection.from = selection.to = nodeOffset + node.getElementLength() + 1;
	} else {
		var	stack = [],
			splitable = false;

		ve.Node.traverseUpstream( node, function( node ) {
			var elementType = node.model.getElementType();
			if (
				splitable === true &&
				ve.ce.DocumentNode.splitRules[ elementType ].children === true
			) {
				return false;
			}
			stack.splice(
				stack.length / 2,
				0,
				{ 'type': '/' + elementType },
				{
					'type': elementType,
					'attributes': ve.copyObject( node.model.element.attributes )
				}
			);
			splitable = ve.ce.DocumentNode.splitRules[ elementType ].self;
			return true;
		} );
		tx = this.documentView.model.prepareInsertion( selection.to, stack );
		this.model.transact( tx );
		selection.from = selection.to =
			this.model.getDocument().getRelativeContentOffset( selection.to, 1 );
	}
	this.documentView.renderContent();
	this.showCursorAt(selection.to);
	var _this = this;
	setTimeout( function() {
		_this.poll.prevText = _this.poll.prevHash = _this.poll.prevOffset = _this.poll.node = null;
		_this.startPolling();
	}, 0 );
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );