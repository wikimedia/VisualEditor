/*!
 * VisualEditor UserInterface GroupWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Create an ve.ui.GroupWidget object.
 *
 * @class
 * @abstract
 * @extends ve.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.GroupWidget = function VeUiGroupWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.items = [];
	this.$items = $( [] );
};

/* Inheritance */

ve.inheritClass( ve.ui.GroupWidget, ve.ui.Widget );

/* Events */

/**
 * @event select
 * @param {ve.ui.OutlineItemWidget|null} item Selected item or null if no item is selected
 */

/* Static Properties */

ve.ui.GroupWidget.static.tagName = 'div';

/* Methods */

/**
 * Get items.
 *
 * @method
 * @returns {ve.ui.OutlineItemWidget[]} Items
 */
ve.ui.GroupWidget.prototype.getItems = function () {
	return this.items.slice( 0 );
};

/**
 * Add items.
 *
 * @method
 * @param {ve.ui.Widget[]} items Item
 * @chainable
 */
ve.ui.GroupWidget.prototype.addItems = function ( items ) {
	var i, len, item;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];

		// Check if item exists then remove it first, effectively "moving" it
		if ( this.items.indexOf( item ) !== -1 ) {
			this.removeItems( [item] );
		}
		// Add the item
		this.items.push( item );
		this.$.append( item.$ );
		this.$items = this.$items.add( item.$ );
	}

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {ve.ui.Widget[]} items Items to remove
 * @chainable
 */
ve.ui.GroupWidget.prototype.removeItems = function ( items ) {
	var i, len, item, index;

	// Remove specific items
	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		index = this.items.indexOf( item );
		if ( index !== -1 ) {
			this.items.splice( index, 1 );
			item.$.detach();
			this.$items = this.$items.not( item.$ );
		}
	}

	return this;
};

/**
 * Clear all items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @chainable
 */
ve.ui.GroupWidget.prototype.clearItems = function () {
	this.items = [];
	this.$items.detach();

	return this;
};
