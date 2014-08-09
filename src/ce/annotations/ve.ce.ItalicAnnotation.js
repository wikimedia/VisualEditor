/*!
 * VisualEditor ContentEditable ItalicAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable italic annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.ItalicAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.ItalicAnnotation = function VeCeItalicAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-ItalicAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.ItalicAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.ItalicAnnotation.static.name = 'textStyle/italic';

ve.ce.ItalicAnnotation.static.tagName = 'i';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.ItalicAnnotation );
