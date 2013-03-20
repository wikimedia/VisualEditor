/*!
 * VisualEditor UserInterface MenuWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Create an ve.ui.MenuWidget object.
 *
 * @class
 * @extends ve.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {jQuery} [$overlay=this.$$( 'body' )] Element to append menu to
 * @cfg {jQuery} [$input=this.$$( '<input>' )] Input to bind keyboard handlers to
 */
ve.ui.MenuWidget = function VeUiMenuWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.isolated = !config.$input;
	this.$input = config.$input || this.$$( '<input>' );
	this.$overlay = config.$overlay || this.$$( 'body' );
	this.groups = {};
	this.items = {};
	this.sequence = [];
	this.$groups = this.$$( '<ul>' ).addClass( 've-ui-menuWidget-groups' );
	this.visible = false;
	this.newItems = [];
	this.$previousFocus = null;
	this.persist = false;

	// Events
	this.$.on( {
		'mouseup': ve.bind( this.onMouseUp, this ),
		'mousedown': ve.bind( this.onMouseDown, this )
	} );
	this.$input.on( 'keydown', ve.bind( this.onKeyDown, this ) );

	// Initialization
	this.$.hide().addClass( 've-ui-menuWidget' ).append( this.$groups );
	this.$overlay.append( this.$ );
	if ( !config.$input ) {
		this.$.append( this.$input );
	}
};

/* Inheritance */

ve.inheritClass( ve.ui.MenuWidget, ve.ui.Widget );

/* Events */

/**
 * @event select
 * @param {ve.ui.MenuItemWidget} item Selected item
 */

/* Methods */

/**
 * Handle mouse up events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse up event
 */
ve.ui.MenuWidget.prototype.onMouseUp = function () {
	return false;
};

/**
 * Handle mouse down events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.MenuWidget.prototype.onMouseDown = function () {
	return false;
};

/**
 * Handle item select events.
 *
 * @method
 * @private
 * @param {ve.ui.MenuItemWidget} item Selected item
 * @emits select
 */
ve.ui.MenuWidget.prototype.onItemSelect = function ( item ) {
	var hash;

	// Make selection mutually exclusive
	for ( hash in this.items ) {
		if ( this.items[hash] !== item ) {
			this.items[hash].setSelected( false );
		}
	}

	if ( !this.persist && !this.disabled ) {
		this.emit( 'select', item );
		this.disabled = true;
		item.flash( ve.bind( function () {
			this.hide();
			this.disabled = false;
		}, this ) );
	}
};

/**
 * Handle item highlight events.
 *
 * @method
 * @private
 * @param {ve.ui.MenuItemWidget} item Selected item
 */
ve.ui.MenuWidget.prototype.onItemHighlight = function ( item ) {
	var hash;

	// Make selection mutually exclusive
	for ( hash in this.items ) {
		if ( this.items[hash] !== item ) {
			this.items[hash].setHighlighted( false );
		}
	}
};

/**
 * Handles key down events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
ve.ui.MenuWidget.prototype.onKeyDown = function ( e ) {
	var handled = false,
		highlightItem = this.getHighlightedItem();

	if ( !this.disabled && this.visible ) {
		switch ( e.keyCode ) {
			// Enter
			case 13:
				this.selectItem( highlightItem );
				handled = true;
				break;
			// Up arrow
			case 38:
				this.highlightItem( this.getRelativeItem( -1 ) );
				handled = true;
				break;
			// Down arrow
			case 40:
				this.highlightItem( this.getRelativeItem( 1 ) );
				handled = true;
				break;
			// Escape
			case 27:
				if ( highlightItem ) {
					highlightItem.setHighlighted( false );
				}
				this.hide();
				handled = true;
				break;
		}
		if ( handled ) {
			e.preventDefault();
		}
	}
};

/**
 * Check if the menu is visible.
 *
 * @method
 * @returns {boolean} Menu is visible
 */
ve.ui.MenuWidget.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Get group names.
 *
 * @method
 * @returns {string[]} Symbolic names of groups
 */
ve.ui.MenuWidget.prototype.getGroups = function () {
	return ve.getObjectKeys( this.groups );
};

/**
 * Get items.
 *
 * @method
 * @returns {ve.ui.MenuItemWidget[]} Items
 */
ve.ui.MenuWidget.prototype.getItems = function () {
	return ve.getObjectValues( this.items );
};

/**
 * Get highlighted item.
 *
 * @method
 * @returns {ve.ui.MenuItemWidget|null} Highlighted item
 */
ve.ui.MenuWidget.prototype.getHighlightedItem = function () {
	var hash;

	for ( hash in this.items ) {
		if ( this.items[hash].isHighlighted() ) {
			return this.items[hash];
		}
	}
	return null;
};

/**
 * Get selected item.
 *
 * @method
 * @returns {ve.ui.MenuItemWidget|null} Selected item
 */
ve.ui.MenuWidget.prototype.getSelectedItem = function () {
	var hash;

	for ( hash in this.items ) {
		if ( this.items[hash].isSelected() ) {
			return this.items[hash];
		}
	}
	return null;
};

