/*!
 * VisualEditor UserInterface OutdentButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface outdent button tool.
 *
 * @class
 * @extends ve.ui.IndentationButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.OutdentButtonTool = function VeUiOutdentButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.IndentationButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.OutdentButtonTool, ve.ui.IndentationButtonTool );

/* Static Properties */

ve.ui.OutdentButtonTool.static.name = 'outdent';

ve.ui.OutdentButtonTool.static.titleMessage = 'visualeditor-indentationbutton-outdent-tooltip';

ve.ui.OutdentButtonTool.static.method = 'decrease';

/* Registration */

ve.ui.toolFactory.register( 'outdent', ve.ui.OutdentButtonTool );

// TODO: Consistency between outdent and unindent.
ve.commandRegistry.register( 'outdent', 'indentation', 'decrease' );

ve.triggerRegistry.register( 'outdent', new ve.Trigger( 'shift+tab' ) );
