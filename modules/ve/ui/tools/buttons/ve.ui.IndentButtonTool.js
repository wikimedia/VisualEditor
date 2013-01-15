/*!
 * VisualEditor UserInterface IndentButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface indent button tool.
 *
 * @class
 * @extends ve.ui.IndentationButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.IndentButtonTool = function VeUiIndentButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.IndentationButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.IndentButtonTool, ve.ui.IndentationButtonTool );

/* Static Properties */

ve.ui.IndentButtonTool.static.name = 'indent';

ve.ui.IndentButtonTool.static.titleMessage = 'visualeditor-indentationbutton-indent-tooltip';

ve.ui.IndentButtonTool.static.method = 'increase';

/* Registration */

ve.ui.toolFactory.register( 'indent', ve.ui.IndentButtonTool );
