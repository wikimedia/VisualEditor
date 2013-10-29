/*!
 * ObjectOriented UserInterface PanelLayout class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Layout that expands to cover the entire area of its parent, with optional scrolling and padding.
 *
 * @class
 * @extends OO.ui.Layout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [scrollable] Allow vertical scrolling
 * @cfg {boolean} [padded] Pad the content from the edges
 */
OO.ui.PanelLayout = function OoUiPanelLayout( config ) {
	// Config initialization
	config = config || {};

	// Parent constructor
	OO.ui.Layout.call( this, config );

	// Initialization
	this.$.addClass( 'oo-ui-panelLayout' );
	if ( config.scrollable ) {
		this.$.addClass( 'oo-ui-panelLayout-scrollable' );
	}

	if ( config.padded ) {
		this.$.addClass( 'oo-ui-panelLayout-padded' );
	}

	// Add directionality class:
	this.$.addClass( 'oo-ui-' + this.$$.frame.dir );
};

/* Inheritance */

OO.inheritClass( OO.ui.PanelLayout, OO.ui.Layout );
