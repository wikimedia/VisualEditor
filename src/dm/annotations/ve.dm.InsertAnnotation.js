/*!
 * VisualEditor DataModel InsertAnnotation class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel insert annotation.
 *
 * Represents `<ins>` tags.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.InsertAnnotation = function VeDmInsertAnnotation() {
	// Parent constructor
	ve.dm.InsertAnnotation.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.dm.InsertAnnotation, ve.dm.TextStyleAnnotation );

/* Static Properties */

ve.dm.InsertAnnotation.static.name = 'textStyle/insert';

ve.dm.InsertAnnotation.static.matchTagNames = [ 'ins' ];

/* Registration */

ve.dm.modelRegistry.register( ve.dm.InsertAnnotation );
