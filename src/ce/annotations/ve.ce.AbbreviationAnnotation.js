/*!
 * VisualEditor ContentEditable AbbreviationAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable abbreviation annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.AbbreviationAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.AbbreviationAnnotation = function VeCeAbbreviationAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-AbbreviationAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.AbbreviationAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.AbbreviationAnnotation.static.name = 'textStyle/abbreviation';

ve.ce.AbbreviationAnnotation.static.tagName = 'abbr';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.AbbreviationAnnotation );
