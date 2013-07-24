/*!
 * VisualEditor UserInterface ItalicButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface italic button tool.
 *
 * @class
 * @extends ve.ui.AnnotationButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.ItalicButtonTool = function VeUiItalicButtonTool( toolbar, config ) {
	// Parent constructor
	ve.ui.AnnotationButtonTool.call( this, toolbar, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.ItalicButtonTool, ve.ui.AnnotationButtonTool );

/* Static Properties */

ve.ui.ItalicButtonTool.static.name = 'italic';

ve.ui.ItalicButtonTool.static.icon = {
	'default': 'italic-a',
	'en': 'italic-i',
	'cs': 'italic-i',
	'da': 'italic-k',
	'de': 'italic-k',
	'es': 'italic-c',
	'eu': 'italic-e',
	'fr': 'italic-i',
	'gl': 'italic-c',
	'he': 'italic-i',
	'hu': 'italic-d',
	'it': 'italic-c',
	'ml': 'italic-i',
	'nl': 'italic-c',
	'nn': 'italic-k',
	'no': 'italic-k',
	'pl': 'italic-i',
	'pt': 'italic-i',
	'pt-br': 'italic-i',
	'sv': 'italic-k'
};

ve.ui.ItalicButtonTool.static.titleMessage = 'visualeditor-annotationbutton-italic-tooltip';

ve.ui.ItalicButtonTool.static.annotation = { 'name': 'textStyle/italic' };

/* Registration */

ve.ui.toolFactory.register( 'italic', ve.ui.ItalicButtonTool );

ve.ui.commandRegistry.register(
	'italic', 'annotation', 'toggle', 'textStyle/italic'
);

ve.ui.triggerRegistry.register(
	'italic', { 'mac': new ve.ui.Trigger( 'cmd+i' ), 'pc': new ve.ui.Trigger( 'ctrl+i' ) }
);
