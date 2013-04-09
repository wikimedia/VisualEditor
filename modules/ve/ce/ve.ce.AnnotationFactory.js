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
 * @extends ve.NamedClassFactory
 * @constructor
 */
ve.ce.AnnotationFactory = function VeCeAnnotationFactory() {
	// Parent constructor
	ve.NamedClassFactory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.ce.AnnotationFactory, ve.NamedClassFactory );

/* Initialization */

// TODO: Move instantiation to a different file
ve.ce.annotationFactory = new ve.ce.AnnotationFactory();
