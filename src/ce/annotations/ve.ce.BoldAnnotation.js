/*!
 * VisualEditor ContentEditable BoldAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable bold annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.BoldAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.BoldAnnotation = function VeCeBoldAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-BoldAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.BoldAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.BoldAnnotation.static.name = 'textStyle/bold';

ve.ce.BoldAnnotation.static.tagName = 'b';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.BoldAnnotation );
