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

	// Events
	this.$.on( {
		'mousedown': this.proxy( this.onMouseDown ),
		'mouseup': this.proxy( this.onMouseUp ),
		'mousemove': this.proxy( this.onMouseMove ),
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

ve.ce.Surface.prototype.getSelectionRect = function() {
	var rangySel = rangy.getSelection();
	return {
		start: rangySel.getStartDocumentPos(),
		end: rangySel.getEndDocumentPos()
	};
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );
