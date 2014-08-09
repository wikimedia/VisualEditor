/*!
* VisualEditor ContentEditable CommentNode class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
* ContentEditable comment node.
*
* @class
* @extends ve.ce.LeafNode
* @mixins ve.ce.FocusableNode
* @mixins OO.ui.IndicatedElement
*
* @constructor
* @param {ve.dm.CommentNode} model Model to observe
* @param {Object} [config] Configuration options
*/
ve.ce.CommentNode = function VeCeCommentNode( model, config ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );

	// DOM changes
	this.$element
		.addClass( 've-ce-commentNode' )
		// Add em space for selection highlighting
		.text( '\u2003' );

	// Mixin constructors
	ve.ce.FocusableNode.call( this, this.$element, config );
	OO.ui.IndicatedElement.call( this, this.$element, { $: this.$, indicator: 'alert' } );
};

/* Inheritance */

OO.inheritClass( ve.ce.CommentNode, ve.ce.LeafNode );
OO.mixinClass( ve.ce.CommentNode, ve.ce.FocusableNode );
OO.mixinClass( ve.ce.CommentNode, OO.ui.IndicatedElement );

/* Static Properties */

ve.ce.CommentNode.static.name = 'comment';

ve.ce.CommentNode.static.primaryCommandName = 'comment';

/* Methods */

/**
* @inheritdoc
*/
ve.ce.CommentNode.static.getDescription = function ( model ) {
	return model.getAttribute( 'text' );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.CommentNode );
