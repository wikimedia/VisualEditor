/*!
 * VisualEditor user interface MWLinkButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.MWLinkButtonTool object.
 *
 * @class
 * @extends ve.ui.LinkButtonTool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.MWLinkButtonTool = function VeUiMwLinkButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.LinkButtonTool.call( this, toolbar );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWLinkButtonTool, ve.ui.LinkButtonTool );

/* Static Members */

ve.ui.MWLinkButtonTool.static.name = 'link';

ve.ui.MWLinkButtonTool.static.inspector = 'mwLink';

/* Registration */

ve.ui.toolFactory.register( 'mwLink', ve.ui.MWLinkButtonTool );

ve.commandRegistry.register( 'mwLink', 'inspector', 'open', 'mwLink' );

ve.triggerRegistry.register( {
	'name': ve.init.platform.getUserLanguage() + '.mwLink',
	'trigger': {
		'mac': 'cmd+k',
		'pc': 'ctrl+k'
	},
	'labelMessage': {
		'mac': 'visualeditor-annotationbutton-link-tooltip-trigger-mac',
		'pc': 'visualeditor-annotationbutton-link-tooltip-trigger-pc'
	}
} );
