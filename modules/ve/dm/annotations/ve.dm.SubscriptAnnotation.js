/*!
* VisualEditor DataModel SubscriptAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel subscript annotation.
 *
 * Represents `<sub>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.SubscriptAnnotation = function VeDmSubscriptAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.SubscriptAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.SubscriptAnnotation.static.name = 'textStyle/subscript';

ve.dm.SubscriptAnnotation.static.matchTagNames = [ 'sub' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.SubscriptAnnotation );