/**
 * Get an item from its data.
 *
 * This performs a hash comparison, not an identity comparison.
 *
 * @method
 * @returns {ve.ui.MenuItemWidget|null} Item, or null if no match was found
 */
ve.ui.MenuWidget.prototype.getItemFromData = function ( data ) {
	var hash = ve.getHash( data );

	if ( hash in this.items ) {
		return this.items[hash];
	}
	return null;
};

/**
 * Get an item relative to the highlighted one.
 *
 * @method
 * @param {number} direction Direction to move selection in
 * @returns {ve.ui.MenuItemWidget|null} Item, or null if there are no items in the menu
 */
ve.ui.MenuWidget.prototype.getRelativeItem = function ( direction ) {
	var item,
		highlightedItem = this.getHighlightedItem(),
		highlightedItemIndex = this.sequence.indexOf( highlightedItem ),
		i = direction > 0 ?
			// Default to 0 instead of -1, if nothing is selected let's start at the beginning
			Math.max( 0, highlightedItemIndex + direction ) :
			// Default to n-1 instead of -1, if nothing is selected let's start at the end
			Math.min( highlightedItemIndex + direction, this.sequence.length - 1 ),
		len = this.sequence.length,
		inc = direction > 0 ? 1 : -1,
		stopAt = i;
	// Iterate to the next item in the sequence
	while ( i < len ) {
		item = this.sequence[i];
		if ( item instanceof ve.ui.MenuItemWidget ) {
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
 * @returns {ve.ui.MenuItemWidget|null} Item, or null if there's not an item at the `index`
 */
ve.ui.MenuWidget.prototype.getItemFromIndex = function ( index ) {
	var item,
		i = 0,
		len = this.sequence.length,
		at = 0;
	while ( i < len ) {
		item = this.sequence[i];
		if ( item instanceof ve.ui.MenuItemWidget ) {
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
 * Highlight an item.
 *
 * Highlighting is mutually exclusive.
 *
 * @method
 * @param {ve.ui.MenuItemWidget} [item] Item to highlight, omit to deselect all
 * @chainable
 */
ve.ui.MenuWidget.prototype.highlightItem = function ( item ) {
	// Get item by value
	item = this.getItemFromData( item && item.getData() );

	// Update items
	if ( item ) {
		item.setHighlighted( true );
	}

	return this;
};

/**
 * Select an item.
 *
 * @method
 * @param {ve.ui.MenuItemWidget} [item] Item to select, omit to deselect all
 * @chainable
 */
ve.ui.MenuWidget.prototype.selectItem = function ( item, persist ) {
	var hash;

	// Get item by value
	item = this.getItemFromData( item && item.getData() );

	this.persist = !!persist;
	if ( item ) {
		item.setSelected( true );
	} else {
		// Deselect all
		for ( hash in this.items ) {
			this.items[hash].setSelected( false );
		}
	}
	this.persist = false;

	return this;
};

/**
 * Set which item is selected.
 *
 * This is different than selecting an item, because it doesn't send out select events. This is only
 * to be used when updating the UI to reflect an already existing state, usually before showing it.
 *
 * @method
 * @param {ve.ui.MenuItemWidget} [item] Item to select, omit to deselect all
 * @chainable
 */
ve.ui.MenuWidget.prototype.setSelectedItem = function ( item ) {
	var hash;

	// Get item by value
	item = this.getItemFromData( item && item.getData() );

	if ( item ) {
		item.setSelected( true, true );
	} else {
		// Deselect all
		for ( hash in this.items ) {
			this.items[hash].setSelected( false, true );
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
ve.ui.MenuWidget.prototype.show = function () {
	var i, len, item;

	if ( this.sequence.length ) {
		this.$.show();
		this.visible = true;
		// Change focus to enable keyboard navigation
		if ( this.isolated && !this.$input.is( ':focus' ) ) {
			this.$previousFocus = this.$$( ':focus' );
			this.$input.focus();
		}
		// When using jQuery.autoEllipsis, new items may have been deferred until visible
		// TODO: Eliminate dependency on autoEllipsis and add this functionality to
		// ve.ui.LabeledWidget, making it compatible with HTML contents, not just plain strings
		if ( this.newItems.length ) {
			for ( i = 0, len = this.newItems.length; i < len; i++ ) {
				item = this.newItems[i];
				if ( item.$.autoEllipsis ) {
					item.$.autoEllipsis( { 'hasSpan': true, 'tooltip': true } );
				}
			}
			this.newItems = [];
		}
	}
	return this;
};

/**
 * Hide the menu.
 *
 * @method
 * @chainable
 */
ve.ui.MenuWidget.prototype.hide = function () {
	this.$.hide();
	this.visible = false;
	if ( this.isolated && this.$previousFocus ) {
		this.$previousFocus.focus();
		this.$previousFocus = null;
	}
	return this;
};

/**
 * Add groups.
 *
 * @method
 * @param {Object.<string, string>} groups List of group labels, keyed by symbolic name
 * @chainable
 * @throws {Error} If a group being added already exists
 */
ve.ui.MenuWidget.prototype.addGroups = function ( groups ) {
	var i, len, name, label, group, names;

	if ( ve.isArray( groups ) ) {
		names = {};
		for ( i = 0, len = groups.length; i < len; i++ ) {
			names[groups[i]] = '';
		}
		groups = names;
	}
	for ( name in groups ) {
		if ( name in this.groups ) {
			throw new Error( 'Name must be unique for each group' );
		}
		label = groups[name];
		group = {
			'name': name,
			'items': [],
			'$': this.$$( '<li>' ),
			'$items': this.$$( '<ul>' )
		};
		if ( label ) {
			group.$label = this.$$( '<span>' )
				.text( label )
				.addClass( 've-ui-menuWidget-group-label' );
			group.$.append( group.$label );
		}
		group.$items.addClass( 've-ui-menuWidget-items' );
		group.$
			.hide()
			.attr( 'rel', name )
			.addClass( 've-ui-menuWidget-group' )
			.append( group.$items );
		this.$groups.append( group.$ );
		this.groups[name] = group;
		// Group names and item objects are collected in a sequence for consistent ordering
		this.sequence.push( name );
	}

	return this;
};

/**
 * Add items.
 *
 * Adding an existing item (by value) will move it.
 *
 * @method
 * @param {ve.ui.MenuItemWidget[]} items Item
 * @chainable
 */
ve.ui.MenuWidget.prototype.addItems = function ( items ) {
	var i, len, hash, item, group, groupName;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];
		hash = ve.getHash( item.getData() );
		groupName = item.getGroup();

		// Automatically add an unlabled group if group is missing
		if ( !( groupName in this.groups ) ) {
			this.addGroups( [groupName] );
		}
		// Check if item exists then remove it first, effectively "moving" it
		if ( hash in this.items ) {
			this.removeItems( [this.items[hash]] );
		}
		// Add the item
		group = this.groups[groupName];
		group.$.show();
		group.$items.append( item.$ );
		group.items.push( item );
		this.items[hash] = item;
		item.on( 'select', ve.bind( this.onItemSelect, this, item ) );
		item.on( 'highlight', ve.bind( this.onItemHighlight, this, item ) );
		// Items are inserted before their group name, for quick splicing
		this.sequence.splice( this.sequence.indexOf( groupName ), 0, item );
		// To use jQuery.autoEllipsis, items must be visible - keep a list of items to process later
		// TODO: See #show, this functionality should be moved into ve.ui.LabeledWidget
		if ( item.$.autoEllipsis ) {
			if ( this.visible ) {
				item.$.autoEllipsis( { 'hasSpan': true, 'tooltip': true } );
			} else {
				this.newItems.push( item );
			}
		}
	}

	return this;
};

/**
 * Remove items.
 *
 * Items will be detached, not removed, so they can be used later.
 *
 * @method
 * @param {ve.ui.MenuItemWidget[]} items Items to remove
 * @chainable
 */
ve.ui.MenuWidget.prototype.removeItems = function ( items ) {
	var i, len, hash, item, group;

	// Remove specific items
	for ( i = 0, len = items.length; i < len; i++ ) {
		hash = ve.getHash( items[i] );
		item = this.items[hash];
		if ( item ) {
			delete this.items[hash];
			this.sequence.splice( this.sequence.indexOf( item ), 1 );
			item.$.detach();
			item.removeAllListeners( 'select' );
			group = this.groups[item.getGroup()];
			if ( group ) {
				group.items.splice( group.items.indexOf( item ), 1 );
				if ( !group.items.length ) {
					group.$.hide();
				}
			}
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
ve.ui.MenuWidget.prototype.clearItems = function () {
	var i, len, name;

	// Remove all items, leaving empty groups
	this.items = {};
	this.$groups.children().hide().children().detach();
	for ( name in this.groups ) {
		this.groups[name].items = [];
	}
	for ( i = 0, len = this.sequence.length; i < len; i++ ) {
		if ( this.sequence[i] instanceof ve.ui.MenuItemWidget ) {
			this.sequence.splice( i, 0 );
		}
	}

	return this;
};

/**
 * Remove groups.
 *
 * Items within groups will also be removed.
 *
 * @method
 * @param {string[]} groups Names of groups to remove
 * @chainable
 */
ve.ui.MenuWidget.prototype.removeGroups = function ( groups ) {
	var i, len, group;

	for ( i = 0, len = groups.length; i < len; i++ ) {
		group = this.groups[groups[i]];
		if ( group ) {
			delete this.groups[groups[i]];
			this.sequence.splice( this.sequence.indexOf( group ), 1 );
			this.removeItems( group.items );
			group.$.remove();
		}
	}

	return this;
};

/**
 * Remove groups.
 *
 * Items within groups will also be removed.
 *
 * @method
 * @chainable
 */
ve.ui.MenuWidget.prototype.clearGroups = function () {
	// Remove all items
	this.clearItems();

	// Remove all groups
	this.groups = {};
	this.sequence = [];
	this.$groups
		.children()
			// Detach the items in each group (they may be re-used)
			.children()
				.detach()
				.end()
			// Remove the group elements
			.remove();

	return this;
};
