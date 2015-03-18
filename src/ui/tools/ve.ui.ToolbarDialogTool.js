/*!
 * VisualEditor UserInterface ToolbarDialogTool class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * UserInterface toolbar dialog tool.
 *
 * @abstract
 * @class
 * @extends ve.ui.DialogTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.ToolbarDialogTool = function VeUiToolbarDialogTool() {
	// Parent constructor
	ve.ui.ToolbarDialogTool.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ui.ToolbarDialogTool, ve.ui.DialogTool );

/* Static Properties */

ve.ui.ToolbarDialogTool.static.deactivateOnSelect = false;

/**
 * Name of the associated window
 *
 * The tool will display as active only if this window is open
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.ToolbarDialogTool.static.activeWindow = null;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.ToolbarDialogTool.prototype.onUpdateState = function () {
	// Parent method
	ve.ui.ToolbarDialogTool.super.prototype.onUpdateState.apply( this, arguments );

	// Show the tool as active if its associated window is open
	var currentWindow = this.toolbar.getSurface().getToolbarDialogs().currentWindow;
	this.setActive( currentWindow && currentWindow.constructor.static.name === this.constructor.static.activeWindow );
};

/**
 * Find and replace tool.
 *
 * @class
 * @extends ve.ui.ToolbarDialogTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.FindAndReplaceTool = function VeUiFindAndReplaceTool() {
	ve.ui.FindAndReplaceTool.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.FindAndReplaceTool, ve.ui.ToolbarDialogTool );
ve.ui.FindAndReplaceTool.static.name = 'findAndReplace';
ve.ui.FindAndReplaceTool.static.group = 'dialog';
ve.ui.FindAndReplaceTool.static.icon = 'find';
ve.ui.FindAndReplaceTool.static.title =
	OO.ui.deferMsg( 'visualeditor-find-and-replace-title' );
ve.ui.FindAndReplaceTool.static.autoAddToCatchall = false;
ve.ui.FindAndReplaceTool.static.autoAddToGroup = false;
ve.ui.FindAndReplaceTool.static.commandName = 'findAndReplace';
ve.ui.FindAndReplaceTool.static.activeWindow = 'findAndReplace';
ve.ui.toolFactory.register( ve.ui.FindAndReplaceTool );

/**
 * Special character tool.
 *
 * @class
 * @extends ve.ui.ToolbarDialogTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.SpecialCharacterDialogTool = function VeUiSpecialCharacterDialogTool() {
	ve.ui.SpecialCharacterDialogTool.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.SpecialCharacterDialogTool, ve.ui.ToolbarDialogTool );
ve.ui.SpecialCharacterDialogTool.static.name = 'specialCharacter';
ve.ui.SpecialCharacterDialogTool.static.group = 'dialog';
ve.ui.SpecialCharacterDialogTool.static.icon = 'special-character';
ve.ui.SpecialCharacterDialogTool.static.title =
	OO.ui.deferMsg( 'visualeditor-specialcharacter-button-tooltip' );
ve.ui.SpecialCharacterDialogTool.static.autoAddToCatchall = false;
ve.ui.SpecialCharacterDialogTool.static.autoAddToGroup = false;
ve.ui.SpecialCharacterDialogTool.static.commandName = 'specialCharacter';
ve.ui.SpecialCharacterDialogTool.static.activeWindow = 'specialCharacter';
ve.ui.toolFactory.register( ve.ui.SpecialCharacterDialogTool );
