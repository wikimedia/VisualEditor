/*!
 * VisualEditor UserInterface MWTemplateButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Template button tool.
 *
 * @class
 * @extends ve.ui.DialogButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.MWTemplateButtonTool = function VeUiMwTemplateButtonTool( toolbar, config ) {
	// Parent constructor
	ve.ui.DialogButtonTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWTemplateButtonTool, ve.ui.DialogButtonTool );

/* Static Properties */

ve.ui.MWTemplateButtonTool.static.name = 'mwTemplate';

ve.ui.MWTemplateButtonTool.static.icon = 'template';

ve.ui.MWTemplateButtonTool.static.titleMessage = 'visualeditor-dialogbutton-template-tooltip';

ve.ui.MWTemplateButtonTool.static.dialog = 'mwTemplate';

/* Registration */

ve.ui.toolFactory.register( 'mwTemplate', ve.ui.MWTemplateButtonTool );
