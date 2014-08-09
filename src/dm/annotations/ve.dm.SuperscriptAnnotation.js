/*!
* VisualEditor DataModel SuperscriptAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel superscript annotation.
 *
 * Represents `<sup>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.SuperscriptAnnotation = function VeDmSuperscriptAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.SuperscriptAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.SuperscriptAnnotation.static.name = 'textStyle/superscript';

ve.dm.SuperscriptAnnotation.static.matchTagNames = [ 'sup' ];

ve.dm.SuperscriptAnnotation.static.removes = ['textStyle/subscript'];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.SuperscriptAnnotation );
