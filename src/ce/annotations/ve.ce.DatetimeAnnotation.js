/*!
 * VisualEditor ContentEditable DatetimeAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable datetime annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.DatetimeAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.DatetimeAnnotation = function VeCeDatetimeAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-DatetimeAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.DatetimeAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.DatetimeAnnotation.static.name = 'textStyle/datetime';

ve.ce.DatetimeAnnotation.static.tagName = 'time';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.DatetimeAnnotation );
