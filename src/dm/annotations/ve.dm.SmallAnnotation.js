/*!
* VisualEditor DataModel SmallAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel small annotation.
 *
 * Represents `<small>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.SmallAnnotation = function VeDmSmallAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.SmallAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.SmallAnnotation.static.name = 'textStyle/small';

ve.dm.SmallAnnotation.static.matchTagNames = [ 'small' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.SmallAnnotation );
