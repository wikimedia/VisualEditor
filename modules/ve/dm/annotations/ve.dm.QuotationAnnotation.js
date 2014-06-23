/*!
 * VisualEditor DataModel QuotationAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel quotation annotation.
 *
 * Represents `<q>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.QuotationAnnotation = function VeDmQuotationAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.QuotationAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.QuotationAnnotation.static.name = 'textStyle/quotation';

ve.dm.QuotationAnnotation.static.matchTagNames = [ 'q' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.QuotationAnnotation );
