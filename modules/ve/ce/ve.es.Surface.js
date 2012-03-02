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
	this.clipboard = {};

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
		});

	// Initialization
	this.documentView.renderContent();

	this.poll = {
		interval: null,
		frequency: 75,
		node: null,
		prevText: null,
		prevHash: null,
		prevOffset: null,
		compositionStart: null,
		compositionEnd: null
	};
};

/* Methods */

ve.es.Surface.prototype.onCutCopy = function( e ) {
	var _this = this,
		rangySel = rangy.getSelection(),
		key = rangySel.getRangeAt(0).toString().replace(/\s/gm,"");

	_this.clipboard[key] = ve.copyArray( _this.documentView.model.getData( _this.getSelection() ) );

	if ( event.type == 'cut' ) {
		setTimeout( function() {
			// we don't like how browsers cut, so let's undo it and do it ourselves.
			document.execCommand('undo', false, false);
			
			var selection = _this.getSelection(),
				node = rangy.getSelection().anchorNode;
			
			// transact
			var tx = _this.model.getDocument().prepareRemoval( selection );
			_this.model.transact( tx );

			// re-render
			_this.getLeafNode( node ).data( 'view' ).renderContent();
			
			// clear the prev information from poll object (probably a better way to do this)
			_this.poll.prevText = _this.poll.prevHash = _this.poll.prevOffset = _this.poll.node = null;

			// place cursor
			_this.showCursorAt( selection.start );
		}, 1 );
	}
};

ve.es.Surface.prototype.onPaste = function( e ) {
	var	_this = this,
		insertionPoint = _this.getSelection().start,
		node = rangy.getSelection().anchorNode;
	
	$('#paste').html('').show().css( 'top', $(window).scrollTop() ).css(' left', $(window).scrollLeft() ).focus();

	setTimeout( function() {
		var key = $('#paste').hide().text().replace(/\s/gm,"");

		if ( _this.clipboard[key] ) {
			// transact
			var tx = _this.documentView.model.prepareInsertion( insertionPoint, _this.clipboard[key]);
			_this.model.transact( tx );

			// re-render
			_this.getLeafNode( node ).data( 'view' ).renderContent();

			// clear the prev information from poll object (probably a better way to do this)
			_this.poll.prevText = _this.poll.prevHash = _this.poll.prevOffset = _this.poll.node = null;

			// place cursor
			_this.showCursorAt( insertionPoint + _this.clipboard[key].length );
		} else {
			alert('i can only handle copy/paste from hybrid surface. sorry. :(');
		}
	}, 1 );
};

ve.es.Surface.prototype.onCompositionStart = function( e ) {
	this.stopPolling();
	var rangySel = rangy.getSelection();
	this.poll.compositionStart = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, false );
};

ve.es.Surface.prototype.onCompositionEnd = function( e ) {
	var rangySel = rangy.getSelection();
	this.poll.compositionEnd = this.getOffset( rangySel.focusNode, rangySel.focusOffset, false );
	this.startPolling();
};

ve.es.Surface.prototype.attachContextView = function( contextView ) {
	this.contextView = contextView;
};

ve.es.Surface.prototype.getModel = function() {
	return this.model;
};

ve.es.Surface.prototype.documentOnFocus = function() {
	this.startPolling();
};

ve.es.Surface.prototype.documentOnBlur = function() {
	this.stopPolling();
};

