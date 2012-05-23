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

/**
 * @method
 */
ve.ce.Surface.prototype.getDOMNodeAndOffset = function( offset ) {
	var	$node = this.documentView.documentNode.getNodeFromOffset( offset ).parent.$,
		nodeOffset = this.documentView.documentNode.getOffsetFromNode( $node.data('node') ) + 1,
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
	console.log('returning null, like an asshole');
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
