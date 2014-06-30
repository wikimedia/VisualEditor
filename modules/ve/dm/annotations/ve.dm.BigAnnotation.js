/*!
* VisualEditor DataModel BigAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel big annotation.
 *
 * Represents `<big>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.BigAnnotation = function VeDmBigAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.BigAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.BigAnnotation.static.name = 'textStyle/big';

ve.dm.BigAnnotation.static.matchTagNames = [ 'big' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.BigAnnotation );
