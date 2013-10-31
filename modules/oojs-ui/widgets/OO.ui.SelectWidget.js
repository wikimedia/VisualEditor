/*!
 * ObjectOriented UserInterface SelectWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Create an OO.ui.SelectWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixin OO.ui.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.SelectWidget = function OoUiSelectWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, this.$, config );

	// Properties
	this.pressed = false;
	this.selecting = null;
	this.hashes = {};

	// Events
	this.$.on( {
		'mousedown': OO.ui.bind( this.onMouseDown, this ),
		'mouseup': OO.ui.bind( this.onMouseUp, this ),
		'mousemove': OO.ui.bind( this.onMouseMove, this ),
		'mouseover': OO.ui.bind( this.onMouseOver, this ),
		'mouseleave': OO.ui.bind( this.onMouseLeave, this )
	} );

	// Initialization
	this.$.addClass( 'oo-ui-selectWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.SelectWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.SelectWidget, OO.ui.GroupElement );

/* Events */

/**
 * @event highlight
 * @param {OO.ui.OptionWidget|null} item Highlighted item or null if no item is highlighted
 */

/**
 * @event select
 * @param {OO.ui.OptionWidget|null} item Selected item or null if no item is selected
 */

/**
 * @event add
 * @param {OO.ui.OptionWidget[]} items Added items
 * @param {number} index Index items were added at
 */

/**
 * @event remove
 * @param {OO.ui.OptionWidget[]} items Removed items
 */

/* Static Properties */

OO.ui.SelectWidget.static.tagName = 'ul';

/* Methods */

/**
 * Handle mouse down events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.SelectWidget.prototype.onMouseDown = function ( e ) {
	var item;

	if ( !this.disabled && e.which === 1 ) {
		this.pressed = true;
		item = this.getTargetItem( e );
		if ( item && item.isSelectable() ) {
			this.intializeSelection( item );
			this.selecting = item;
			$( this.$$.context ).one( 'mouseup', OO.ui.bind( this.onMouseUp, this ) );
		}
	}
	return false;
};

/**
 * Handle mouse up events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.SelectWidget.prototype.onMouseUp = function ( e ) {
	var item;
	this.pressed = false;
	if ( !this.selecting ) {
		item = this.getTargetItem( e );
		if ( item && item.isSelectable() ) {
			this.selecting = item;
		}
	}
	if ( !this.disabled && e.which === 1 && this.selecting ) {
		this.selectItem( this.selecting );
		this.selecting = null;
	}
	return false;
};

/**
 * Handle mouse move events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse move event
 */
