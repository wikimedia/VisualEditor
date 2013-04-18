/*!
 * VisualEditor UserInterface SelectWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Create an ve.ui.SelectWidget object.
 *
 * @class
 * @abstract
 * @extends ve.ui.Widget
 * @mixin ve.ui.GroupElement
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.SelectWidget = function VeUiSelectWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Mixin constructors
	ve.ui.GroupElement.call( this, this.$, config );

	// Properties
	this.pressed = false;
	this.selecting = null;
	this.hashes = {};

	// Events
	this.$.on( {
		'mousedown': ve.bind( this.onMouseDown, this ),
		'mouseup': ve.bind( this.onMouseUp, this ),
		'mousemove': ve.bind( this.onMouseMove, this ),
		'mouseover': ve.bind( this.onMouseOver, this )
	} );

	// Initialization
	this.$.addClass( 've-ui-selectWidget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.SelectWidget, ve.ui.Widget );

ve.mixinClass( ve.ui.SelectWidget, ve.ui.GroupElement );

/* Events */

/**
 * @event select
 * @param {ve.ui.OptionWidget|null} item Selected item or null if no item is selected
 */

/* Static Properties */

ve.ui.SelectWidget.static.tagName = 'ul';

/* Methods */

/**
 * Handle mouse down events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.SelectWidget.prototype.onMouseDown = function ( e ) {
	var item;

	if ( !this.disabled && e.which === 1 ) {
		this.pressed = true;
		item = this.getTargetItem( e );
		if ( item && item.isSelectable() ) {
			this.selectItem( item, true );
			this.selecting = item;
			$( this.$$.context ).one( 'mouseup', ve.bind( this.onMouseUp, this ) );
		}
	}
	return false;
};

/**
 * Handle mouse up events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.SelectWidget.prototype.onMouseUp = function ( e ) {
	this.pressed = false;
	if ( !this.disabled && e.which === 1 && this.selecting ) {
		this.selectItem( this.selecting );
		this.selecting = null;
	}
	return false;
};

/**
 * Handle mouse up events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.SelectWidget.prototype.onMouseMove = function ( e ) {
	var item;

	if ( !this.disabled && this.pressed ) {
		item = this.getTargetItem( e );
		if ( item && item !== this.selecting && item.isSelectable() ) {
			this.selectItem( item, true );
			this.selecting = item;
		}
	}
	return false;
};

/**
 * Handle mouse over events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse over event
 */
ve.ui.SelectWidget.prototype.onMouseOver = function ( e ) {
	var item;

	if ( !this.disabled ) {
		item = this.getTargetItem( e );
		if ( item && item.isHighlightable() ) {
			this.highlightItem( item );
		}
	}
	return false;
};

/**
 * Get the closest item to a jQuery.Event.
 *
 * @method
 * @private
 * @param {jQuery.Event} e
 * @returns {ve.ui.OptionWidget|null} Outline item widget, `null` if none was found
 */
ve.ui.SelectWidget.prototype.getTargetItem = function ( e ) {
	var $item = $( e.target ).closest( '.ve-ui-optionWidget' );
	if ( $item.length ) {
		return $item.data( 've-ui-optionWidget' );
	}
	return null;
};

/**
 * Get selected item.
 *
 * @method
 * @returns {ve.ui.OptionWidget|null} Selected item, `null` if no item is selected
 */
ve.ui.SelectWidget.prototype.getSelectedItem = function () {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		if ( this.items[i].isSelected() ) {
			return this.items[i];
		}
	}
	return null;
};

/**
 * Get highlighted item.
 *
 * @method
 * @returns {ve.ui.OptionWidget|null} Highlighted item, `null` if no item is highlighted
 */
ve.ui.SelectWidget.prototype.getHighlightedItem = function () {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		if ( this.items[i].isHighlighted() ) {
			return this.items[i];
		}
	}
	return null;
};

/**
 * Get an existing item with equivilant data.
 *
 * @method
 * @param {Object} data Item data to search for
 * @returns {ve.ui.OptionWidget|null} Item with equivilent value, `null` if none exists
 */
ve.ui.SelectWidget.prototype.getItemFromData = function ( data ) {
	var hash = ve.getHash( data );

	if ( hash in this.hashes ) {
		return this.hashes[hash];
	}

	return null;
};

