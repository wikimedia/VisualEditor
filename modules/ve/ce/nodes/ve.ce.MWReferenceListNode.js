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
 * @mixins ve.ce.ProtectedNode
 *
 * @constructor
 * @param {ve.dm.MWReferenceListNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWReferenceListNode = function VeCeMWReferenceListNode( model, config ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );

	// Mixin constructors
	ve.ce.ProtectedNode.call( this );

	// DOM Changes
	this.$.addClass( 've-ce-mwReferenceListNode', 'reference' )
		.attr( 'contenteditable', false );

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.MWReferenceListNode, ve.ce.LeafNode );

ve.mixinClass( ve.ce.MWReferenceListNode, ve.ce.ProtectedNode );

/* Static Properties */

ve.ce.MWReferenceListNode.static.name = 'mwReferenceList';

/* Methods */

ve.ce.MWReferenceListNode.prototype.onUpdate = function () {
	this.$.html( ve.copyArray( this.model.getAttribute( 'domElements' ) || [] ) );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWReferenceListNode );
