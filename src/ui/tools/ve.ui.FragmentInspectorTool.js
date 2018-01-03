/*!
 * VisualEditor UserInterface FragmentInspectorTool classes.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * UserInterface fragment inspector tool.
 *
 * @abstract
 * @class
 * @extends ve.ui.FragmentWindowTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.FragmentInspectorTool = function VeUiFragmentInspectorTool() {
	// Parent constructor
	ve.ui.FragmentInspectorTool.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.FragmentInspectorTool, ve.ui.FragmentWindowTool );

/* Static Properties */

ve.ui.FragmentInspectorTool.static.makesEmbeddableContextItem = false;

/* Methods */

// Deprecated alias
ve.ui.InspectorTool = ve.ui.FragmentInspectorTool;

/**
 * UserInterface link tool.
 *
 * @class
 * @extends ve.ui.FragmentInspectorTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.LinkInspectorTool = function VeUiLinkInspectorTool() {
	ve.ui.LinkInspectorTool.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.LinkInspectorTool, ve.ui.FragmentInspectorTool );
ve.ui.LinkInspectorTool.static.name = 'link';
ve.ui.LinkInspectorTool.static.group = 'meta';
ve.ui.LinkInspectorTool.static.icon = 'link';
ve.ui.LinkInspectorTool.static.title =
	OO.ui.deferMsg( 'visualeditor-annotationbutton-link-tooltip' );
ve.ui.LinkInspectorTool.static.modelClasses = [ ve.dm.LinkAnnotation ];
ve.ui.LinkInspectorTool.static.commandName = 'link';

ve.ui.LinkInspectorTool.prototype.getSelectedModels = function ( fragment ) {
	var surfaceView,
		selection = fragment && fragment.getSelection();

	// Ask the CE surface about selected models, so it can give the right
	// answer about links based on the CE selection.
	if ( selection instanceof ve.dm.LinearSelection ) {
		surfaceView = this.toolbar.getSurface().getView();
		if ( selection.equals( surfaceView.getModel().getSelection() ) ) {
			return surfaceView.getSelectedModels();
		}
	}

	return ve.ui.LinkInspectorTool.super.prototype.getSelectedModels.apply( this, arguments );
};

ve.ui.toolFactory.register( ve.ui.LinkInspectorTool );

/**
 * UserInterface comment tool.
 *
 * @class
 * @extends ve.ui.FragmentInspectorTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.CommentInspectorTool = function VeUiCommentInspectorTool() {
	ve.ui.CommentInspectorTool.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.CommentInspectorTool, ve.ui.FragmentInspectorTool );
ve.ui.CommentInspectorTool.static.name = 'comment';
ve.ui.CommentInspectorTool.static.group = 'meta';
ve.ui.CommentInspectorTool.static.icon = 'notice';
ve.ui.CommentInspectorTool.static.title =
	OO.ui.deferMsg( 'visualeditor-commentinspector-tooltip' );
ve.ui.CommentInspectorTool.static.modelClasses = [ ve.dm.CommentNode ];
ve.ui.CommentInspectorTool.static.commandName = 'comment';
ve.ui.CommentInspectorTool.static.deactivateOnSelect = true;
ve.ui.toolFactory.register( ve.ui.CommentInspectorTool );
