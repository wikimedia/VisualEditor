/*!
 * VisualEditor UserInterface InspectorFactory class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface inspector factory.
 *
 * @class
 * @extends OO.Factory
 * @constructor
 */
ve.ui.InspectorFactory = function VeUiInspectorFactory() {
	// Parent constructor
	OO.Factory.call( this );
};

/* Inheritance */

OO.inheritClass( ve.ui.InspectorFactory, OO.Factory );

/* Initialization */

ve.ui.inspectorFactory = new ve.ui.InspectorFactory();
