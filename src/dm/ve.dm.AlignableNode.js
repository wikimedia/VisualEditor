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

/* Static properties */

/**
 * CSS class to use for each alignment
 *
 * @static
 * @property {Object}
 * @inheritable
 */
ve.dm.AlignableNode.static.cssClasses = {
	left: 've-align-left',
	right: 've-align-right',
	center: 've-align-center'
};

/**
 * Creates attributes for the data element from DOM elements
 *
 * @static
 * @param {Node[]} domElements DOM elements from converter
 * @param {ve.dm.Converter} converter Converter object
 * @return {Object} Attributes for data element
 */
ve.dm.AlignableNode.static.toDataElementAttributes = function ( domElements ) {
	var a, align,
		classList = domElements[0].classList,
		cssClasses = this.cssClasses;

	for ( a in cssClasses ) {
		if ( classList.contains( cssClasses[a] ) ) {
			align = a;
			break;
		}
	}

	if ( align ) {
		return {
			align: align,
			originalAlign: align
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
