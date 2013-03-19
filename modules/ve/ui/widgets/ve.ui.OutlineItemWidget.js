/*!
 * VisualEditor UserInterface OutlineItemWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.OutlineItemWidget object.
 *
 * @class
 * @extends ve.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Config options
 */
ve.ui.OutlineItemWidget = function VeUiOutlineItemWidget( data, config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.OptionWidget.call( this, data, config );

	// Initialization
	this.$.addClass( 've-ui-outlineItemWidget' );
	if ( config.icon ) {
		this.$.addClass( 've-ui-icon-' + config.icon );
	}
};

/* Inheritance */

ve.inheritClass( ve.ui.OutlineItemWidget, ve.ui.OptionWidget );

/* Static Properties */

ve.ui.OutlineItemWidget.static.highlightable = false;
