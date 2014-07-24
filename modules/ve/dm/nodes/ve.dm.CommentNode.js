/*!
 * VisualEditor DataModel CommentNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * @class
 * @extends ve.dm.LeafNode
 *
 * @constructor
 * @param {Object} element Reference to element in meta-linmod
 */
ve.dm.CommentNode = function VeDmCommentNode( element ) {
	ve.dm.CommentNode.super.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.CommentNode, ve.dm.LeafNode );

/* Static Properties */

ve.dm.CommentNode.static.name = 'comment';

ve.dm.CommentNode.static.matchTagNames = [ '#comment' ];

ve.dm.CommentNode.static.isContent = true;

ve.dm.CommentNode.static.storeHtmlAttributes = false;

ve.dm.CommentNode.static.toDataElement = function ( domElements, converter ) {
	return {
		// Only use CommentNode for comments in ContentBranchNodes; otherwise use
		// CommentMetaItem
		'type': converter.isExpectingContent() ? this.name : 'commentMeta',
		'attributes': {
			'text': domElements[0].data
		}
	};
};

ve.dm.CommentNode.static.toDomElements = function ( dataElement, doc ) {
	return [ doc.createComment( dataElement.attributes.text ) ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.CommentNode );
