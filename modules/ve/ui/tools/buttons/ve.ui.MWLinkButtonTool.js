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

ve.ui.MWLinkButtonTool.static.name = 'mwLink';

ve.ui.MWLinkButtonTool.static.inspector = 'mwLink';

/* Registration */

ve.ui.toolFactory.register( 'mwLink', ve.ui.MWLinkButtonTool );

ve.commandRegistry.register( 'mwLink', 'inspector', 'open', 'mwLink' );

ve.triggerRegistry.register(
	'mwLink', { 'mac': new ve.Trigger( 'cmd+k' ), 'pc': new ve.Trigger( 'ctrl+k' ) }
);
