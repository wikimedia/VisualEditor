/**
 * VisualEditor user interface InspectorButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.InspectorButtonTool object.
 *
 * @abstract
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} inspector
 */
ve.ui.InspectorButtonTool = function VeUiInspectorButtonTool( toolbar, inspector ) {
	// Parent constructor
	ve.ui.ButtonTool.call( this, toolbar );

	// Properties
	this.inspector = inspector;
};

/* Inheritance */

ve.inheritClass( ve.ui.InspectorButtonTool, ve.ui.ButtonTool );

/* Methods */

/**
 * Responds to the button being clicked.
 *
 * @method
 */
ve.ui.InspectorButtonTool.prototype.onClick = function () {
	this.toolbar.getSurface().execute( 'inspector', 'open', this.inspector );
};
