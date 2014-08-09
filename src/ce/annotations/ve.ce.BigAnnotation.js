/*!
 * VisualEditor ContentEditable BigAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable big annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.BigAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.BigAnnotation = function VeCeBigAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-BigAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.BigAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.BigAnnotation.static.name = 'textStyle/big';

ve.ce.BigAnnotation.static.tagName = 'big';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.BigAnnotation );
