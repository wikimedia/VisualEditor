/*!
 * VisualEditor UserInterface AnnotationButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface annotation button tool.
 *
 * @abstract
 * @class
 * @extends ve.ui.ButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.AnnotationButtonTool = function VeUiAnnotationButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.ButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.AnnotationButtonTool, ve.ui.ButtonTool );

/* Static Properties */

/**
 * Annotation name and data the button applies.
 *
 * @abstract
 * @static
 * @property
 * @type {Object}
 */
ve.ui.AnnotationButtonTool.static.annotation = { 'name': '' };

/* Methods */

/**
 * Handle the button being clicked.
 *
 * @method
 */
ve.ui.AnnotationButtonTool.prototype.onClick = function () {
	this.toolbar.getSurface().execute(
		'annotation', 'toggle', this.constructor.static.annotation.name
	);
};

/**
 * Handle the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.AnnotationSet} partial Annotations that cover some or all of the current selection
 */
ve.ui.AnnotationButtonTool.prototype.onUpdateState = function ( nodes, full ) {
	this.setActive( full.hasAnnotationWithName( this.constructor.static.annotation.name ) );
};
