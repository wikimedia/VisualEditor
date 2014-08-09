/*!
 * VisualEditor ContentEditable CodeAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable code annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.CodeAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.CodeAnnotation = function VeCeCodeAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-CodeAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.CodeAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.CodeAnnotation.static.name = 'textStyle/code';

ve.ce.CodeAnnotation.static.tagName = 'code';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.CodeAnnotation );
