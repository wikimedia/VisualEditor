/*!
* VisualEditor DataModel UnderlineAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel underline annotation.
 *
 * Represents `<u>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.UnderlineAnnotation = function VeDmUnderlineAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.UnderlineAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.UnderlineAnnotation.static.name = 'textStyle/underline';

ve.dm.UnderlineAnnotation.static.matchTagNames = [ 'u' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.UnderlineAnnotation );