ve.es.Surface.prototype.startPolling = function() {
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

ve.es.Surface.prototype.stopPolling = function() {
	if ( this.poll.interval !== null ) {
		clearInterval( this.poll.interval );
		this.poll.interval = null;
	}
};

ve.es.Surface.prototype.pollContent = function() {
	var localOffset, text, hash;

	if ( this.poll.compositionStart !== null && this.poll.compositionEnd !== null ) {

		text = ve.es.Surface.getDOMText2( this.poll.node );
		hash = ve.es.Surface.getDOMHash( this.poll.node );
		localOffset = this.poll.compositionEnd;
		this.poll.compositionStart = null;
		this.poll.compositionEnd = null;

	} else {
		var rangySel = rangy.getSelection();

		if ( rangySel.anchorNode === null ) {
			return;
		}

		var	node = this.getLeafNode( rangySel.anchorNode )[0];
		text = ve.es.Surface.getDOMText2( node );
		hash = ve.es.Surface.getDOMHash( node );

		if ( rangySel.anchorNode !== rangySel.focusNode || rangySel.anchorOffset !== rangySel.focusOffset ) {
			localOffset = null;
		} else {
			localOffset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, false );
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
			offsetDiff = ( localOffset !== null && this.poll.prevOffset !== null ) ? localOffset - this.poll.prevOffset : null;

		if ( lengthDiff === offsetDiff && this.poll.prevText.substring( 0, this.poll.prevOffset ) === text.substring( 0, this.poll.prevOffset ) ) {
			newData = text.substring( this.poll.prevOffset, localOffset ).split( '' );
			annotations = this.model.getDocument().getAnnotationsFromOffset( nodeOffset + 1 + this.poll.prevOffset - 1, true );
			ve.dm.DocumentNode.addAnnotationsToData( newData, annotations );
			this.model.transact( this.documentView.model.prepareInsertion(
				nodeOffset + 1 + this.poll.prevOffset,
				newData
			) );
		} else {
			var	sameFromLeft = 0,
				sameFromRight = 0,
				l = text.length > this.poll.prevText.length ? this.poll.prevText.length : text.length;
			while ( sameFromLeft < l && this.poll.prevText[sameFromLeft] === text[sameFromLeft] ) {
				++sameFromLeft;
			}
			l = l - sameFromLeft;
            while ( sameFromRight < l && this.poll.prevText[this.poll.prevText.length - 1 - sameFromRight] === text[text.length - 1 - sameFromRight] ) {
                ++sameFromRight;
			}
			annotations = this.model.getDocument().getAnnotationsFromOffset( nodeOffset + 1 + sameFromLeft, true );
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

ve.es.Surface.prototype.onMouseDown = function( e ) {
	if ( this.poll.interval !== null ) {
		this.stopPolling();
		this.pollContent();
		this.startPolling();
	}
};

ve.es.Surface.prototype.onKeyDown = function( e ) {
	if ( this.poll.interval !== null ) {
		this.stopPolling();
		this.pollContent();
		this.startPolling();
	}
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
			var rangySel = rangy.getSelection();
			if (  rangySel.anchorOffset === 0 ) {
				var	globalOffset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true ),
					node = this.documentView.getNodeFromOffset( globalOffset ),
					nodeOffset = surfaceView.documentView.getOffsetFromNode( node );
				if ( nodeOffset + 1 === globalOffset ) {
					var newOffset = this.documentView.model.getRelativeContentOffset( globalOffset, -1 );
					this.showCursorAt(newOffset);
					e.preventDefault();
				}
			}
			break;
		// Right arrow
		case 39:
			var rangySel = rangy.getSelection();
			if ( rangySel.anchorOffset === rangySel.anchorNode.length ) {
				var	globalOffset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true ),
					node = this.documentView.getNodeFromOffset( globalOffset ),
					nodeOffset = surfaceView.documentView.getOffsetFromNode( node );
				if ( nodeOffset + 1 + node.getContentLength() === globalOffset ) {
					var newOffset = this.documentView.model.getRelativeContentOffset( globalOffset, 1 );
					this.showCursorAt(newOffset);
					e.preventDefault();
				}
			}
			break;
	}
	var range = this.getSelection();
	if ( range.getLength() !== 0 ) {
		e.preventDefault();
	}
};

ve.es.Surface.prototype.getOffset = function( elem, offset, global ) {
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
			if ( $( item ).attr( 'contentEditable' ) === "false" ) {
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

ve.es.Surface.prototype.showCursorAt = function( offset ) {
	var	$node = this.documentView.getNodeFromOffset( offset ).$,
		current = [$node.contents(), 0],
		stack = [current],
		node,
		localOffset,
		index = this.documentView.getOffsetFromNode( $node.data('view') ) + 1;

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
			if ( offset >= index && offset <= index + length ) {
				node = item;
				localOffset = offset - index;
				break;
			} else {
				index += length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $( item ).attr('contentEditable') === "false" ) {
				index += 1;
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}
	var range = document.createRange();
	range.collapsed = true;
	range.setStart( node, localOffset );
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange( range );
};

ve.es.Surface.prototype.getSelection = function() {
	var rangySel = rangy.getSelection(),
		range;

	if ( rangySel.anchorNode === rangySel.focusNode && rangySel.anchorOffset === rangySel.focusOffset ) {
		var offset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true );
		range = new ve.Range( offset, offset );
	} else {
		range = new ve.Range(
			this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true ),
			this.getOffset( rangySel.focusNode, rangySel.focusOffset, true )
		);
	}
	range.normalize();
	return range;
};

ve.es.Surface.prototype.getLeafNode = function( elem ) {
	var	$node = $( elem );
	while( !$node.hasClass( 'ce-leafNode' ) ) {
		$node = $node.parent();
	}
	return $node;
};
		
ve.es.Surface.getDOMText2 = function( elem ) {
	// TODO: there must be some better way to write this regex replace
	var regex = new RegExp("[" + String.fromCharCode(32) + String.fromCharCode(160) + "]", "g");		
	return ve.es.Surface.getDOMText( elem ).replace( regex, " " );
};

ve.es.Surface.getDOMText = function( elem ) {
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
                ret += ve.es.Surface.getDOMText( elem );
            }
        }
    } else if ( nodeType === 3 || nodeType === 4 ) {
        return elem.nodeValue;
    }

    return ret;
};

ve.es.Surface.getDOMHash = function( elem ) {
    var nodeType = elem.nodeType,
		nodeName = elem.nodeName,
        ret = '';

	if ( nodeType === 3 || nodeType === 4 ) {
		return '#';
	} else if ( nodeType === 1 || nodeType === 9 ) {
		ret += '<' + nodeName + '>';
		// Traverse it's children
		for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
			ret += ve.es.Surface.getDOMHash( elem );
        }
        ret += '</' + nodeName + '>';
	}
	return ret;
};

ve.es.Surface.prototype.handleDelete = function( backspace, isPartial ) {
	this.stopPolling();
	var selection = this.getSelection().clone(),
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
			sourceSplitableNode = ve.es.Node.getSplitableNode( sourceNode );
			targetSplitableNode = ve.es.Node.getSplitableNode( targetNode );
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

ve.es.Surface.prototype.handleEnter = function() {
	this.stopPolling();
	var selection = this.getSelection().clone(),
		tx;
	if ( selection.from !== selection.to ) {
		this.handleDelete( false, true );
	}
	var	node = this.documentView.getNodeFromOffset( selection.to, false ),
		nodeOffset = this.documentView.getOffsetFromNode( node, false );

	if (
		nodeOffset + node.getContentLength() + 1 === selection.to &&
		node ===  ve.es.Node.getSplitableNode( node )
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
				ve.es.DocumentNode.splitRules[ elementType ].children === true
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
			splitable = ve.es.DocumentNode.splitRules[ elementType ].self;
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

ve.extendClass( ve.es.Surface, ve.EventEmitter );