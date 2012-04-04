ve.ce.SurfaceObserver = function( documentView ) {
	// Inheritance
	ve.EventEmitter.call( this );

	this.documentView = documentView;
	
	this.anchorNode = null;
	this.anchorOffset = null;
	this.focusNode = null;
	this.focusOffset = null;
	this.range = null;
	
	this.$node = null;
	this.interval = null;
	this.frequency = 100;
	this.prevText = null;
	this.prevHash = null;
	this.prevRange = null;

	var _this = this;

	this.on( 'select', function( range ) {
		if ( range !== null && range.getLength() === 0 ) {
			var node = _this.documentView.getNodeFromOffset( range.start );
			_this.setNode( node.$ );
		} else {
			_this.stop();
		}
	} );
};

ve.ce.SurfaceObserver.prototype.setNode = function( $node ) {
	if ( this.$node !== $node ) {
		this.stop();

		this.$node = $node;
		this.prevText = ve.ce.Surface.getDOMText2( this.$node[0] );
		this.prevHash = ve.ce.Surface.getDOMHash( this.$node[0] );

		this.start();
	}
};

ve.ce.SurfaceObserver.prototype.stop = function() {
	if ( this.interval !== null ) {
		clearInterval( this.interval );
		this.interval = null;
		this.poll();
	}
};

ve.ce.SurfaceObserver.prototype.start = function() {
	this.poll();
	var _this = this;
	setTimeout( function() {_this.poll(); }, 0);
	this.interval = setInterval( function() { _this.poll(); }, this.frequency );
};

ve.ce.SurfaceObserver.prototype.poll = function() {
	var text = ve.ce.Surface.getDOMText2( this.$node[0] );
	var hash = ve.ce.Surface.getDOMHash( this.$node[0] );

	if ( text !== this.prevText || hash !== this.prevHash ) {
		console.log(1);
		this.emit('change', {
			$node: this.$node,
			prevText: this.prevText,
			text: text,
			prevHash: this.prevHash,
			hash: hash
		} );
		this.prevText = text;
		this.prevHash = hash;
	}
};

ve.ce.SurfaceObserver.prototype.updateCursor = function( async ) {
	if ( async ) {
		var _this = this;
		setTimeout( function() {
			_this.updateCursor ( false );
		}, 0 );
	} else {
		if ( !this.documentView.$.is(':focus') ) {
			if (
				this.anchorNode !== null ||
				this.anchorOffset !== null ||
				this.focusNode !== null ||
				this.focusOffset !== null
			) {
				this.anchorNode = this.anchorOffset = this.focusNode = this.focusOffset = null;
				this.range = null;
				this.emit( 'select', this.range );
			}
		} else {
			var rangySel = rangy.getSelection();
			if (
				rangySel.anchorNode !== this.anchorNode ||
				rangySel.anchorOffset !== this.anchorOffset ||
				rangySel.focusNode !== this.focusNode ||
				rangySel.focusOffset !== this.focusOffset
			) {
				this.anchorNode = rangySel.anchorNode;
				this.anchorOffset = rangySel.anchorOffset;
				this.focusNode = rangySel.focusNode;
				this.focusOffset = rangySel.focusOffset;
				if ( rangySel.isCollapsed ) {
					this.range = new ve.Range( this.getOffset( this.anchorNode, this.anchorOffset ) );
				} else {
					this.range = new ve.Range(
						this.getOffset( this.anchorNode, this.anchorOffset ),
						this.getOffset( this.focusNode, this.focusOffset )
					);
				}
				this.emit( 'select', this.range );
			}
		}
	}
};

ve.ce.SurfaceObserver.prototype.getOffset = function( selectionNode, selectionOffset ) {
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

ve.extendClass( ve.ce.SurfaceObserver , ve.EventEmitter );