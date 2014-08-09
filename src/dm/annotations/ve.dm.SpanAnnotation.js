/*!
* VisualEditor DataModel SpanAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel span annotation.
 *
 * Represents `<span>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.SpanAnnotation = function VeDmSpanAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.SpanAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.SpanAnnotation.static.name = 'textStyle/span';

ve.dm.SpanAnnotation.static.matchTagNames = [ 'span' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.SpanAnnotation );
