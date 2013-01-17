/*!
 * VisualEditor UserInterface BoldButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface bold button tool.
 *
 * @class
 * @extends ve.ui.AnnotationButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.BoldButtonTool = function VeUiBoldButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.AnnotationButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.BoldButtonTool, ve.ui.AnnotationButtonTool );

/* Static Properties */

ve.ui.BoldButtonTool.static.name = 'bold';

ve.ui.BoldButtonTool.static.titleMessage = 'visualeditor-annotationbutton-bold-tooltip';

ve.ui.BoldButtonTool.static.annotation = { 'name': 'textStyle/bold' };

/* Registration */

ve.ui.toolFactory.register( 'bold', ve.ui.BoldButtonTool );

ve.commandRegistry.register( 'bold', 'annotation', 'toggle', 'textStyle/bold' );

ve.triggerRegistry.register( {
	'name': ve.init.platform.getUserLanguage() + '.bold',
	'trigger': {
		'mac': 'cmd+b',
		'pc': 'ctrl+b'
	},
	'labelMessage': {
		'mac': 'visualeditor-annotationbutton-bold-tooltip-trigger-mac',
		'pc': 'visualeditor-annotationbutton-bold-tooltip-trigger-pc'
	}
} );
