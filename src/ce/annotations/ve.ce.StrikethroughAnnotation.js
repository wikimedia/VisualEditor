/*!
 * VisualEditor ContentEditable StrikethroughAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable strikethrough annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.StrikethroughAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.StrikethroughAnnotation = function VeCeStrikethroughAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-StrikethroughAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.StrikethroughAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.StrikethroughAnnotation.static.name = 'textStyle/strikethrough';

ve.ce.StrikethroughAnnotation.static.tagName = 's';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.StrikethroughAnnotation );
