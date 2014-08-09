/*!
* VisualEditor DataModel CodeAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel code annotation.
 *
 * Represents `<code>` and `<tt>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.CodeAnnotation = function VeDmCodeAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.CodeAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.CodeAnnotation.static.name = 'textStyle/code';

ve.dm.CodeAnnotation.static.matchTagNames = [ 'code', 'tt' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.CodeAnnotation );
