/*!
 * VisualEditor UserInterface InspectorButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface inspector button tool.
 *
 * @abstract
 * @class
 * @extends ve.ui.ButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.InspectorButtonTool = function VeUiInspectorButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.ButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.InspectorButtonTool, ve.ui.ButtonTool );

/* Static Properties */

/**
 * Symbolic name of inspector the button opens.
 *
 * @abstract
 * @static
 * @property
 * @type {string}
 */
ve.ui.InspectorButtonTool.static.inspector = '';

/* Methods */

/**
 * Handle the button being clicked.
 *
 * @method
 */
ve.ui.InspectorButtonTool.prototype.onClick = function () {
	this.toolbar.getSurface().execute( 'inspector', 'open', this.constructor.static.inspector );
};

/**
 * Handle the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.AnnotationSet} partial Annotations that cover some or all of the current selection
 */
ve.ui.InspectorButtonTool.prototype.onUpdateState = function ( nodes, full ) {
	this.setActive(
		full.hasAnnotationWithName(
			ve.ui.inspectorFactory.getTypePattern( this.constructor.static.inspector )
		)
	);
};
