/*!
 * VisualEditor UserInterface BulletListButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface bullet button tool.
 *
 * @class
 * @extends ve.ui.ListButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.BulletButtonTool = function VeUiBulletButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.ListButtonTool.call( this, toolbar, 'bullet' );
};

/* Inheritance */

ve.inheritClass( ve.ui.BulletButtonTool, ve.ui.ListButtonTool );

/* Static Properties */

ve.ui.BulletButtonTool.static.name = 'bullet';

ve.ui.BulletButtonTool.static.icon = 'bullet-list';

ve.ui.BulletButtonTool.static.titleMessage = 'visualeditor-listbutton-bullet-tooltip';

ve.ui.BulletButtonTool.static.style = 'bullet';

/* Registration */

ve.ui.toolFactory.register( 'bullet', ve.ui.BulletButtonTool );