/**
 * Highlight an item.
 *
 * Highlighting is mutually exclusive.
 *
 * @method
 * @param {ve.ui.OptionWidget} [item] Item to highlight, omit to deselect all
 * @param {boolean} [silent=false] Update UI only, do not emit `highlight` event
 * @chainable
 */
ve.ui.SelectWidget.prototype.highlightItem = function ( item, silent ) {
	var i, len;

	item = this.getItemFromData( item && item.getData() );
	if ( item ) {
		item.setHighlighted( true );
	}
	for ( i = 0, len = this.items.length; i < len; i++ ) {
		if ( this.items[i] !== item ) {
			this.items[i].setHighlighted( false );
		}
	}
	if ( !silent ) {
		this.emit( 'highlight', item );
	}

	return this;
};

/**
 * Select an item.
 *
 * @method
 * @param {ve.ui.OptionWidget} [item] Item to select, omit to deselect all
 * @param {boolean} [silent=false] Update UI only, do not emit `select` event
 * @chainable
 */
ve.ui.SelectWidget.prototype.selectItem = function ( item, silent ) {
	var i, len;

	item = this.getItemFromData( item && item.getData() );
	if ( item ) {
		item.setSelected( true );
	}
	for ( i = 0, len = this.items.length; i < len; i++ ) {
		if ( this.items[i] !== item ) {
			this.items[i].setSelected( false );
		}
	}
	if ( !silent ) {
		this.emit( 'select', item );
	}

	return this;
};

/**
 * Get an item relative to another one.
 *
 * @method
 * @param {ve.ui.OptionWidget} item Item to start at
 * @param {number} direction Direction to move in
 * @returns {ve.ui.OptionWidget|null} Item at position, `null` if there are no items in the menu
 */
ve.ui.SelectWidget.prototype.getRelativeSelectableItem = function ( item, direction ) {
	var index = this.items.indexOf( item ),
		i = direction > 0 ?
			// Default to 0 instead of -1, if nothing is selected let's start at the beginning
			Math.max( 0, index + direction ) :
			// Default to n-1 instead of -1, if nothing is selected let's start at the end
			Math.min( index + direction, this.items.length - 1 ),
		len = this.items.length,
		inc = direction > 0 ? 1 : -1,
		stopAt = i;
	// Iterate to the next item in the sequence
	while ( i <= len ) {
		item = this.items[i];
		if ( item instanceof ve.ui.OptionWidget && item.isSelectable() ) {
			return item;
		}
		// Wrap around
		i = ( i + inc + len ) % len;
		if ( i === stopAt ) {
			// We've looped around, I guess we're all alone
			return item;
		}
	}
	return null;
};

/**
 * Selects the next item in the menu.
 *
 * @method
 * @param {number} index Item index
 * @returns {ve.ui.OptionWidget|null} Item, `null` if there's not an item at the `index`
 */
ve.ui.SelectWidget.prototype.getClosestSelectableItem = function ( index ) {
	var item,
		i = 0,
		len = this.items.length,
		at = 0;
	while ( i < len ) {
		item = this.items[i];
		if ( item instanceof ve.ui.OptionWidget && item.isSelectable() ) {
			if ( at === index ) {
				return item;
			}
			at++;
		}
		i++;
	}
	return null;
};

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {ve.ui.OptionWidget[]} items Items to add
 * @chainable
 */
ve.ui.SelectWidget.prototype.addItems = function ( items ) {
	var i, len, item, hash;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		hash = ve.getHash( item.getData() );
		if ( hash in this.hashes ) {
			// Use existing item with the same value
			items[i] = this.hashes[hash];
		} else {
			// Add new item
			this.hashes[hash] = item;
		}
	}
	ve.ui.GroupElement.prototype.addItems.call( this, items );

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {ve.ui.OptionWidget[]} items Items to remove
 * @chainable
 */
ve.ui.SelectWidget.prototype.removeItems = function ( items ) {
	var i, len, item, hash;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		hash = ve.getHash( item.getData() );
		if ( hash in this.hashes ) {
			// Remove existing item
			delete this.hashes[hash];
		}
	}
	ve.ui.GroupElement.prototype.removeItems.call( this, items );

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
ve.ui.SelectWidget.prototype.clearItems = function () {
	// Clear all items
	this.hashes = {};
	ve.ui.GroupElement.prototype.clearItems.call( this );

	return this;
};
