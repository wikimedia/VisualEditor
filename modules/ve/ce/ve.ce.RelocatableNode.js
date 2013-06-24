/*!
 * VisualEditor ContentEditable RelocatableNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable relocatable node.
 *
 * Requires that the node also is Focusable
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.ce.RelocatableNode = function VeCeRelocatableNode() {
	// Properties
	this.relocatingSurface = null;
	this.$relocatableMarker = $( '<img>' );

	// Events
	this.connect( this, {
		'focus': 'onRelocatableFocus',
		'blur': 'onRelocatableBlur',
		'resize': 'onRelocatableResize'
	} );

	// Initialization
	this.$relocatableMarker
		.addClass( 've-ce-relocatableNode-marker' )
		.attr( 'src', 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' )
		.on( {
			'dragstart': ve.bind( this.onRelocatableDragStart, this ),
			'dragend': ve.bind( this.onRelocatableDragEnd, this )
		} );
};

/* Static Properties */

/* Methods */

/**
 * Handle node focus.
 *
 * @method
 */
ve.ce.RelocatableNode.prototype.onRelocatableFocus = function () {
	this.setRelocatableMarkerSizeAndPosition();
	this.$relocatableMarker.appendTo( this.root.getSurface().getSurface().$localOverlay );
};

/**
 * Handle node blur.
 *
 * @method
 */
ve.ce.RelocatableNode.prototype.onRelocatableBlur = function () {
	this.$relocatableMarker.detach();
};

/**
 * Handle node resize.
 *
 * @method
 */
ve.ce.RelocatableNode.prototype.onRelocatableResize = function () {
	this.setRelocatableMarkerSizeAndPosition();
};

/**
 * Handle element drag start.
 *
 * @method
 */
ve.ce.RelocatableNode.prototype.onRelocatableDragStart = function () {
	// Store a copy of the surface, when dragend occurs the node will be detached
	this.relocatingSurface = this.getRoot().getSurface();

	if ( this.relocatingSurface ) {
		// Allow dragging this node in the surface
		this.relocatingSurface.startRelocation( this );
	}
	this.$relocatableMarker.addClass( 'relocating' );

	setTimeout( ve.bind( function () {
		this.$relocatableMarker.css( { 'top': -10000, 'left': -10000 } );
	}, this ), 0 );
};

/**
 * Handle element drag end.
 *
 * @method
 */
ve.ce.RelocatableNode.prototype.onRelocatableDragEnd = function () {
	if ( this.relocatingSurface ) {
		this.relocatingSurface.endRelocation();
		this.relocatingSurface = null;
	}
	this.$relocatableMarker.removeClass( 'relocating' );
};

/**
 * Set the correct size and position of the relocatable marker.
 *
 * @method
 */
ve.ce.RelocatableNode.prototype.setRelocatableMarkerSizeAndPosition = function () {
	this.$relocatableMarker.css( {
		'height': this.$.height(),
		'width': this.$.width(),
		'top': this.$.offset().top,
		'left': this.$.offset().left
	} );
};
