/*!
 * VisualEditor UserInterface MediaButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface content button tool.
 *
 * @class
 * @extends ve.ui.DialogButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.MediaButtonTool = function VeUiMediaButtonTool( toolbar, config ) {
	// Parent constructor
	ve.ui.DialogButtonTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MediaButtonTool, ve.ui.DialogButtonTool );

/* Static Properties */

ve.ui.MediaButtonTool.static.name = 'media';

ve.ui.MediaButtonTool.static.icon = 'picture';

ve.ui.MediaButtonTool.static.titleMessage =
	'visualeditor-dialogbutton-media-tooltip';

ve.ui.MediaButtonTool.static.dialog = 'media';

/* Registration */

ve.ui.toolFactory.register( 'media', ve.ui.MediaButtonTool );
