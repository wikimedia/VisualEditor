/*!
* VisualEditor DataModel StrikethroughAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel strikethrough annotation.
 *
 * Represents `<s>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.StrikethroughAnnotation = function VeDmStrikethroughAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.StrikethroughAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.StrikethroughAnnotation.static.name = 'textStyle/strikethrough';

ve.dm.StrikethroughAnnotation.static.matchTagNames = [ 's' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.StrikethroughAnnotation );
