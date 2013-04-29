/*!
 * VisualEditor UserInterface MWCategoryItemWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.MWCategoryItemWidget object.
 *
 * @class
 * @abstract
 * @extends ve.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {Object} [metaItem] Meta Item Reference
 */
ve.ui.MWCategoryItemWidget = function VeUiMWCategoryItemWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.name = config.item.name;
	this.value = config.item.value;
	this.sortKey = config.item.sortKey || '';
	this.metaItem = config.item.metaItem;
	this.menuOpen = false;
	this.$label = this.$$( '<span>' );
	this.$arrow = this.$$( '<div>' );
	this.$categoryItem = this.$$( '<div>' );

	// Events
	this.$categoryItem.on( {
		'click':  ve.bind( this.onClick, this ),
		'mounsedown': ve.bind( this.onMouseDown, this )
	} );

	// Initialization
	this.$label.text( this.value );
	this.$arrow.addClass( 've-ui-mwCategoryListItemControl ve-ui-icon-down' );
	this.$categoryItem
		.addClass( 've-ui-mwCategoryListItemButton' )
		.append( this.$label, this.$arrow, this.$$( '<div>' ).css( 'clear', 'both' ) );
	this.$
		.addClass( 've-ui-mwCategoryListItemWidget' )
		.append( this.$categoryItem );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWCategoryItemWidget, ve.ui.Widget );

/* Events */

/**
 * @event savePopupState
 */

/**
 * @event togglePopupMenu
 * @param {ve.ui.MWCategoryItemWidget} item Item to load into popup
 */

/* Methods */

/**
 * Emits savePopupState on mousedown
 */
ve.ui.MWCategoryItemWidget.prototype.onMouseDown = function () {
	this.emit( 'savePopupState' );
};

/**
 * Emits togglePopupMenu on click
 */
ve.ui.MWCategoryItemWidget.prototype.onClick = function () {
	this.emit( 'togglePopupMenu', this );
};
