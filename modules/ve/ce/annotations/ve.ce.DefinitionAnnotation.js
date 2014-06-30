/*!
 * VisualEditor ContentEditable DefinitionAnnotation class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable definition annotation.
 *
 * @class
 * @extends ve.ce.TextStyleAnnotation
 * @constructor
 * @param {ve.dm.DefinitionAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.DefinitionAnnotation = function VeCeDefinitionAnnotation( model, parentNode, config ) {
	// Parent constructor
	ve.ce.TextStyleAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$element.addClass( 've-ce-DefinitionAnnotation' );
};

/* Inheritance */

OO.inheritClass( ve.ce.DefinitionAnnotation, ve.ce.TextStyleAnnotation );

/* Static Properties */

ve.ce.DefinitionAnnotation.static.name = 'textStyle/definition';

ve.ce.DefinitionAnnotation.static.tagName = 'dfn';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.DefinitionAnnotation );
