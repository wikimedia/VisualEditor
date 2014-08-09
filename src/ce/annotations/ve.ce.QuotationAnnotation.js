/*!
 * VisualEditor ContentEditable QuotationAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable quotation annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.QuotationAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.QuotationAnnotation = function VeCeQuotationAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-QuotationAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.QuotationAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.QuotationAnnotation.static.name = 'textStyle/quotation';

ve.ce.QuotationAnnotation.static.tagName = 'q';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.QuotationAnnotation );
