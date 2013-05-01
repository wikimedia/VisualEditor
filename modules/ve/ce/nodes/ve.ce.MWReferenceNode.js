/*!
 * VisualEditor ContentEditable MWReferenceNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki reference node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.MWReferenceNode} model Model to observe
 */
ve.ce.MWReferenceNode = function VeCeMWReferenceNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, $( '<sup>' ) );

	// DOM Changes
	this.$link = $( '<a>' ).attr( 'href', '#' );
	this.$.addClass( 've-ce-MWreferenceNode', 'reference' )
		.attr( 'contenteditable', false )
		.append( this.$link );

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );
	this.$link.click( ve.bind( this.onClick, this ) );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWReferenceNode, ve.ce.LeafNode );

/* Static Properties */

ve.ce.MWReferenceNode.static.name = 'MWreference';

/* Methods */

/**
 * Handle update events.
 *
 * @method
 */
ve.ce.MWReferenceNode.prototype.onUpdate = function () {
	// TODO: auto-generate this number properly
	this.$link.text( '[' + ( this.model.getAttribute( 'listIndex' ) + 1 ) + ']' );
};

/**
 * Handle the reference being clicked.
 *
 * @method
 */
ve.ce.MWReferenceNode.prototype.onClick = function ( e ) {
	// TODO: Start editing. Internal item dm node can be accessed using:
	// var itemNode = this.model.getInternalItem();
	e.preventDefault();
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWReferenceNode );
