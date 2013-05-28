/*!
 * VisualEditor DataModel MWReferenceNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki reference node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWReferenceNode = function VeDmMWReferenceNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWReferenceNode, ve.dm.LeafNode );

/* Static members */

ve.dm.MWReferenceNode.static.name = 'mwReference';

ve.dm.MWReferenceNode.static.matchTagNames = null;

ve.dm.MWReferenceNode.static.matchRdfaTypes = [ 'mw:Object/Ext/Ref' ];

ve.dm.MWReferenceNode.static.isContent = true;

ve.dm.MWReferenceNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement, listIndex,
		about = domElements[0].getAttribute( 'about' ),
		mw = JSON.parse( domElements[0].getAttribute( 'data-mw' ) || '{}' ),
		body = mw.body.html,
		// TODO: this should use mw.attrs.name once available from Parsoid
		name = $( domElements[0] ).children( 'a' ).attr( 'href' ),
		// TODO: should also store and use mw.attrs.group once available from Parsoid
		key = name !== null ? name : ve.getHash( body );

	listIndex = converter.internalList.queueItemHtml( key, body );

	dataElement = {
		'type': this.name,
		'attributes': {
			'mw': mw,
			'about': about,
			'listIndex': listIndex
		}
	};
	return dataElement;
};

ve.dm.MWReferenceNode.static.toDomElements = function ( dataElement, doc, converter ) {
	var itemNodeHtml, mwAttr,
		span = doc.createElement( 'span' ),
		itemNodeWrapper = doc.createElement( 'div' ),
		itemNode = converter.internalList.getItemNode( dataElement.attributes.listIndex ),
		itemNodeRange = itemNode.getRange();

	span.setAttribute( 'about', dataElement.attributes.about );
	span.setAttribute( 'typeof', 'mw:Object/Ext/Ref' );

	converter.getDomSubtreeFromData(
		itemNode.getDocument().getData().slice( itemNodeRange.start, itemNodeRange.end ),
		itemNodeWrapper
	),
	itemNodeHtml = $( itemNodeWrapper ).html();

	mwAttr = ( dataElement.attributes && ve.copyObject( dataElement.attributes.mw ) ) || {};
	ve.setProp( mwAttr, 'body', 'html', itemNodeHtml );
	span.setAttribute( 'data-mw', JSON.stringify( mwAttr ) );

	return [ span ];
};

ve.dm.MWReferenceNode.static.remapInternalListIndexes = function ( dataElement, mapping ) {
	dataElement.attributes.listIndex = mapping[dataElement.attributes.listIndex];
};

/* Methods */

/**
 * Gets the internal item node associated with this node
 * @method
 * @returns {ve.dm.InternalItemNode} Item node
 */
ve.dm.MWReferenceNode.prototype.getInternalItem = function () {
	return this.doc.getInternalList().getItemNode( this.getAttribute( 'listIndex' ) );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWReferenceNode );
