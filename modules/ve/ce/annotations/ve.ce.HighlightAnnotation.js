/*!
 * VisualEditor ContentEditable HighlightAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable highlight annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.HighlightAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.HighlightAnnotation = function VeCeHighlightAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-HighlightAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.HighlightAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.HighlightAnnotation.static.name = 'textStyle/highlight';

ve.ce.HighlightAnnotation.static.tagName = 'mark';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.HighlightAnnotation );
