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
 * @constructor
 */
ve.dm.MWMathNode = function VeDmMWMathNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWMathNode, ve.dm.LeafNode );

/* Static members */

ve.dm.MWMathNode.static.name = 'mwMath';

ve.dm.MWMathNode.static.enableAboutGrouping = true;

ve.dm.MWMathNode.static.matchTagNames = null;

ve.dm.MWMathNode.static.matchRdfaTypes = [ 'mw:Extension/math' ];

ve.dm.MWMathNode.static.isContent = true;

ve.dm.MWMathNode.static.toDataElement = function ( domElements ) {
	var dataElement,
		mwDataJSON = domElements[0].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {},
		alt = domElements[0].getAttribute( 'alt' ),
		src = domElements[0].getAttribute( 'src' );

	dataElement = {
		'type': 'mwMath',
		'attributes': {
			'mw': mwData,
			'originalMw': mwDataJSON,
			'alt': alt,
			'src': src
		}
	};
	return dataElement;
};

ve.dm.MWMathNode.static.toDomElements = function ( dataElement, doc ) {
	var el = doc.createElement( 'img' );
	el.setAttribute( 'data-mw', JSON.stringify( dataElement.attributes.mw ) );
	el.setAttribute( 'alt', dataElement.attributes.alt );
	el.setAttribute( 'src', dataElement.attributes.src );
	return [ el ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWMathNode );
