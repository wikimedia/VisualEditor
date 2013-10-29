/*!
 * ObjectOriented UserInterface StackPanelLayout class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Layout containing a series of mutually exclusive pages.
 *
 * @class
 * @extends OO.ui.PanelLayout
 * @mixins OO.ui.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [icon=''] Symbolic icon name
 */
OO.ui.StackPanelLayout = function OoUiStackPanelLayout( config ) {
	// Config initialization
	config = OO.ui.extendObject( { 'scrollable': true }, config );

	// Parent constructor
	OO.ui.PanelLayout.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, this.$, config );

	// Properties
	this.currentItem = null;

	// Initialization
	this.$.addClass( 'oo-ui-stackPanelLayout' );
};

/* Inheritance */

OO.inheritClass( OO.ui.StackPanelLayout, OO.ui.PanelLayout );

OO.mixinClass( OO.ui.StackPanelLayout, OO.ui.GroupElement );

/* Methods */

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {OO.ui.PanelLayout[]} items Items to add
 * @param {number} [index] Index to insert items after
 * @chainable
 */
OO.ui.StackPanelLayout.prototype.addItems = function ( items, index ) {
	var i, len;

	for ( i = 0, len = items.length; i < len; i++ ) {
		if ( !this.currentItem ) {
			this.showItem( items[i] );
		} else {
			items[i].$.hide();
		}
	}
	OO.ui.GroupElement.prototype.addItems.call( this, items, index );

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {OO.ui.PanelLayout[]} items Items to remove
 * @chainable
 */
OO.ui.StackPanelLayout.prototype.removeItems = function ( items ) {
	OO.ui.GroupElement.prototype.removeItems.call( this, items );
	if ( items.indexOf( this.currentItem ) !== -1 ) {
		this.currentItem = null;
		if ( !this.currentItem && this.items.length ) {
			this.showItem( this.items[0] );
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
OO.ui.StackPanelLayout.prototype.clearItems = function () {
	this.currentItem = null;
	OO.ui.GroupElement.prototype.clearItems.call( this );

	return this;
};

/**
 * Show item.
 *
 * Any currently shown item will be hidden.
 *
 * @method
 * @param {OO.ui.PanelLayout} item Item to show
 * @chainable
 */
OO.ui.StackPanelLayout.prototype.showItem = function ( item ) {
	this.$items.hide();
	item.$.show();
	this.currentItem = item;

	return this;
};
