/*!
 * VisualEditor ContentEditable Annotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic ContentEditable annotation.
 *
 * This is an abstract class, annotations should extend this and call this constructor from their
 * constructor. You should not instantiate this class directly.
 *
 * Subclasses of ve.dm.Annotation should have a corresponding subclass here that controls rendering.
 *
 * @abstract
 * @extends ve.ce.View
 *
 * @constructor
 * @param {ve.dm.Annotation} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.Annotation = function VeCeAnnotation( model, $element ) {
	// Parent constructor
	ve.ce.View.call( this, model, $element || $( '<span>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.Annotation, ve.ce.View );
