/*!
* VisualEditor DataModel HighlightAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel highlight annotation.
 *
 * Represents `<mark>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.HighlightAnnotation = function VeDmHighlightAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.HighlightAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.HighlightAnnotation.static.name = 'textStyle/highlight';

ve.dm.HighlightAnnotation.static.matchTagNames = [ 'mark' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.HighlightAnnotation );
