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

ve.dm.MWReferenceListNode.static.name = 'MWreferenceList';

ve.dm.MWReferenceListNode.static.matchTagNames = null;

ve.dm.MWReferenceListNode.static.matchRdfaTypes = [ 'mw:Object/References' ];

ve.dm.MWReferenceListNode.static.toDataElement = function ( domElements ) {
	var html = $( '<div>', domElements[0].ownerDocument ).append( $( domElements ).clone() ).html();

	return {
		'type': this.name,
		'attributes': {
			'html': html
		}
	};
};

ve.dm.MWReferenceListNode.static.toDomElements = function ( dataElement, doc ) {
	return [ doc.createElement( 'ol' ) ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWReferenceListNode );