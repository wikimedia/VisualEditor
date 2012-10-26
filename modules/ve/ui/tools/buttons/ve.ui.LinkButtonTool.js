/**
 * VisualEditor user interface LinkButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LinkButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.InspectorButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.LinkButtonTool = function VeUiLinkButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.InspectorButtonTool.call( this, toolbar, 'link' );
};

/* Inheritance */

ve.inheritClass( ve.ui.LinkButtonTool, ve.ui.InspectorButtonTool );

/* Static Members */

ve.ui.LinkButtonTool.static.name = 'link';

ve.ui.LinkButtonTool.static.titleMessage = 'visualeditor-annotationbutton-link-tooltip';

/* Methods */

/**
 * Responds to the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.dm.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.dm.AnnotationSet} partial Annotations that cover some or all of the current selection
 */
ve.ui.LinkButtonTool.prototype.onUpdateState = function ( nodes, full ) {
	this.setActive( full.hasAnnotationWithName( /^link\/MW(in|ex)ternal$/ ) );
};

/* Registration */

ve.ui.toolFactory.register( 'link', ve.ui.LinkButtonTool );
