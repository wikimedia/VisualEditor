/*!
 * VisualEditor UserInterface ToolFactory class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface tool factory.
 *
 * @class
 * @extends ve.Factory
 * @constructor
 */
ve.ui.ToolFactory = function VeUiToolFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.ui.ToolFactory, ve.Factory );

/* Initialization */

ve.ui.toolFactory = new ve.ui.ToolFactory();
