/*!
 * VisualEditor DataModel MWMathNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki math node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @mixins ve.dm.GeneratedContentNode
 *
 * @constructor
 */
ve.dm.MWMathNode = function VeDmMWMathNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 0, element );

	// Mixin constructors
	ve.dm.GeneratedContentNode.call( this );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWMathNode, ve.dm.LeafNode );

ve.mixinClass( ve.dm.MWMathNode, ve.dm.GeneratedContentNode );

/* Static members */

ve.dm.MWMathNode.static.name = 'mwMath';

ve.dm.MWMathNode.static.enableAboutGrouping = true;

ve.dm.MWMathNode.static.matchTagNames = null;

ve.dm.MWMathNode.static.matchRdfaTypes = [ 'mw:Extension/math' ];

ve.dm.MWMathNode.static.isContent = true;

ve.dm.MWMathNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement, index,
		mwDataJSON = domElements[0].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {};

	dataElement = {
		'type': 'mwMath',
		'attributes': {
			'mw': mwData,
			'originalDomElements': ve.copyArray( domElements ),
			'originalMw': mwDataJSON
		}
	};

	index = this.storeDomElements( dataElement, domElements, converter.getStore() );
	dataElement.attributes.originalIndex = index;

	return dataElement;
};

ve.dm.MWMathNode.static.toDomElements = function ( dataElement, doc, converter ) {
	var el,
		index = converter.getStore().indexOfHash( ve.getHash( this.getHashObject( dataElement ) ) ),
		originalMw = dataElement.attributes.originalMw;

	// If the transclusion is unchanged just send back the
	// original DOM elements so selser can skip over it
	if (
		index === dataElement.attributes.originalIndex ||
		( originalMw && ve.compare( dataElement.attributes.mw, JSON.parse( originalMw ) ) )
	) {
		// The object in the store is also used for CE rendering so return a copy
		return ve.copyDomElements( dataElement.attributes.originalDomElements, doc );
	} else {
		el = doc.createElement( 'img' );
		el.setAttribute( 'typeof', 'mw:Extension/Math' );
		el.setAttribute( 'data-mw', JSON.stringify( dataElement.attributes.mw ) );
		return [ el ];
	}
};

ve.dm.MWMathNode.static.getHashObject = function ( dataElement ) {
	return {
		type: dataElement.type,
		mw: dataElement.attributes.mw
	};
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWMathNode );
