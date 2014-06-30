/*!
* VisualEditor DataModel BoldAnnotation class.
*
* @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
* @license The MIT License (MIT); see LICENSE.txt
*/

/**
 * DataModel bold annotation.
 *
 * Represents `<b>` and `<strong>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.BoldAnnotation = function VeDmBoldAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.BoldAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.BoldAnnotation.static.name = 'textStyle/bold';

ve.dm.BoldAnnotation.static.matchTagNames = [ 'b', 'strong' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.BoldAnnotation );
