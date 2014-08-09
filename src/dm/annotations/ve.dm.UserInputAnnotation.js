/*!
* VisualEditor DataModel UserInputAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel user input annotation.
 *
 * Represents `<kbd>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.UserInputAnnotation = function VeDmUserInputAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.UserInputAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.UserInputAnnotation.static.name = 'textStyle/userInput';

ve.dm.UserInputAnnotation.static.matchTagNames = [ 'kbd' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.UserInputAnnotation );
