/*!
 * VisualEditor ContentEditable MWReferenceListNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki reference list node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @constructor
 * @param {ve.dm.MWReferenceListNode} model Model to observe
 */
ve.ce.MWReferenceListNode = function VeCeMWReferenceListNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, $( '<div>' ) );

	// DOM Changes
	this.$.addClass( 've-ce-MWreferenceListNode', 'reference' )
		.attr( 'contenteditable', false );

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWReferenceListNode, ve.ce.LeafNode );

/* Static Properties */

ve.ce.MWReferenceListNode.static.name = 'MWreferenceList';

/* Methods */

ve.ce.MWReferenceListNode.prototype.onUpdate = function () {
	this.$.html( this.model.getAttribute( 'html' ) );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWReferenceListNode );
