/*!
 * VisualEditor DataModel Alignable node.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * A mixin class for Alignable nodes.
 *
 * @class
 * @abstract
 * @constructor
 */
ve.dm.AlignableNode = function VeDmAlignableNode() {
};

/* Inheritance */

OO.initClass( ve.dm.AlignableNode );

/**
 * Creates attributes for the data element from DOM elements
 *
 * @static
 * @param {Node[]} domElements DOM elements from converter
 * @param {ve.dm.Converter} converter Converter object
 * @return {Object} Attributes for data element
 */
ve.dm.AlignableNode.static.toDataElementAttributes = function ( domElements ) {
	var matches = domElements[0].className.match( /ve-align-([A-Za-z]+)/ );

	if ( matches ) {
		return {
			align: matches[1],
			originalAlign: matches[1]
		};
	} else {
		return {};
	}
};

/**
 * Modify DOM element from the data element during toDomElements
 *
 * @param {Node} domElement Parent DOM element
 * @param {Object} dataElement Linear model element
 * @param {HTMLDocument} doc HTML document for creating elements
 * @return {Object} Attributes for DOM element
 */
ve.dm.AlignableNode.static.modifyDomElement = function ( domElement, dataElement ) {
	if ( dataElement.attributes.align !== dataElement.attributes.originalAlign ) {
		if ( dataElement.attributes.originalAlign ) {
			$( domElement ).removeClass( 've-align-' + dataElement.attributes.originalAlign );
		}
		if ( dataElement.attributes.align ) {
			$( domElement ).addClass( 've-align-' + dataElement.attributes.align );
		}
	}
};
