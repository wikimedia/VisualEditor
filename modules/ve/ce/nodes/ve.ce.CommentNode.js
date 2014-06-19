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
		.addClass( 've-ce-commentNode oo-ui-indicator-comment' );

	// Mixin constructors
	ve.ce.FocusableNode.call( this, this.$element, config );
};

/* Inheritance */

OO.inheritClass( ve.ce.CommentNode, ve.ce.LeafNode );
OO.mixinClass( ve.ce.CommentNode, ve.ce.FocusableNode );

/* Static Properties */

ve.ce.CommentNode.static.name = 'comment';

ve.ce.CommentNode.static.primaryCommandName = 'comment';

/* Methods */

/**
* @inheritdoc ve.ce.Node
*/
ve.ce.CommentNode.static.getDescription = function ( model ) {
	return model.getAttribute( 'text' );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.CommentNode );
