/*!
 * VisualEditor UserInterface MWReferenceEditButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Reference edit button tool.
 *
 * @class
 * @extends ve.ui.DialogButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.MWReferenceEditButtonTool = function VeUiMwReferenceEditButtonTool( toolbar, config ) {
	// Parent constructor
	ve.ui.DialogButtonTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWReferenceEditButtonTool, ve.ui.DialogButtonTool );

/* Static Properties */

ve.ui.MWReferenceEditButtonTool.static.name = 'mwReferenceEdit';

ve.ui.MWReferenceEditButtonTool.static.icon = 'reference';

ve.ui.MWReferenceEditButtonTool.static.titleMessage = 'visualeditor-dialogbutton-reference-tooltip';

ve.ui.MWReferenceEditButtonTool.static.dialog = 'mwReferenceEdit';

ve.ui.MWReferenceEditButtonTool.static.modelClasses = [ ve.dm.MWReferenceNode ];

/* Registration */

ve.ui.toolFactory.register( 'mwReferenceEdit', ve.ui.MWReferenceEditButtonTool );
