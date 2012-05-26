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
		'mousedown': this.proxy( this.onMouseDown ),
		'mouseup': this.proxy( this.onMouseUp ),
		'mousemove': this.proxy( this.onMouseMove ),
		'cut copy': this.proxy( this.onCutCopy ),
		'beforepaste paste': this.proxy( this.onPaste ),
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

ve.ce.Surface.prototype.onMouseDown = function( e ) {
	this.isMouseDown = true;

	var $closestLeaf = $( e.target ).closest( '.ve-ce-leafNode' );

	if ( $closestLeaf.length > 0 ) {
		var nodeModel = $closestLeaf.data( 'node' ).getModel();
		var offset = nodeModel.getRoot().getOffsetFromNode( nodeModel );
		this.showCursor( offset );
		return false;
	}
};

ve.ce.Surface.prototype.onMouseUp = function( e ) {
	this.isMouseDown = false;

	var rangySel = rangy.getSelection();
	console.log("anchor", rangySel.anchorNode, rangySel.anchorOffset);

	var offset1 = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
	console.log( 'offset1', offset1 );

	var offset2 = this.documentView.model.getNearestContentOffset( offset1 );
	console.log( 'offset2', offset2 );

	var offset3 = this.documentView.model.getNearestStructuralOffset( offset1, 0, true );
	console.log( 'offset3', offset3 );
	


	this.showCursor( offset1 );



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
		key = sel.getRangeAt(0).toString().replace( /\s/gm, '' );

	this.clipboard[key] = ve.copyArray(
		this.documentView.model.getData( this.getSelectionRange() )
	);

	if ( e.type == 'cut' ) {
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

/**
 * @method
 */
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
		var pasteString = $('#paste').hide().text(),
			key = pasteString.replace( /\s/gm, '' ),
			pasteData = ( _this.clipboard[key] ) ? _this.clipboard[key] : pasteString.split('');

		// transact
		var tx = ve.dm.Transaction.newFromInsertion( _this.documentView.model, insertionPoint, pasteData );
		ve.dm.TransactionProcessor.commit( _this.documentView.model, tx );

		// place cursor
		_this.showCursor( insertionPoint + pasteData.length );
		_this.documentView.documentNode.$.focus();
	}, 1 );
};


/**
 * @method
 * @param DOMnode {DOM Element} DOM Element
 * @param DOMoffset {Integer} DOM offset within the DOM Element
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffset = function( DOMnode, DOMoffset ) {
	if ( DOMnode.nodeType === 3 ) {
		var $branch = $( DOMnode ).closest( '.ve-ce-branchNode' );
		var	current = [$branch.contents(), 0],
			stack = [current],
			offset = 0;
		while ( stack.length > 0 ) {
			if ( current[1] >= current[0].length ) {
				stack.pop();
				current = stack[ stack.length - 1 ];
				continue;
			}
			var item = current[0][current[1]];
			var $item = current[0].eq( current[1] );
			if ( item.nodeType === 3 ) {
				if ( item === DOMnode ) {
					offset += DOMoffset;
					break;
				} else {
					offset += item.textContent.length;
				}
			} else if ( item.nodeType === 1 ) {
				if ( $( item ).hasClass( 've-ce-leafNode' ) ) {
					offset += 2;
				} else {
					if ( item === DOMnode ) {
						offset += DOMoffset;
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
		var branchModel = $branch.data( 'node' ).getModel();
		var branchOffset = branchModel.getRoot().getOffsetFromNode( branchModel );
		return offset + 1 + branchOffset;
	} else if ( DOMnode.nodeType === 1 ) {
		if ( DOMoffset === 0 ) {
			throw new "Not implemented";
		} else {
			var $node = $( DOMnode ).contents().eq( DOMoffset - 1 );
			var nodeModel = $node.data( 'node' ).getModel();
			var nodeOffset = nodeModel.getRoot().getOffsetFromNode( nodeModel );
			return nodeOffset + nodeModel.getOuterLength();
		}
	} else {
		throw new "Not implemented";
	}
};

/**
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
 * @param offset {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getDOMNodeAndOffset = function( offset ) {
	var	$node = this.documentView.documentNode.getNodeFromOffset( offset ).$.closest( '.ve-ce-branchNode' ),
		startOffset = this.documentView.documentNode.getOffsetFromNode( $node.data( 'node' ) ) + 1, 
		current = [$node.contents(), 0],
		stack = [current];

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

			if ( offset >= startOffset && offset <= startOffset + length ) {
				console.log("Success 1");
				return { node: item, offset: offset - startOffset };
			} else {
				startOffset += length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $item.hasClass('ve-ce-slug') ) {
				return { node: $item[0], offset: 1 };
			} else if ( $item.is( '.ve-ce-branchNode, .ve-ce-leafNode' ) ) {
				var length = $item.data( 'node' ).model.getOuterLength();

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
	throw new 'Shouldn\'t happen';
	return;







	var	$node = this.documentView.documentNode.getNodeFromOffset( offset ).$.closest('.ve-ce-branchNode'),
		nodeOffset = this.documentView.documentNode.getOffsetFromNode( $node.data('node') ) + 1,
		current = [$node.contents(), 0],
		stack = [current],
		localNode,
		localOffset;

		console.log($node);
		return;



	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		var	item = current[0][current[1]],
			$item = current[0].eq( current[1] );

			console.log(nodeOffset, $item);

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
			if ( $( item ).is('.ve-ce-alienBlockNode, .ve-ce-alienInlineNode, .ve-ce-imageNode') ) {
				nodeOffset += 2;
			} else if ( $( item ).hasClass('ve-ce-slug') ) {
				if (nodeOffset == offset) {
					return {
						node: item,
						offset: 1
					};
				}
			} else {

console.log(this.documentView.model.data);
				if ( ve.dm.Document.isStructuralOffset( this.documentView.model.data, nodeOffset) ) {
					console.log("EVER?");
					nodeOffset++;
				}

				

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


/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );
