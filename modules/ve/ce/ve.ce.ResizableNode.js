/*!
 * VisualEditor ContentEditable ResizableNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable resizable node.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} [$resizable=this.$] Resizable DOM element
 */
ve.ce.ResizableNode = function VeCeResizableNode( $resizable ) {
	// Properties
	this.$resizable = $resizable || this.$;
	this.ratio = this.model.getAttribute( 'width' ) / this.model.getAttribute( 'height' );
	this.resizing = false;
	this.$resizeHandles = this.$$( '<div>' );
	this.onResizeHandlesCornerMouseDownHandler =
		ve.bind( this.onResizeHandlesCornerMouseDown, this );

	// Events
	this.connect( this, {
		'focus': 'onResizableFocus',
		'blur': 'onResizableBlur',
		'live': 'onResizableLive',
		'resize': 'onResizableFocus'
	} );

	// Initialization
	this.$resizeHandles
		.addClass( 've-ce-resizableNode-handles' )
		.append( this.$$( '<div>' ).addClass( 've-ce-resizableNode-nwHandle' ) )
		.append( this.$$( '<div>' ).addClass( 've-ce-resizableNode-neHandle' ) )
		.append( this.$$( '<div>' ).addClass( 've-ce-resizableNode-seHandle' ) )
		.append( this.$$( '<div>' ).addClass( 've-ce-resizableNode-swHandle' ) );
};

/* Static Properties */

ve.ce.ResizableNode.static = {};

/**
 * Animate between sizes.
 *
 * @type {boolean}
 */
ve.ce.ResizableNode.static.transition = true;

/* Methods */

/**
 * Handle node focus.
 *
 * @method
 */
ve.ce.ResizableNode.prototype.onResizableFocus = function () {
	var offset = this.$resizable.offset();

	this.$resizeHandles
		.css( {
			'width': 0,
			'height': 0,
			'top': offset.top,
			'left': offset.left
		} )
		.appendTo( this.root.getSurface().getSurface().$localOverlay );

	this.$resizeHandles
		.find('.ve-ce-resizableNode-neHandle')
			.css( { 'margin-right': -this.$resizable.width() } )
			.end()
		.find('.ve-ce-resizableNode-swHandle')
			.css( { 'margin-bottom': -this.$resizable.height() } )
			.end()
		.find('.ve-ce-resizableNode-seHandle')
			.css( {
				'margin-right': -this.$resizable.width(),
				'margin-bottom': -this.$resizable.height()
			} )
			.end()
		.children()
			.on( 'mousedown', this.onResizeHandlesCornerMouseDownHandler );
};

/**
 * Handle node blur.
 *
 * @method
 */
ve.ce.ResizableNode.prototype.onResizableBlur = function () {
	this.$resizeHandles
		.detach()
		.children()
			.off( 'mousedown', this.onResizeHandlesCornerMouseDownHandler );
};

/**
 * Handle live event.
 *
 * @method
 * @param {boolean} live
 */
ve.ce.ResizableNode.prototype.onResizableLive = function ( live ) {
	if ( !live ) {
		this.$resizeHandles.remove();
	}
};

