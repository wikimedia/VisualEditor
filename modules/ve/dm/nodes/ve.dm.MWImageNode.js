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

ve.dm.MWImageNode.static.toDataElement = function ( domElements ) {
	return {
		'type': 'MWimage',
		'attributes': {
			'src': domElements[0].childNodes[0].src,
			'width': domElements[0].childNodes[0].width,
			'height': domElements[0].childNodes[0].height
		}
	};
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWImageNode );
