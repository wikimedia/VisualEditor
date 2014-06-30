/*!
* VisualEditor DataModel DatetimeAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel datetime annotation.
 *
 * Represents `<time>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.DatetimeAnnotation = function VeDmDatetimeAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.DatetimeAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.DatetimeAnnotation.static.name = 'textStyle/datetime';

ve.dm.DatetimeAnnotation.static.matchTagNames = [ 'time' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.DatetimeAnnotation );
