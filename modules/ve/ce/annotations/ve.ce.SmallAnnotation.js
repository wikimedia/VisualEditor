/*!
 * VisualEditor ContentEditable SmallAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable small annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.SmallAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.SmallAnnotation = function VeCeSmallAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-SmallAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.SmallAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.SmallAnnotation.static.name = 'textStyle/small';

ve.ce.SmallAnnotation.static.tagName = 'small';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.SmallAnnotation );
