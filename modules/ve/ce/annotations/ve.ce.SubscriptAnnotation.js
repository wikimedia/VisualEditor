/*!
 * VisualEditor ContentEditable SubscriptAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable subscript annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.SubscriptAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.SubscriptAnnotation = function VeCeSubscriptAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-SubscriptAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.SubscriptAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.SubscriptAnnotation.static.name = 'textStyle/subscript';

ve.ce.SubscriptAnnotation.static.tagName = 'sub';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.SubscriptAnnotation );
