/*!
* VisualEditor DataModel CodeSampleAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel code sample annotation.
 *
 * Represents `<samp>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.CodeSampleAnnotation = function VeDmCodeSampleAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.CodeSampleAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.CodeSampleAnnotation.static.name = 'textStyle/codeSample';

ve.dm.CodeSampleAnnotation.static.matchTagNames = [ 'samp' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.CodeSampleAnnotation );
