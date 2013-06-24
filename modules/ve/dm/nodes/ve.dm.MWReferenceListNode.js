/*!
 * VisualEditor DataModel MWReferenceListNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki reference list node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWReferenceListNode = function VeDmMWReferenceListNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWReferenceListNode, ve.dm.LeafNode );

/* Static members */

ve.dm.MWReferenceListNode.static.name = 'mwReferenceList';

ve.dm.MWReferenceListNode.static.matchTagNames = null;

ve.dm.MWReferenceListNode.static.matchRdfaTypes = [ 'mw:Extension/references' ];

ve.dm.MWReferenceListNode.static.storeHtmlAttributes = false;

ve.dm.MWReferenceListNode.static.toDataElement = function ( domElements ) {
	var mwDataJSON = domElements[0].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {},
		refGroup = mwData.attrs && mwData.attrs.group || '',
		listGroup = 'mwReference/' + refGroup;

	return {
		'type': this.name,
		'attributes': {
			'mw': mwData,
			'origMw': mwDataJSON,
			'about': domElements[0].getAttribute( 'about' ),
			'domElements': ve.copyArray( domElements ),
			'refGroup': refGroup,
			'listGroup': listGroup
		}
	};
};

ve.dm.MWReferenceListNode.static.toDomElements = function ( dataElement, doc ) {
	var el, els, mwData, origMw,
		attribs = dataElement.attributes;

	if ( attribs.domElements ) {
		// If there's more than 1 element, preserve entire array, not just first element
		els = ve.copyDomElements( attribs.domElements, doc );
		el = els[0];
	} else {
		el = doc.createElement( 'div' );
		els = [ el ];
	}

	mwData = attribs.mw ? ve.copyObject( attribs.mw ) : {};

	mwData.name = 'references';

	if ( attribs.refGroup ) {
		ve.setProp( mwData, 'attrs', 'group', attribs.refGroup );
	} else if ( mwData.attrs ) {
		delete mwData.attrs.refGroup;
	}

	if ( attribs.about ) {
		el.setAttribute( 'about', attribs.about );
	}
	el.setAttribute( 'typeof', 'mw:Extension/references' );

	// If mwData and origMw are the same, use origMw to prevent reserialization.
	// Reserialization has the potential to reorder keys and so change the DOM unnecessarily
	origMw = attribs.origMw;
	if ( origMw && ve.compare( mwData, JSON.parse( origMw ) ) ) {
		el.setAttribute( 'data-mw', origMw );
	} else {
		el.setAttribute( 'data-mw', JSON.stringify( mwData ) );
	}

	return els;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWReferenceListNode );
