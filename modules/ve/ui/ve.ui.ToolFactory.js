/*!
 * VisualEditor ToolFactory class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Tool factory.
 *
 * @class
 * @extends ve.Factory
 * @constructor
 */
ve.ToolFactory = function VeToolFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.ToolFactory, ve.Factory );

/* Initialization */

ve.ui.toolFactory = new ve.ToolFactory();
