/*!
 * VisualEditor UserInterface MWFormatDropdownTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface format dropdown tool.
 *
 * @class
 * @extends ve.ui.FormatDropdownTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.MWFormatDropdownTool = function VeUiMwFormatDropdownTool( toolbar, config ) {
	// Parent constructor
	ve.ui.FormatDropdownTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWFormatDropdownTool, ve.ui.FormatDropdownTool );

/* Static Properties */

ve.ui.MWFormatDropdownTool.static.name = 'mwFormat';

ve.ui.MWFormatDropdownTool.static.cssName = 'format';

ve.ui.MWFormatDropdownTool.static.items[1].data.type = 'MWheading';
ve.ui.MWFormatDropdownTool.static.items[2].data.type = 'MWheading';
ve.ui.MWFormatDropdownTool.static.items[3].data.type = 'MWheading';
ve.ui.MWFormatDropdownTool.static.items[4].data.type = 'MWheading';
ve.ui.MWFormatDropdownTool.static.items[5].data.type = 'MWheading';
ve.ui.MWFormatDropdownTool.static.items[6].data.type = 'MWheading';
ve.ui.MWFormatDropdownTool.static.items[7].data.type = 'MWpreformatted';

/* Registration */

ve.ui.toolFactory.register( 'mwFormat', ve.ui.MWFormatDropdownTool );
