/*!
 * VisualEditor UserInterface PanelLayout class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Panel layout.
 *
 * @class
 * @extends ve.ui.Layout
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {boolean} [scroll] Allow vertical scrolling
 */
ve.ui.PanelLayout = function VeUiPanelLayout( config ) {
	// Config initialization
	config = config || {};

	// Parent constructor
	ve.ui.Layout.call( this, config );

	// Initialization
	this.$.addClass( 've-ui-panelLayout' );
	if ( config.scroll ) {
		this.$.css( 'overflow-x', 'auto' );
	}
};

/* Inheritance */

ve.inheritClass( ve.ui.PanelLayout, ve.ui.Layout );
