/*!
 * VisualEditor DataModel AlienMetaItem class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel alien meta item.
 *
 * @class
 * @extends ve.dm.MetaItem
 * @constructor
 * @param {Object} element Reference to element in meta-linmod
 */
ve.dm.AlienMetaItem = function VeDmAlienMetaItem( element ) {
	// Parent constructor
	ve.dm.MetaItem.call( this, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.AlienMetaItem, ve.dm.MetaItem );

/* Static Properties */

ve.dm.AlienMetaItem.static.name = 'alienMeta';

ve.dm.AlienMetaItem.static.matchTagNames = [ 'meta', 'link' ];

ve.dm.AlienMetaItem.static.toDataElement = function ( domElements ) {
	var firstDomElement = domElements[0],
		isLink = firstDomElement.nodeName.toLowerCase() === 'link',
		keyAttr = isLink ? 'rel' : 'property',
		valueAttr = isLink ? 'href' : 'content',
		dataElement = {
			'type': 'alienMeta',
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

ve.dm.AlienMetaItem.static.toDomElements = function ( dataElement, doc ) {
	var style = dataElement.attributes && dataElement.attributes.style || 'meta',
		isLink = style === 'link',
		tag = isLink ? 'link' : 'meta',
		keyAttr = isLink ? 'rel' : 'property',
		valueAttr = isLink ? 'href' : 'content',
		domElement;
	if ( style === 'comment' ) {
		return [ doc.createComment( dataElement.attributes && dataElement.attributes.text || '' ) ];
	}
	domElement = doc.createElement( tag );
	if ( dataElement.attributes && dataElement.attributes.key !== null ) {
		domElement.setAttribute( keyAttr, dataElement.attributes.key );
	}
	if ( dataElement.attributes && dataElement.attributes.value ) {
		domElement.setAttribute( valueAttr, dataElement.attributes.value );
	}
	return [ domElement ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.AlienMetaItem );
