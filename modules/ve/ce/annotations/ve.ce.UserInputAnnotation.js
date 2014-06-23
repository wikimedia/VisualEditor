/*!
 * VisualEditor ContentEditable UserInputAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable user input annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.UserInputAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.UserInputAnnotation = function VeCeUserInputAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-UserInputAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.UserInputAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.UserInputAnnotation.static.name = 'textStyle/userInput';

ve.ce.UserInputAnnotation.static.tagName = 'kbd';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.UserInputAnnotation );
