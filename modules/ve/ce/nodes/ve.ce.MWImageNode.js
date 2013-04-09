/*!
 * VisualEditor ContentEditable MWEntityNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki image node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.MWImageNode} model Model to observe
 */
 ve.ce.MWImageNode = function VeCeMWImageNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, $( '<a>' ) );

	// DOM Changes
	this.$.addClass( 've-ce-MWImageNode' );
	this.$.attr( 'contenteditable', false );
	this.$img = $( '<img>' ).appendTo( this.$ );
	this.$img.attr( {
		'width': this.model.getAttribute( 'width' ),
		'height': this.model.getAttribute( 'height' ),
		'src': this.model.getAttribute( 'src' )
	} );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
	this.$.on( {
		'click': ve.bind( this.onClick, this ),
		'dragstart': ve.bind( this.onDragstart, this )
	} );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWImageNode, ve.ce.LeafNode );

/* Static Properties */

ve.ce.MWImageNode.static.name = 'MWimage';

/* Methods */

ve.ce.MWImageNode.prototype.onUpdate = function () {
	// ...
};

/**
 * Handle the mouse click.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ce.MWImageNode.prototype.onClick = function ( e ) {
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
ve.ce.MWImageNode.prototype.onDragstart = function ( e ) {
	e.preventDefault();
	return false;
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWImageNode );
