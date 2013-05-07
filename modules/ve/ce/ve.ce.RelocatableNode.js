/*!
 * VisualEditor ContentEditable RelocatableNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable relocatable node.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} [$draggable=this.$] Draggable DOM element
 */
ve.ce.RelocatableNode = function VeCeRelocatableNode( $draggable ) {
	// Properties
	this.$draggable = $draggable || this.$;
	this.relocatingSurface = null;

	// Events
	this.$draggable.on( {
		'dragstart': ve.bind( this.onRelocatableDragStart, this ),
		'dragend': ve.bind( this.onRelocatableDragEnd, this )
	} );
};

/* Methods */

/**
 * Handle element drag start.
 *
 * @method
 * @param {jQuery.Event} e Drag start event
 */
ve.ce.RelocatableNode.prototype.onRelocatableDragStart = function () {
	// Store a copy of the surface, when dragend occurs the node will be detached
	this.relocatingSurface = this.getRoot().getSurface();

	if ( this.relocatingSurface ) {
		// Allow dragging this node in the surface
		this.relocatingSurface.startRelocation( this );
	}
};

/**
 * Handle element drag end.
 *
 * @method
 * @param {jQuery.Event} e Drag end event
 */
ve.ce.RelocatableNode.prototype.onRelocatableDragEnd = function () {
	if ( this.relocatingSurface ) {
		this.relocatingSurface.endRelocation();
		this.relocatingSurface = null;
	}
};
