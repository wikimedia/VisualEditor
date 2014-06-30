/*!
 * VisualEditor ContentEditable VariableAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable variable annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.VariableAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.VariableAnnotation = function VeCeVariableAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-VariableAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.VariableAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.VariableAnnotation.static.name = 'textStyle/variable';

ve.ce.VariableAnnotation.static.tagName = 'var';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.VariableAnnotation );
