/*!
 * VisualEditor UserInterface MWMetaButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Meta button tool.
 *
 * @class
 * @extends ve.ui.DialogButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.MWMetaButtonTool = function VeUiMWMetaButtonTool( toolbar, config ) {
	// Parent constructor
	ve.ui.DialogButtonTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWMetaButtonTool, ve.ui.DialogButtonTool );

/* Static Properties */

ve.ui.MWMetaButtonTool.static.name = 'mwMeta';

ve.ui.MWMetaButtonTool.static.icon = 'settings';

ve.ui.MWMetaButtonTool.static.titleMessage = 'visualeditor-dialogbutton-meta-tooltip';

ve.ui.MWMetaButtonTool.static.dialog = 'mwMeta';

/* Registration */

ve.ui.toolFactory.register( 'mwMeta', ve.ui.MWMetaButtonTool );
