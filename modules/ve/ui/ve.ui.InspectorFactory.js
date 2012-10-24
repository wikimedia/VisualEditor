/**
 * VisualEditor data model InspectorFactory class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel Inspector factory.
 *
 * @class
 * @constructor
 * @extends {ve.Factory}
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
 * TODO: Use this in inspector tools to determine their state.
 *
 * @method
 * @param {String} type Annotation type
 * @returns {Function} Matching inspector constructor
 */
ve.ui.InspectorFactory.prototype.lookupByAnnotationType = function ( type ) {
	for ( var name in this.registry ) {
		// name = link
		if ( this.registry[name].static.matchingTypes.indexOf( type ) !== -1 ) {
			return this.registry[name];
		}
	}
};

/* Initialization */

ve.ui.inspectorFactory = new ve.ui.InspectorFactory();
