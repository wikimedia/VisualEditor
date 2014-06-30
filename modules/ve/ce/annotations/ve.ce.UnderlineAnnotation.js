/*!
 * VisualEditor ContentEditable UnderlineAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable underline annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.UnderlineAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.UnderlineAnnotation = function VeCeUnderlineAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-UnderlineAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.UnderlineAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.UnderlineAnnotation.static.name = 'textStyle/underline';

ve.ce.UnderlineAnnotation.static.tagName = 'u';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.UnderlineAnnotation );
