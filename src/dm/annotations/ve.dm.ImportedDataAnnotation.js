/*!
 * VisualEditor DataModel ImportedDataAnnotation class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel imported data (paste/drag and drop) annotation.
 *
 * @class
 * @extends ve.dm.Annotation
 * @constructor
 * @param {Object} element
 */
ve.dm.ImportedDataAnnotation = function VeDmImportedDataAnnotation() {
	// Parent constructor
	ve.dm.ImportedDataAnnotation.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.dm.ImportedDataAnnotation, ve.dm.Annotation );

/* Static Properties */

ve.dm.ImportedDataAnnotation.static.name = 'meta/importedData';

ve.dm.ImportedDataAnnotation.static.matchTagNames = [];

ve.dm.ImportedDataAnnotation.static.applyToInsertedContent = false;

ve.dm.ImportedDataAnnotation.static.toDomElements = function () {
	return [];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.ImportedDataAnnotation );
