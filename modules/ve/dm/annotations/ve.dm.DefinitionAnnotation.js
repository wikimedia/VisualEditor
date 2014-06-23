/*!
 * VisualEditor DataModel DefinitionAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel definition annotation.
 *
 * Represents `<dfn>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.DefinitionAnnotation = function VeDmDefinitionAnnotation( element ) {
	// Parent constructor
	ve.dm.TextStyleAnnotation.call( this, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.DefinitionAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.DefinitionAnnotation.static.name = 'textStyle/definition';

ve.dm.DefinitionAnnotation.static.matchTagNames = [ 'dfn' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.DefinitionAnnotation );
