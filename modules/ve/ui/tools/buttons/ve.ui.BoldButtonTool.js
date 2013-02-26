/*!
 * VisualEditor UserInterface BoldButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface bold button tool.
 *
 * @class
 * @extends ve.ui.AnnotationButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.BoldButtonTool = function VeUiBoldButtonTool( toolbar, config ) {
	// Parent constructor
	ve.ui.AnnotationButtonTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.BoldButtonTool, ve.ui.AnnotationButtonTool );

/* Static Properties */

ve.ui.BoldButtonTool.static.name = 'bold';

ve.ui.BoldButtonTool.static.icon = {
	'default': 'bold-a',
	'en': 'bold-b',
	'de': 'bold-f'
};

ve.ui.BoldButtonTool.static.titleMessage = 'visualeditor-annotationbutton-bold-tooltip';

ve.ui.BoldButtonTool.static.annotation = { 'name': 'textStyle/bold' };

/* Registration */

ve.ui.toolFactory.register( 'bold', ve.ui.BoldButtonTool );

ve.commandRegistry.register( 'bold', 'annotation', 'toggle', 'textStyle/bold' );

ve.triggerRegistry.register(
	'bold', { 'mac': new ve.Trigger( 'cmd+b' ), 'pc': new ve.Trigger( 'ctrl+b' ) }
);
