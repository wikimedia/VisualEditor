/*!
 * VisualEditor DataModel CommentNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * @class
 * @abstract
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

ve.dm.CommentNode.static.isContent = true;

ve.dm.CommentNode.static.storeHtmlAttributes = false;

ve.dm.CommentNode.static.toDataElement = function ( domElements, converter ) {
	var text = domElements[0].nodeType === Node.COMMENT_NODE ?
		domElements[0].data :
		domElements[0].getAttribute( 'data-ve-comment' );
	return {
		// Only use CommentNode for comments in ContentBranchNodes; otherwise use
		// CommentMetaItem
		type: converter.isExpectingContent() && text !== '' ? 'comment' : 'commentMeta',
		attributes: {
			text: text
		}
	};
};

ve.dm.CommentNode.static.toDomElements = function ( dataElement, doc, converter ) {
	if ( converter.isForClipboard() ) {
		// Fake comment node
		var span = doc.createElement( 'span' );
		span.setAttribute( 'rel', 've:Comment' );
		span.setAttribute( 'data-ve-comment', dataElement.attributes.text );
		return [ span ];
	} else {
		// Real comment node
		return [ doc.createComment( dataElement.attributes.text ) ];
	}
};

/**
 * @class
 * @extends ve.dm.CommentNode
 *
 * @constructor
 * @param {Object} element Reference to element in meta-linmod
 */
ve.dm.RealCommentNode = function VeDmRealCommentNode( element ) {
	ve.dm.RealCommentNode.super.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.RealCommentNode, ve.dm.CommentNode );

/* Static Properties */

ve.dm.RealCommentNode.static.name = 'comment';

ve.dm.RealCommentNode.static.matchTagNames = [ '#comment' ];

/**
 * @class
 * @extends ve.dm.CommentNode
 *
 * @constructor
 * @param {Object} element Reference to element in meta-linmod
 */
ve.dm.FakeCommentNode = function VeDmFakeCommentNode( element ) {
	ve.dm.FakeCommentNode.super.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.FakeCommentNode, ve.dm.CommentNode );

/* Static Properties */

ve.dm.FakeCommentNode.static.name = 'fakeComment';

ve.dm.FakeCommentNode.static.matchRdfaTypes = [ 've:Comment' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.RealCommentNode );
ve.dm.modelRegistry.register( ve.dm.FakeCommentNode );
