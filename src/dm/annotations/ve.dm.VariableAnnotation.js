/*!
 * VisualEditor DataModel VariableAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel variable annotation.
 *
 * Represents `<var>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.VariableAnnotation = function VeDmVariableAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.VariableAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.VariableAnnotation.static.name = 'textStyle/variable';

ve.dm.VariableAnnotation.static.matchTagNames = [ 'var' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.VariableAnnotation );
