/*!
* VisualEditor DataModel ItalicAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel italic annotation.
 *
 * Represents `<i>` and `<em>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.ItalicAnnotation = function VeDmItalicAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.ItalicAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.ItalicAnnotation.static.name = 'textStyle/italic';

ve.dm.ItalicAnnotation.static.matchTagNames = [ 'i', 'em' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.ItalicAnnotation );
