/*!
 * VisualEditor ContentEditable SpanAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable span annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.SpanAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.SpanAnnotation = function VeCeSpanAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-SpanAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.SpanAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.SpanAnnotation.static.name = 'textStyle/span';

ve.ce.SpanAnnotation.static.tagName = 'span';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.SpanAnnotation );
