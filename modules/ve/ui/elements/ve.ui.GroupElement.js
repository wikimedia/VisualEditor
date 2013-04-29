/*!
 * VisualEditor UserInterface GroupElement class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Group element.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $group Group element
 */
ve.ui.GroupElement = function VeUiGroupElement( $group ) {
	// Properties
	this.$group = $group;
	this.items = [];
	this.$items = this.$$( [] );
};

/* Methods */

/**
 * Get items.
 *
 * @method
 * @returns {ve.ui.Element[]} Items
 */
ve.ui.GroupElement.prototype.getItems = function () {
	return this.items.slice( 0 );
};

/**
 * Add items.
 *
 * @method
 * @param {ve.ui.Element[]} items Item
 * @chainable
 */
ve.ui.GroupElement.prototype.addItems = function ( items ) {
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
 * @param {ve.ui.Element[]} items Items to remove
 * @chainable
 */
ve.ui.GroupElement.prototype.removeItems = function ( items ) {
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
ve.ui.GroupElement.prototype.clearItems = function () {
	this.items = [];
	this.$items.detach();

	return this;
};
