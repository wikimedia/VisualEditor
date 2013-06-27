/*!
 * VisualEditor UserInterface MWReferenceButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ReferenceWiki media insert button tool.
 *
 * @class
 * @extends ve.ui.DialogButtonTool
 *
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.MWReferenceInsertButtonTool = function VeUiMWReferenceButtonTool( toolbar, config ) {
	// Parent constructor
	ve.ui.DialogButtonTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWReferenceInsertButtonTool, ve.ui.DialogButtonTool );

/* Static Properties */

ve.ui.MWReferenceInsertButtonTool.static.name = 'mwReferenceInsert';

ve.ui.MWReferenceInsertButtonTool.static.icon = 'reference';

ve.ui.MWReferenceInsertButtonTool.static.titleMessage = 'visualeditor-dialogbutton-reference-insert-tooltip';

ve.ui.MWReferenceInsertButtonTool.static.dialog = 'mwReferenceInsert';

ve.ui.MWReferenceInsertButtonTool.static.modelClasses = [ ve.dm.MWReferenceNode ];

/* Registration */

ve.ui.toolFactory.register( 'mwReferenceInsert', ve.ui.MWReferenceInsertButtonTool );
