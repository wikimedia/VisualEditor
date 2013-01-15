/*!
 * VisualEditor UserInterface NumberListButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface number button tool.
 *
 * @class
 * @extends ve.ui.ListButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.NumberButtonTool = function VeUiNumberButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.ListButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.NumberButtonTool, ve.ui.ListButtonTool );

/* Static Properties */

ve.ui.NumberButtonTool.static.name = 'number';

ve.ui.NumberButtonTool.static.titleMessage = 'visualeditor-listbutton-number-tooltip';

ve.ui.NumberButtonTool.static.style = 'number';

/* Registration */

ve.ui.toolFactory.register( 'number', ve.ui.NumberButtonTool );
