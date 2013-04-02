/*!
 * VisualEditor DataModel MWEntityNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki image node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWImageNode = function VeDmMWImageNode( length, element ) {
	ve.dm.LeafNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWImageNode, ve.dm.LeafNode );

/* Static Properties */

ve.dm.MWImageNode.static.name = 'MWimage';

ve.dm.MWImageNode.static.isContent = true;

ve.dm.MWImageNode.static.matchRdfaTypes = [ 'mw:Image' ];

ve.dm.MWImageNode.static.storeHtmlAttributes = false;

ve.dm.MWImageNode.static.toDataElement = function ( domElements ) {
	var $node = $( domElements[0].childNodes[0] ),
		width = $node.attr( 'width' ),
		height = $node.attr( 'height' ),
		html = $( '<div>', domElements[0].ownerDocument ).append( $( domElements ).clone() ).html();

	return {
		'type': this.name,
		'attributes': {
			'src': $node.attr( 'src' ),
			'width': width !== '' ? Number( width ) : null,
			'height': height !== '' ? Number( height ) : null,
			// TODO: don't store html, just enough attributes to rebuild
			'html': html
		},
	};
};

ve.dm.MWImageNode.static.toDomElements = function ( dataElement, doc ) {
	//TODO: rebuild html from attributes
	var wrapper = doc.createElement( 'div' );
	wrapper.innerHTML = dataElement.attributes.html;
	// Convert wrapper.children to an array
	return Array.prototype.slice.call( wrapper.childNodes, 0 );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWImageNode );
