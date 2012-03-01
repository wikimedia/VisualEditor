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
	this.documentView.$.bind( {
		'focus': function( e ) {
			_this.documentOnFocus();
			$document.unbind( '.ce-surfaceView' );
			$document.bind( {
				'keydown.ce-surfaceView': function( e ) {
//					return _this.onKeyDown( e );
				},
			} );
		},
		'blur': function( e ) {
			_this.documentOnBlur();
			$document.unbind( '.ce-surfaceView' );
		}
	} );

	this.$.mousedown( function(e) {
//		return _this.onMouseDown( e );
	} );

	// Initialization
	this.documentView.renderContent();

	// Prevent dragging text
	this.$.bind('dragover drop', function(e) {
		e.preventDefault();
	});

	this.poll = {
		interval: null,
		frequency: 100,
		node: null,
		prevText: null,
		prevHash: null,
		prevOffset: null,
		compositionStart: null,
		compositionEnd: null
	};

	document.addEventListener( 'compositionstart', function( e ) {
		_this.onCompositionStart( e );
	} );
	document.addEventListener( 'compositionend', function( e ) {
		_this.onCompositionEnd( e );
	} );
};

/* Methods */

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
		this.poll.interval = setInterval( function() {
			_this.pollContent();
		}, this.poll.frequency );
		this.pollContent();
	}
};

ve.es.Surface.prototype.stopPolling = function() {
	if ( this.poll.interval !== null ) {
		clearInterval( this.poll.interval );
		this.poll.interval = null;
	}
};

ve.es.Surface.prototype.pollContent = function() {
	if ( this.poll.compositionStart !== null && this.poll.compositionEnd !== null ) {

		var	text = ve.es.Surface.getDOMText2( this.poll.node ),
			hash = ve.es.Surface.getDOMHash( this.poll.node ),
			localOffset = this.poll.compositionEnd;
		this.poll.compositionStart = null;
		this.poll.compositionEnd = null;

	} else {
		var rangySel = rangy.getSelection();

		if ( rangySel.anchorNode === null ) {
			return;
		}

		var	node = this.getLeafNode( rangySel.anchorNode )[0],
			text = ve.es.Surface.getDOMText2( node ),
			hash = ve.es.Surface.getDOMHash( node );

		if ( rangySel.anchorNode !== rangySel.focusNode || rangySel.anchorOffset !== rangySel.focusOffset ) {
			var localOffset = null;
		} else {
			var localOffset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, false );
		}

		if ( node !== this.poll.node ) {
			this.poll.node = node;
			this.poll.prevText = text;
			this.poll.prevHash = hash;
			this.poll.prevOffset = localOffset;
			return;
		}
	}

	if ( text !== this.poll.prevText ) {
		var	nodeOffset = this.documentView.getOffsetFromNode( $( this.poll.node ).data( 'view' ) ),
			lengthDiff = text.length - this.poll.prevText.length,
			offsetDiff = ( localOffset !== null && this.poll.prevOffset !== null ) ? localOffset - this.poll.prevOffset : null;

		if ( lengthDiff === offsetDiff && this.poll.prevText.substring( 0, this.poll.prevOffset ) === text.substring( 0, this.poll.prevOffset ) ) {
			var newData = text.substring( this.poll.prevOffset, localOffset ).split( '' );
			var annotations = this.model.getDocument().getAnnotationsFromOffset( nodeOffset + 1 + this.poll.prevOffset - 1 );
			ve.dm.DocumentNode.addAnnotationsToData( newData, annotations );
			this.model.transact( this.documentView.model.prepareInsertion(
				nodeOffset + 1 + this.poll.prevOffset,
				newData
			) );
		} else {
			var	sameFromLeft = 0,
				sameFromRight = 0,
				l = text.length > this.poll.prevText.length ? this.poll.prevText.length : text.length;
			while ( sameFromLeft < l && this.poll.prevText[sameFromLeft] == text[sameFromLeft] ) {
				++sameFromLeft;
			}
			l = l - sameFromLeft;
            while ( sameFromRight < l && this.poll.prevText[this.poll.prevText.length - 1 - sameFromRight] == text[text.length - 1 - sameFromRight] ) {
                ++sameFromRight;
			}
			this.model.transact( this.documentView.model.prepareRemoval( new ve.Range(
				nodeOffset + 1 + sameFromLeft,
				nodeOffset + 1 + this.poll.prevText.length - sameFromRight
			) ) );
			var newData = text.substring( sameFromLeft, text.length - sameFromRight ).split( '' ); 
			var annotations = this.model.getDocument().getAnnotationsFromOffset( nodeOffset + 1 + sameFromLeft );
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
	var $node = this.documentView.getNodeFromOffset( offset ).$;
	var current = [$node.contents(), 0];
	var stack = [current];
	var node;
	var localOffset;
	
	var index = 1 + this.documentView.getOffsetFromNode( $node.data('view') );
		
	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		var item = current[0][current[1]];
		var $item = current[0].eq( current[1] );
		
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
	range.setStart(node, localOffset);

	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
};

ve.es.Surface.prototype.getSelection = function() {
	var rangySel = rangy.getSelection();

	if ( rangySel.anchorNode === rangySel.focusNode && rangySel.anchorOffset === rangySel.focusOffset ) {
		var offset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true );
		return new ve.Range( offset, offset );
	} else {
		return new ve.Range(
			this.getOffset( rangySel.anchorNode, rangySel.anchorOffset, true ),
			this.getOffset( rangySel.focusNode, rangySel.focusOffset, true )
		);
	}
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
		for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
        	ret += ve.es.Surface.getDOMHash( elem );
        }
        ret += '</' + nodeName + '>';
	}
	return ret;
};

/* Inheritance */

ve.extendClass( ve.es.Surface, ve.EventEmitter );
