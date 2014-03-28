/*!
 * VisualEditor UserInterface Tool classes.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface annotation tool.
 *
 * @class
 * @abstract
 * @extends OO.ui.Tool
 *
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.Tool = function VeUiTool( toolGroup, config ) {
	// Parent constructor
	OO.ui.Tool.call( this, toolGroup, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.Tool, OO.ui.Tool );

/* Static Properties */

/**
 * This tool requires this surface to be focused to work
 * @type {boolean}
 */
ve.ui.Tool.static.requiresRange = false;

/* Methods */

/**
 * Handle the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.dm.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.dm.AnnotationSet} partial Annotations that cover some or all of the current selection
 * @param {ve.Range|null} range The surface range
 */
ve.ui.Tool.prototype.onUpdateState = function ( nodes, full, partial, range ) {
	this.setDisabled( this.constructor.static.requiresRange && !range );
};