OO.ui.SelectWidget.prototype.onMouseMove = function ( e ) {
	var item;

	if ( !this.disabled && this.pressed ) {
		item = this.getTargetItem( e );
		if ( item && item !== this.selecting && item.isSelectable() ) {
			this.intializeSelection( item );
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
OO.ui.SelectWidget.prototype.onMouseOver = function ( e ) {
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
 * Handle mouse leave events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse over event
 */
OO.ui.SelectWidget.prototype.onMouseLeave = function () {
	if ( !this.disabled ) {
		this.highlightItem();
	}
	return false;
};

/**
 * Get the closest item to a jQuery.Event.
 *
 * @method
 * @private
 * @param {jQuery.Event} e
 * @returns {OO.ui.OptionWidget|null} Outline item widget, `null` if none was found
 */
OO.ui.SelectWidget.prototype.getTargetItem = function ( e ) {
	var $item = $( e.target ).closest( '.oo-ui-optionWidget' );
	if ( $item.length ) {
		return $item.data( 'oo-ui-optionWidget' );
	}
	return null;
};

/**
 * Get selected item.
 *
 * @method
 * @returns {OO.ui.OptionWidget|null} Selected item, `null` if no item is selected
 */
OO.ui.SelectWidget.prototype.getSelectedItem = function () {
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
 * @returns {OO.ui.OptionWidget|null} Highlighted item, `null` if no item is highlighted
 */
OO.ui.SelectWidget.prototype.getHighlightedItem = function () {
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
 * @returns {OO.ui.OptionWidget|null} Item with equivilent value, `null` if none exists
 */
OO.ui.SelectWidget.prototype.getItemFromData = function ( data ) {
	var hash = OO.getHash( data );

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
 * @param {OO.ui.OptionWidget} [item] Item to highlight, omit to deselect all
 * @fires highlight
 * @chainable
 */
OO.ui.SelectWidget.prototype.highlightItem = function ( item ) {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		this.items[i].setHighlighted( this.items[i] === item );
	}
	this.emit( 'highlight', item );

	return this;
};

/**
 * Select an item.
 *
 * @method
 * @param {OO.ui.OptionWidget} [item] Item to select, omit to deselect all
 * @fires select
 * @chainable
 */
OO.ui.SelectWidget.prototype.selectItem = function ( item ) {
	var i, len;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		this.items[i].setSelected( this.items[i] === item );
	}
	this.emit( 'select', item );

	return this;
};

/**
 * Setup selection and highlighting.
 *
 * This should be used to synchronize the UI with the model without emitting events that would in
 * turn update the model.
 *
 * @param {OO.ui.OptionWidget} [item] Item to select
 * @chainable
 */
OO.ui.SelectWidget.prototype.intializeSelection = function( item ) {
	var i, len, selected;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		selected = this.items[i] === item;
		this.items[i].setSelected( selected );
		this.items[i].setHighlighted( selected );
	}

	return this;
};

/**
 * Get an item relative to another one.
 *
 * @method
 * @param {OO.ui.OptionWidget} item Item to start at
 * @param {number} direction Direction to move in
 * @returns {OO.ui.OptionWidget|null} Item at position, `null` if there are no items in the menu
 */
OO.ui.SelectWidget.prototype.getRelativeSelectableItem = function ( item, direction ) {
	var inc = direction > 0 ? 1 : -1,
		len = this.items.length,
		index = item instanceof OO.ui.OptionWidget ?
			this.items.indexOf( item ) : ( inc > 0 ? -1 : 0 ),
		stopAt = Math.max( Math.min( index, len - 1 ), 0 ),
		i = inc > 0 ?
			// Default to 0 instead of -1, if nothing is selected let's start at the beginning
			Math.max( index, -1 ) :
			// Default to n-1 instead of -1, if nothing is selected let's start at the end
			Math.min( index, len );

	while ( true ) {
		i = ( i + inc + len ) % len;
		item = this.items[i];
		if ( item instanceof OO.ui.OptionWidget && item.isSelectable() ) {
			return item;
		}
		// Stop iterating when we've looped all the way around
		if ( i === stopAt ) {
			break;
		}
	}
	return null;
};

/**
 * Get the next selectable item.
 *
 * @method
 * @returns {OO.ui.OptionWidget|null} Item, `null` if ther aren't any selectable items
 */
OO.ui.SelectWidget.prototype.getFirstSelectableItem = function () {
	var i, len, item;

	for ( i = 0, len = this.items.length; i < len; i++ ) {
		item = this.items[i];
		if ( item instanceof OO.ui.OptionWidget && item.isSelectable() ) {
			return item;
		}
	}

	return null;
};

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {OO.ui.OptionWidget[]} items Items to add
 * @param {number} [index] Index to insert items after
 * @fires add
 * @chainable
 */
OO.ui.SelectWidget.prototype.addItems = function ( items, index ) {
	var i, len, item, hash;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		hash = OO.getHash( item.getData() );
		if ( hash in this.hashes ) {
			// Use existing item with the same value
			items[i] = this.hashes[hash];
		} else {
			// Add new item
			this.hashes[hash] = item;
		}
	}
	OO.ui.GroupElement.prototype.addItems.call( this, items, index );

	// Always provide an index, even if it was omitted
	this.emit( 'add', items, index === undefined ? this.items.length - items.length - 1 : index );

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {OO.ui.OptionWidget[]} items Items to remove
 * @fires remove
 * @chainable
 */
OO.ui.SelectWidget.prototype.removeItems = function ( items ) {
	var i, len, item, hash;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		hash = OO.getHash( item.getData() );
		if ( hash in this.hashes ) {
			// Remove existing item
			delete this.hashes[hash];
		}
		if ( item.isSelected() ) {
			this.selectItem( null );
		}
	}
	OO.ui.GroupElement.prototype.removeItems.call( this, items );

	this.emit( 'remove', items );

	return this;
};

/**
 * Clear all items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @fires remove
 * @chainable
 */
OO.ui.SelectWidget.prototype.clearItems = function () {
	var items = this.items.slice();

	// Clear all items
	this.hashes = {};
	OO.ui.GroupElement.prototype.clearItems.call( this );
	this.selectItem( null );

	this.emit( 'remove', items );

	return this;
};
