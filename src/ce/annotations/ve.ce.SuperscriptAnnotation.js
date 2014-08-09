/*!
 * VisualEditor ContentEditable SuperscriptAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable superscript annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.SuperscriptAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.SuperscriptAnnotation = function VeCeSuperscriptAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-SuperscriptAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.SuperscriptAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.SuperscriptAnnotation.static.name = 'textStyle/superscript';

ve.ce.SuperscriptAnnotation.static.tagName = 'sup';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.SuperscriptAnnotation );
