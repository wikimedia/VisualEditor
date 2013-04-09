/*!
 * VisualEditor ContentEditable AnnotationFactory class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable annotation factory.
 *
 * @class
 * @extends ve.NodeFactory
 * @constructor
 */
ve.ce.AnnotationFactory = function VeCeAnnotationFactory() {
	// Parent constructor
	// FIXME give ve.NodeFactory a more generic name
	ve.NodeFactory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.ce.AnnotationFactory, ve.NodeFactory );

/* Initialization */

// TODO: Move instantiation to a different file
ve.ce.annotationFactory = new ve.ce.AnnotationFactory();