/**
 * Handle bounding box handle mousedown.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ce.ResizableNode.prototype.onResizeHandlesCornerMouseDown = function ( e ) {
	// Hide context menu
	// TODO: Maybe there's a more generic way to handle this sort of thing? For relocation it's
	// handled in ve.ce.Surface
	this.root.getSurface().getSurface().getContext().hide();

	// Set bounding box width and undo the handle margins
	this.$resizeHandles
		.addClass( 've-ce-resizableNode-handles-resizing' )
		.css( {
			'width': this.$resizable.width(),
			'height': this.$resizable.height()
		} );

	this.$resizeHandles.children().css( 'margin', 0 );

	// Values to calculate adjusted bounding box size
	this.resizeInfo = {
		'mouseX': e.screenX,
		'mouseY': e.screenY,
		'top': this.$resizeHandles.position().top,
		'left': this.$resizeHandles.position().left,
		'height': this.$resizeHandles.height(),
		'width': this.$resizeHandles.width(),
		'handle': e.target.className
	};

	// Bind resize events
	this.resizing = true;
	$( this.getElementDocument() ).on( {
		'mousemove.ve-ce-resizableNode': ve.bind( this.onDocumentMouseMove, this ),
		'mouseup.ve-ce-resizableNode': ve.bind( this.onDocumentMouseUp, this )
	} );

	return false;
};

/**
 * Handle body mousemove.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ce.ResizableNode.prototype.onDocumentMouseMove = function ( e ) {
	var newWidth, newHeight, newRatio,
		// TODO: Make these configurable
		min = 1,
		max = 1000,
		diff = {},
		dimensions = {
			'width': 0,
			'height': 0,
			'top': this.resizeInfo.top,
			'left': this.resizeInfo.left
		};

	if ( this.resizing ) {
		// X and Y diff
		switch ( this.resizeInfo.handle ) {
			case 've-ce-resizableNode-seHandle':
				diff.x = e.screenX - this.resizeInfo.mouseX;
				diff.y = e.screenY - this.resizeInfo.mouseY;
				break;
			case 've-ce-resizableNode-nwHandle':
				diff.x = this.resizeInfo.mouseX - e.screenX;
				diff.y = this.resizeInfo.mouseY - e.screenY;
				break;
			case 've-ce-resizableNode-neHandle':
				diff.x = e.screenX - this.resizeInfo.mouseX;
				diff.y = this.resizeInfo.mouseY - e.screenY;
				break;
			case 've-ce-resizableNode-swHandle':
				diff.x = this.resizeInfo.mouseX - e.screenX;
				diff.y = e.screenY - this.resizeInfo.mouseY;
				break;
		}

		// Unconstrained dimensions and ratio
		newWidth = Math.max( Math.min( this.$resizable.width() + diff.x, max ), min );
		newHeight = Math.max( Math.min( this.$resizable.height() + diff.y, max ), min );
		newRatio = newWidth / newHeight;

		// Fix the ratio
		if ( this.ratio > newRatio ) {
			dimensions.width = newWidth;
			dimensions.height = this.$resizable.height() +
				( newWidth - this.$resizable.width() ) / this.ratio;
		} else {
			dimensions.width = this.$resizable.width() +
				( newHeight - this.$resizable.height() ) * this.ratio;
			dimensions.height = newHeight;
		}

		// Fix the position
		switch ( this.resizeInfo.handle ) {
			case 've-ce-resizableNode-neHandle':
				dimensions.top = this.resizeInfo.top +
					( this.resizeInfo.height - dimensions.height );
				break;
			case 've-ce-resizableNode-swHandle':
				dimensions.left = this.resizeInfo.left +
					( this.resizeInfo.width - dimensions.width );
				break;
			case 've-ce-resizableNode-nwHandle':
				dimensions.top = this.resizeInfo.top +
					( this.resizeInfo.height - dimensions.height );
				dimensions.left = this.resizeInfo.left +
					( this.resizeInfo.width - dimensions.width );
				break;
		}

		// Update bounding box
		this.$resizeHandles.css( dimensions );
	}
};

/**
 * Handle body mouseup.
 *
 * @method
 */
ve.ce.ResizableNode.prototype.onDocumentMouseUp = function () {
	var transition = this.constructor.static.transition,
		offset = this.model.getOffset(),
		width = this.$resizeHandles.outerWidth(),
		height = this.$resizeHandles.outerHeight(),
		surfaceModel = this.getRoot().getSurface().getModel(),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection();

	this.$resizeHandles.removeClass( 've-ce-resizableNode-handles-resizing' );
	$( this.getElementDocument() ).off( '.ve-ce-resizableNode' );
	this.resizing = false;

	// Transition image resize
	if ( transition ) {
		this.$resizable.addClass( 've-ce-resizableNode-transitioning' );
	}
	this.$resizable.css( { 'width': width, 'height': height } );

	// Allow resize to occur before re-rendering
	setTimeout( ve.bind( function () {
		var txs = [];

		if ( transition ) {
			// Prevent further transitioning
			this.$resizable.removeClass( 've-ce-resizableNode-transitioning' );
		}

		// Apply changes to the model
		if ( this.model.getAttribute( 'width' ) !== width ) {
			txs.push( ve.dm.Transaction.newFromAttributeChange(
				documentModel, offset, 'width', width
			) );
		}
		if ( this.model.getAttribute( 'height' ) !== height ) {
			txs.push( ve.dm.Transaction.newFromAttributeChange(
				documentModel, offset, 'height', height
			) );
		}
		if ( txs.length > 0 ) {
			surfaceModel.change( txs, selection );
		}

		this.emit( 'resize' );

	}, this ), transition ? 200 : 0 );
};
