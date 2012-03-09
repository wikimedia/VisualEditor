ve.ce.CursorObserver = function( documentView ) {
	// Inheritance
	ve.EventEmitter.call( this );

	this.documentView = documentView;
	this.anchorNode = null;
	this.anchorOffset = null;
	this.focusNode = null;
	this.focusOffset = null;
};

ve.ce.CursorObserver.prototype.update = function() {
	var _this = this;

	setTimeout( function() {
		if ( !_this.documentView.$.is(':focus') ) {
			if (
				_this.anchorNode !== null ||
				_this.anchorOffset !== null ||
				_this.focusNode !== null ||
				_this.focusOffset !== null
			) {
				_this.anchorNode = _this.anchorOffset = _this.focusNode = _this.focusOffset = null;
				_this.emit( 'change', null );
			}
		} else {
			var	rangySel = rangy.getSelection(),
				range;
			if ( rangySel.anchorNode !== _this.anchorNode ||
				rangySel.anchorOffset !== _this.anchorOffset ||
				rangySel.focusNode !== _this.focusNode ||
				rangySel.focusOffset !== _this.focusOffset
			) {
				_this.anchorNode = rangySel.anchorNode;
				_this.anchorOffset = rangySel.anchorOffset;
				_this.focusNode = rangySel.focusNode;
				_this.focusOffset = rangySel.focusOffset;
	
				if ( rangySel.isCollapsed ) {
					range = new ve.Range( _this.getOffset( _this.anchorNode, _this.anchorOffset ) );
				} else {
					range = new ve.Range(
						_this.getOffset( _this.anchorNode, _this.anchorOffset ),
						_this.getOffset( _this.focusNode, _this.focusOffset )
					);
				}
				_this.emit( 'change', range );
			}
		}
	}, 0 );
};

ve.ce.CursorObserver.prototype.getOffset = function( selectionNode, selectionOffset ) {
	var	$leafNode = ve.ce.Surface.getLeafNode( selectionNode ),
		current = [$leafNode.contents(), 0],
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
			if ( item === selectionNode ) {
				offset += selectionOffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $( item ).attr( 'contentEditable' ) === 'false' ) {
				offset += 1;
			} else {
				if ( item === selectionNode ) {
					offset += selectionOffset;
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
	return this.documentView.getOffsetFromNode(
		$leafNode.data( 'view' )
	) + 1 + offset;
};

/* Inheritance */

ve.extendClass( ve.ce.CursorObserver , ve.EventEmitter );
