/*!
 * VisualEditor data model InspectorFactory class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel Inspector factory.
 *
 * @class
 * @extends ve.Factory
 * @constructor
 */
ve.ui.InspectorFactory = function VeDmInspectorFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.ui.InspectorFactory, ve.Factory );

/* Methods */

/**
 * Gets an inspector constructor for a given annotation type.
 *
 * @method
 * @param {string} name Symbolic name of inspector to get pattern for
 * @returns {RegExp} Regular expression matching annotations relevant to a given inspector
 * @throws {Error} Unknown inspector
 */
ve.ui.InspectorFactory.prototype.getTypePattern = function ( name ) {
	if ( name in this.registry ) {
		return this.registry[name].static.typePattern;
	}
	throw new Error( 'Unknown inspector: ' + name );
};

/**
 * Reduces an annotations set to only those which can be inspected by given inspector.
 *
 * @method
 * @param {ve.AnnotationSet} annotations Annotations to be inspected
 * @returns {String[]} Symbolic names of inspectors that can be used to inspect annotations
 */
ve.ui.InspectorFactory.prototype.getInspectorsForAnnotations = function ( annotations ) {
	var name,
		names = [];
	if ( !annotations.isEmpty() ) {
		for ( name in this.registry ) {
			if ( annotations.hasAnnotationWithName( this.registry[name].static.typePattern ) ) {
				names.push( name );
			}
		}
	}
	return names;
};

/* Initialization */

ve.ui.inspectorFactory = new ve.ui.InspectorFactory();
