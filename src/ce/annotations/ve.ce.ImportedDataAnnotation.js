/*!
 * VisualEditor ContentEditable ImportedDataAnnotation class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ContentEditable imported data (paste/drag and drop) annotation.
 *
 * @class
 * @extends ve.ce.Annotation
 * @constructor
 * @param {ve.dm.ImportedDataAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.ImportedDataAnnotation = function VeCeImportedDataAnnotation() {
	// Parent constructor
	ve.ce.ImportedDataAnnotation.super.apply( this, arguments );

	// DOM changes
	this.$element.addClass( 've-ce-importedDataAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.ImportedDataAnnotation, ve.ce.Annotation );

/* Static Properties */

ve.ce.ImportedDataAnnotation.static.name = 'meta/importedData';

ve.ce.ImportedDataAnnotation.static.tagName = 'span';

/* Static Methods */

/* Registration */

ve.ce.annotationFactory.register( ve.ce.ImportedDataAnnotation );
