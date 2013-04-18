/*!
 * VisualEditor ContentEditable ImageNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable image node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.FocusableNode
 *
 * @constructor
 * @param {ve.dm.ImageNode} model Model to observe
 */
ve.ce.ImageNode = function VeCeImageNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, $( '<img>' ) );

	// Mixin constructors
	ve.ce.FocusableNode.call( this );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
	this.$.on( {
		'click': ve.bind( this.onClick, this ),
		'dragstart': ve.bind( this.onDragStart, this ),
		'dragend': ve.bind( this.onDragEnd, this )
	} );

	// Initialization
	ve.setDomAttributes( this.$[0], this.model.getAttributes(), ['src', 'width', 'height'] );
	this.$.addClass( 've-ce-imageNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.ImageNode, ve.ce.LeafNode );

ve.mixinClass( ve.ce.ImageNode, ve.ce.FocusableNode );

/* Static Properties */

ve.ce.ImageNode.static.name = 'image';

/* Methods */

/**
 * Handle the mouse click.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ce.ImageNode.prototype.onClick = function ( e ) {
	var range,
	    surfaceModel = this.getRoot().getSurface().getModel(),
	    selection = surfaceModel.getSelection();

	range = new ve.Range(
		this.model.getOffset(),
		this.model.getOffset() + this.model.getOuterLength()
	);

	if ( e.shiftKey ) {
		range = ve.Range.newCoveringRange( [ selection, range ], selection.from > range.from );
	}

	this.getRoot().getSurface().getModel().change( null, range );
};

/**
 * Handle the dragstart.
 *
 * @method
 * @param {jQuery.Event} e Dragstart event
 */
ve.ce.ImageNode.prototype.onDragStart = function () {
	return false;
};

/**
 * Handle the dragend.
 *
 * @method
 * @param {jQuery.Event} e Dragstart event
 */
ve.ce.ImageNode.prototype.onDragEnd = function () {
	return false;
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.ImageNode );
