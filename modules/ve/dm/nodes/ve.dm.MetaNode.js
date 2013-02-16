/*!
 * VisualEditor DataModel MetaNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel meta node.
 *
 * @class
 * @abstract
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {string} name Node name
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MetaNode = function VeDmMetaBlockNode( name, length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, name, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MetaNode, ve.dm.LeafNode );

/* Static Properties */

ve.dm.MetaNode.static.name = 'meta';

ve.dm.MetaNode.static.isMeta = true;

ve.dm.MetaNode.static.matchTagNames = [ 'meta', 'link' ];

ve.dm.MetaNode.static.toDataElement = function ( domElements, context ) {
	var firstDomElement = domElements[0],
		isLink = firstDomElement.nodeName.toLowerCase() === 'link',
		keyAttr = isLink ? 'rel' : 'property',
		valueAttr = isLink ? 'href' : 'content',
		dataElement = {
			'type': context.expectingContent ? 'metaInline' : 'metaBlock',
			'attributes': {
				'style': isLink ? 'link' : 'meta',
				'key': firstDomElement.getAttribute( keyAttr )
			}
		};
	if ( firstDomElement.hasAttribute( valueAttr ) ) {
		dataElement.attributes.value = firstDomElement.getAttribute( valueAttr );
	}
	return dataElement;
};

ve.dm.MetaNode.static.toDomElements = function ( dataElement ) {
	var style = dataElement.attributes && dataElement.attributes.style || 'meta',
		isLink = style === 'link',
		tag = isLink ? 'link' : 'meta',
		keyAttr = isLink ? 'rel' : 'property',
		valueAttr = isLink ? 'href' : 'content',
		domElement;
	if ( style === 'comment' ) {
		return [ document.createComment( dataElement.attributes && dataElement.attributes.text || '' ) ];
	}
	domElement = document.createElement( tag );
	if ( dataElement.attributes && dataElement.attributes.key !== null ) {
		domElement.setAttribute( keyAttr, dataElement.attributes.key );
	}
	if ( dataElement.attributes && dataElement.attributes.value ) {
		domElement.setAttribute( valueAttr, dataElement.attributes.value );
	}
	return [ domElement ];
};

/* Concrete subclasses */

/**
 * DataModel metaBlock node.
 *
 * @class
 * @abstract
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MetaBlockNode = function VeDmMetaBlockNode( length, element ) {
	// Parent constructor
	ve.dm.MetaNode.call( this, 'metaBlock', length, element );
};

ve.inheritClass( ve.dm.MetaBlockNode, ve.dm.MetaNode );

ve.dm.MetaBlockNode.static.name = 'metaBlock';


ve.dm.MetaInlineNode = function VeDmMetaInlineNode( length, element ) {
	// Parent constructor
	ve.dm.MetaNode.call( this, 'metaInline', length, element );
};

ve.inheritClass( ve.dm.MetaInlineNode, ve.dm.MetaNode );

ve.dm.MetaInlineNode.static.name = 'metaInline';

ve.dm.MetaInlineNode.static.isContent = true;

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MetaNode );
ve.dm.modelRegistry.register( ve.dm.MetaBlockNode );
ve.dm.modelRegistry.register( ve.dm.MetaInlineNode );
