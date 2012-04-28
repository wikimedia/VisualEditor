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
		.addClass( 've-ce-surface' )
		.append( this.documentView.$ );
	this.insertionAnnotations = [];
	this.emitUpdateTimeout = undefined;
	this.clipboard = {};
	this.autoRender = false;

	// Events
	this.documentView.$.on( {
		'focus': function( e ) {
			_this.documentOnFocus();
			$document.off( '.ve-ce-surface' );
			$document.on( {
				'keydown.ce-surfaceView': _this.proxy( _this.onKeyDown )
			} );
		},
		'blur': function( e ) {
			_this.documentOnBlur();
			$document.on( '.ve-ce-surface' );
		}
	} );

	this.$.on( {
		'cut copy': this.proxy( this.onCutCopy ),
		'paste': this.proxy( this.onPaste ),
		'mousedown': this.proxy( this.onMouseDown ),
		'compositionstart': this.proxy( this.onCompositionStart ),
		'compositionend': this.proxy( this.onCompositionEnd ),
		'dragover drop': function( e ) {
			e.preventDefault();
			return false;
		}
	} );

	// Initialization
	this.documentView.renderContent();

	this.poll = {
		polling: false,
		timeout: null,
		frequency: 100,
		rangy: {
			anchorNode: null,
			anchorOffset: null,
			focusNode: null,
			focusOffset: null
		},
		range: null,
		node: null,
		text: null,
		hash: null,
		composition: {
			start: null,
			end: null
		}
	};
	this.on( 'textChange', this.proxy( this.onTextChange ) );
	this.on( 'rangeChange', this.proxy( this.onRangeChange ) );

	//Prevent native contentedtiable tools
	try {
		document.execCommand("enableInlineTableEditing", false, false);
		document.execCommand("enableObjectResizing", false, false);
	} catch(e) {
	}
};

/* Methods */

ve.ce.Surface.prototype.proxy = function( func ) {
	var _this = this;
	return( function() {
		return func.apply( _this, arguments );
	});
};

ve.ce.Surface.prototype.onCompositionStart = function( e ) {
	var rangySel = rangy.getSelection();
	this.poll.composition.start = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
};

ve.ce.Surface.prototype.onCompositionEnd = function( e ) {
	var rangySel = rangy.getSelection();
	this.poll.composition.end = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
};

ve.ce.Surface.prototype.onRangeChange = function( e ) {
	if ( e.new !== null ) {
		/*	Set selection in the model so you can always get current selection with
			this.model.getSelection() */
		this.model.setSelection( e.new );

		/* Hide or show context view icon */
		this.toggleContextView();

		/* Load or clear annotations */
		if ( e.new.getLength() === 0 ) {
			this.loadInsertionAnnotations();
		} else {
			this.clearInsertionAnnotations();
		}
	}
};

ve.ce.Surface.prototype.onTextChange = function( e ) {
	var	oldOffset = null,
		newOffset = null;

	if (
		e.old.range !== null &&
		e.new.range !== null &&
		e.old.range.getLength() === 0 &&
		e.new.range.getLength() === 0
	) {
		oldOffset = e.old.range.start;
		newOffset = e.new.range.start;
	}

	var	lengthDiff = e.new.text.length - e.old.text.length,
		offsetDiff = ( newOffset !== null && oldOffset !== null ) ? newOffset - oldOffset : null,
		nodeOffset = this.documentView.getOffsetFromNode( $( e.node ).data( 'view' ) );

	if (
		lengthDiff === offsetDiff &&
		e.old.text.substring( 0, oldOffset - nodeOffset - 1 ) === e.new.text.substring( 0, oldOffset - nodeOffset - 1 )
	) {
		var data = e.new.text.substring( oldOffset - nodeOffset - 1, newOffset - nodeOffset - 1).split( '' );
		var	annotations = this.model.getDocument().getAnnotationsFromOffset( oldOffset - 1, true );
		ve.dm.DocumentNode.addAnnotationsToData( data, annotations );
		this.model.transact( this.documentView.model.prepareInsertion( oldOffset, data ) );
	} else {
		var	fromLeft = 0,
			fromRight = 0,
			len = Math.min( e.old.text.length, e.new.text.length );
		while ( fromLeft < len && e.old.text[fromLeft] === e.new.text[fromLeft] ) {
			++fromLeft;
		}
		len -= fromLeft;
		while (
			fromRight < len &&
			e.old.text[e.old.text.length - 1 - fromRight] === e.new.text[e.new.text.length - 1 - fromRight]
		) {
			++fromRight;
		}
		var	annotations = this.model.getDocument().getAnnotationsFromOffset(
			nodeOffset + 1 + fromLeft, true
		);
		if ( fromLeft + fromRight < e.old.text.length ) {
			this.model.transact( this.documentView.model.prepareRemoval( new ve.Range(
				nodeOffset + 1 + fromLeft,
				nodeOffset + 1 + e.old.text.length - fromRight
			) ) );
		}
		var data = e.new.text.substring( fromLeft, e.new.text.length - fromRight ).split( '' );
		ve.dm.DocumentNode.addAnnotationsToData( data, annotations );
		this.model.transact(
			this.documentView.model.prepareInsertion( nodeOffset + 1 + fromLeft, data )
		);
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.startPolling = function( async ) {
	if ( this.poll.polling === false ) {
		this.poll.polling = true;
		this.pollChanges( async );
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.stopPolling = function() {
	if ( this.poll.polling === true ) {
		this.poll.polling = false;
		clearTimeout( this.poll.timeout );
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.pollChanges = function( async ) {
	var _this = this;
	var delay = function( now ) {
		if ( _this.poll.polling === true ) {
			_this.poll.timeout = setTimeout(
				function() {
					_this.pollChanges();
				},
				now === true ? 0 : _this.poll.frequency
			);
		}
	};

	if ( async === true ) {
		delay( true );
		return;
	}

	if ( this.poll.composition.start !== null ) {
		if ( this.poll.composition.end !== null ) {
			this.poll.composition.start = this.poll.composition.end = null;
		} else {
			delay();
			return;
		}
	}

	var rangySel = rangy.getSelection(),
		range = this.poll.range,
		node = this.poll.node;

	if (
		rangySel.anchorNode !== this.poll.rangy.anchorNode ||
		rangySel.anchorOffset !== this.poll.rangy.anchorOffset ||
		rangySel.focusNode !== this.poll.rangy.focusNode ||
		rangySel.focusOffset !== this.poll.rangy.focusOffset
	) {
		this.poll.rangy.anchorNode = rangySel.anchorNode;
		this.poll.rangy.anchorOffset = rangySel.anchorOffset;
		this.poll.rangy.focusNode = rangySel.focusNode;
		this.poll.rangy.focusOffset = rangySel.focusOffset;

		if ( !this.documentView.$.is(':focus') ) {
			range = null;
			node = null;
		} else {
			if ( rangySel.isCollapsed ) {
				range = new ve.Range(
					this.getOffset( rangySel.anchorNode, rangySel.anchorOffset )
				);
			} else {
				range = new ve.Range(
					this.getOffset( rangySel.anchorNode, rangySel.anchorOffset ),
					this.getOffset( rangySel.focusNode, rangySel.focusOffset )
				);
			}
			node = ve.ce.Surface.getLeafNode( rangySel.anchorNode )[0];
		}
	}

	if ( this.poll.node !== node ) {
		// TODO: emit nodeChange event?
		this.poll.node = node;
		this.poll.text = ve.ce.Surface.getDOMText2( node );
		this.poll.hash = ve.ce.Surface.getDOMHash( node );
	} else {
		if ( node !== null ) {
			var	text = ve.ce.Surface.getDOMText2( node ),
				hash = ve.ce.Surface.getDOMHash( node );
			if ( this.poll.text !== text || this.poll.hash !== hash ) {
				this.emit( 'textChange', {
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
		// TODO: find a proper/better name for this event
		this.emit( 'rangeChange', { 'old': this.poll.range, 'new': range } );
		this.poll.range = range;
	}

	delay();
	return;
};

ve.ce.Surface.prototype.annotate = function( method, annotation ) {
	var selection = this.model.getSelection(),
		_this = this;

	if ( method === 'toggle' ) {
		var annotations = this.getAnnotations();
		if ( ve.dm.DocumentNode.getIndexOfAnnotation( annotations.full, annotation ) !== -1 ) {
			method = 'clear';
		} else {
			method = 'set';
		}
	}
	if ( selection.getLength() ) {
		var tx = this.model.getDocument().prepareContentAnnotation(
			selection, method, annotation
		);

		// transact with autoRender
		this.autoRender = true;
		this.model.transact( tx );
		this.autoRender = false;

		this.clearPollData();

		_this.showSelection( selection );
	} else {
		if ( method === 'set' ) {
			this.addInsertionAnnotation( annotation );
		} else if ( method === 'clear' ) {
			this.removeInsertionAnnotation( annotation );
		}
	}
};

ve.ce.Surface.prototype.getAnnotations = function() {
	return this.getSelectionRange().getLength() ?
		this.model.getDocument().getAnnotationsFromRange( this.getSelectionRange() ) :
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

ve.ce.Surface.prototype.loadInsertionAnnotations = function() {
	this.insertionAnnotations = this.model.getDocument().getAnnotationsFromOffset( this.model.getSelection().to - 1 );
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
	return;
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

ve.ce.Surface.prototype.attachContextView = function( contextView ) {
	this.contextView = contextView;
};

ve.ce.Surface.prototype.getModel = function() {
	return this.model;
};

ve.ce.Surface.prototype.toggleContextView = function( delay ) {
	var _this = this,
		selection = this.model.getSelection();
	
	function update() {
		if ( selection.getLength() > 0 ) {
			_this.clearInsertionAnnotations();
		}
		if ( _this.contextView ) {
			if ( selection.getLength() > 0 ) {
				_this.contextView.set();
			} else {
				_this.contextView.clear();
			}
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

ve.ce.Surface.prototype.documentOnFocus = function() {
	this.startPolling( true );
};

ve.ce.Surface.prototype.documentOnBlur = function() {
	this.stopPolling();
};

ve.ce.Surface.prototype.clearPollData = function() {
	/*
	this.stopPolling();
	this.poll.prevText =
		this.poll.prevHash =
		this.poll.prevOffset =
		this.poll.node = null;
	this.startPolling();
	*/
};

ve.ce.Surface.prototype.onMouseDown = function( e ) {
	//this.pollChanges();
	//this.pollChanges( true );
	return;
};

ve.ce.Surface.prototype.onKeyDown = function( e ) {
	//this.pollChanges();
	//this.pollChanges( true );
	return;

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
				nodeOffset = this.documentView.getOffsetFromNode( node );
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
				nodeOffset = this.documentView.getOffsetFromNode( node );
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
	if ( range.getLength() !== 0 && this.poll.compositionStart === null) {
		e.preventDefault();
	}
};

ve.ce.Surface.prototype.getOffset = function( elem, offset, global ) {
	var global  = true;
	var	$leafNode = ve.ce.Surface.getLeafNode( elem );
	if ( $leafNode === null ) {
		return;
	}
	var current = [$leafNode.contents(), 0],
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

ve.ce.Surface.prototype.getSelectionRect = function() {
	var rangySel = rangy.getSelection();
	return {
		start: rangySel.getStartDocumentPos(),
		end: rangySel.getEndDocumentPos()
	};
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
		rangySel = rangy.getSelection(),
		rangyRange = rangy.createRange();

	rangyRange.setStart( start.node, start.offset );
	rangyRange.setEnd( stop.node, stop.offset );
	rangySel.removeAllRanges();
	rangySel.addRange( rangyRange, range.start !== range.from );
};

ve.ce.Surface.getLeafNode = function( elem ) {
	var $leaf = $( elem ).closest( '.ve-ce-leafNode' );
	return $leaf.length ? $leaf : null;
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
	this.showCursor(cursorAt);
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
	this.showCursor(selection.to);
	var _this = this;
	setTimeout( function() {
		_this.poll.prevText = _this.poll.prevHash = _this.poll.prevOffset = _this.poll.node = null;
		_this.startPolling();
	}, 0 );
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );