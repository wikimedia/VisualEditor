/*!
 * VisualEditor ContentEditable TextStyleAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable text style annotation.
 *
 * @class
 * @abstract
 * @extends ve.ce.Annotation
 * @constructor
 * @param {ve.dm.TextStyleAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.TextStyleAnnotation = function VeCeTextStyleAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.Annotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-TextStyleAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.TextStyleAnnotation, ve.ce.Annotation );

/* Static Properties */

ve.ce.TextStyleAnnotation.static.name = 'textStyle';

/* Methods */

ve.ce.TextStyleAnnotation.prototype.getTagName = function () {
	return this.getModel().getAttribute( 'nodeName' ) || this.constructor.static.tagName;
};

/* Registration */

ve.ce.annotationFactory.register( ve.ce.TextStyleAnnotation );
