/*!
 * ObjectOriented UserInterface MenuWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Create an OO.ui.MenuWidget object.
 *
 * @class
 * @extends OO.ui.SelectWidget
 * @mixins OO.ui.ClippableElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {OO.ui.InputWidget} [input] Input to bind keyboard handlers to
 */
OO.ui.MenuWidget = function OoUiMenuWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.SelectWidget.call( this, config );

	// Mixin constructor
	OO.ui.ClippableElement.call( this, this.$group );

	// Properties
	this.newItems = [];
	this.$input = config.input ? config.input.$input : null;
	this.$previousFocus = null;
	this.isolated = !config.input;
	this.visible = false;
	this.onKeyDownHandler = OO.ui.bind( this.onKeyDown, this );

	// Initialization
	this.$.hide().addClass( 'oo-ui-menuWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.MenuWidget, OO.ui.SelectWidget );

OO.mixinClass( OO.ui.MenuWidget, OO.ui.ClippableElement );

/* Methods */

/**
 * Handles key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.MenuWidget.prototype.onKeyDown = function ( e ) {
	var nextItem,
		handled = false,
		highlightItem = this.getHighlightedItem();

	if ( !this.disabled && this.visible ) {
		if ( !highlightItem ) {
			highlightItem = this.getSelectedItem();
		}
		switch ( e.keyCode ) {
			case OO.ui.Keys.ENTER:
				this.selectItem( highlightItem );
				handled = true;
				break;
			case OO.ui.Keys.UP:
				nextItem = this.getRelativeSelectableItem( highlightItem, -1 );
				handled = true;
				break;
			case OO.ui.Keys.DOWN:
				nextItem = this.getRelativeSelectableItem( highlightItem, 1 );
				handled = true;
				break;
			case OO.ui.Keys.ESCAPE:
				if ( highlightItem ) {
					highlightItem.setHighlighted( false );
				}
				this.hide();
				handled = true;
				break;
		}

		if ( nextItem ) {
			this.highlightItem( nextItem );
			nextItem.scrollElementIntoView();
		}

		if ( handled ) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}
};

/**
 * Check if the menu is visible.
 *
 * @method
 * @returns {boolean} Menu is visible
 */
OO.ui.MenuWidget.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Bind key down listener
 *
 * @method
 */
OO.ui.MenuWidget.prototype.bindKeyDownListener = function () {
	if ( this.$input ) {
		this.$input.on( 'keydown', this.onKeyDownHandler );
	} else {
		// Capture menu navigation keys
		this.getElementWindow().addEventListener( 'keydown', this.onKeyDownHandler, true );
	}
};

/**
 * Unbind key down listener
 *
 * @method
 */
OO.ui.MenuWidget.prototype.unbindKeyDownListener = function () {
	if ( this.$input ) {
		this.$input.off( 'keydown' );
	} else {
		this.getElementWindow().removeEventListener( 'keydown', this.onKeyDownHandler, true );
	}
};

/**
 * Select an item.
 *
 * The menu will stay open if an item is silently selected.
 *
 * @method
 * @param {OO.ui.OptionWidget} [item] Item to select, omit to deselect all
 * @chainable
 */
OO.ui.MenuWidget.prototype.selectItem = function ( item ) {
	// Parent method
	OO.ui.SelectWidget.prototype.selectItem.call( this, item );

	if ( !this.disabled ) {
		if ( item ) {
			this.disabled = true;
			item.flash( OO.ui.bind( function () {
				this.hide();
				this.disabled = false;
			}, this ) );
		} else {
			this.hide();
		}
	}

	return this;
};

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {OO.ui.MenuItemWidget[]} items Items to add
 * @param {number} [index] Index to insert items after
 * @chainable
 */
OO.ui.MenuWidget.prototype.addItems = function ( items, index ) {
	var i, len, item;

	// Parent method
	OO.ui.SelectWidget.prototype.addItems.call( this, items, index );

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		if ( this.visible ) {
			// Defer fitting label until
			item.fitLabel();
		} else {
			this.newItems.push( item );
		}
	}

	return this;
};

/**
 * Show the menu.
 *
 * @method
 * @chainable
 */
OO.ui.MenuWidget.prototype.show = function () {
	var i, len;

	if ( this.items.length ) {
		this.$.show();
		this.visible = true;
		this.bindKeyDownListener();

		// Change focus to enable keyboard navigation
		if ( this.isolated && this.$input && !this.$input.is( ':focus' ) ) {
			this.$previousFocus = this.$$( ':focus' );
			this.$input.focus();
		}
		if ( this.newItems.length ) {
			for ( i = 0, len = this.newItems.length; i < len; i++ ) {
				this.newItems[i].fitLabel();
			}
			this.newItems = [];
		}

		this.setClipping( true );
	}

	return this;
};

/**
 * Hide the menu.
 *
 * @method
 * @chainable
 */
OO.ui.MenuWidget.prototype.hide = function () {
	this.$.hide();
	this.visible = false;
	this.unbindKeyDownListener();

	if ( this.isolated && this.$previousFocus ) {
		this.$previousFocus.focus();
		this.$previousFocus = null;
	}

	this.setClipping( false );

	return this;
};
