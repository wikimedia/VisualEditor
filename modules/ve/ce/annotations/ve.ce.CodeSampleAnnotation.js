/*!
 * VisualEditor ContentEditable CodeSampleAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable code sample annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.CodeSampleAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.CodeSampleAnnotation = function VeCeCodeSampleAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-CodeSampleAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.CodeSampleAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.CodeSampleAnnotation.static.name = 'textStyle/codeSample';

ve.ce.CodeSampleAnnotation.static.tagName = 'samp';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.CodeSampleAnnotation );
