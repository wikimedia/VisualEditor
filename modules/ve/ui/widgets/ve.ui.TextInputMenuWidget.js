/*!
 * VisualEditor user interface TextInputMenuWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.TextInputMenuWidget object.
 *
 * @class
 * @constructor
 * @extends ve.ui.Widget
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {jQuery} $container Container to render menu into
 */
ve.ui.TextInputMenuWidget = function VeUiTextInputMenuWidget( $$, $container ) {
	// Parent constructor
	ve.ui.Widget.call( this, $$ );

	// Properties
	this.$container = $container;
	this.groups = {};
	this.items = {};
	this.sequence = [];
	this.$groups = this.$$( '<ul>' ).addClass( 've-ui-textInputMenuWidget-groups' );
	this.visible = false;
	this.selectedItem = null;
	this.newItems = [];

	// Events
	this.$.on( {
		'mousedown': ve.bind( this.onMouseDown, this ),
		'mouseup': ve.bind( this.onMouseUp, this )
	} );

	// Initialization
	this.$
		.hide()
		.addClass( 've-ui-textInputMenuWidget' )
		.append( this.$groups );
	this.$container.append( this.$ );
};

/* Inheritance */

ve.inheritClass( ve.ui.TextInputMenuWidget, ve.ui.Widget );

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.onMouseDown = function ( e ) {
	if ( !this.disabled ) {
		this.$groups.find( '.ve-ui-textInputMenuWidget-item-selected' )
			.removeClass( 've-ui-textInputMenuWidget-item-selected' );
		$( e.target ).closest( '.ve-ui-textInputMenuWidget-item' )
			.addClass( 've-ui-textInputMenuWidget-item-selected' );
	}
	e.preventDefault();
	return false;
};

/**
 * Handles mouse up events.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.onMouseUp = function ( e ) {
	var $item = $( e.target ).closest( '.ve-ui-textInputMenuWidget-item' );

	if ( !this.disabled && $item.length ) {
		this.hide();
		this.emit( 'select', $item.data( 'item' ).data );
	}
	e.preventDefault();
	return false;
};

/**
 * Checks if the menu is visible.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Shows the menu.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.show = function () {
	var i, len;

	if ( !this.sequence.length ) {
		return;
	}

	this.$.show();
	this.visible = true;
	if ( this.newItems.length ) {
		for ( i = 0, len = this.newItems.length; i < len; i++ ) {
			this.newItems[i].$.autoEllipsis( { 'hasSpan': true, 'tooltip': true } );
		}
		this.newItems = [];
	}
};

/**
 * Hides the menu.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.hide = function () {
	this.$.hide();
	this.visible = false;
};

/**
 * Places the menu underneeth a given element.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.setPosition = function ( $element ) {
	this.$.css( {
		'left': $element.offset().left,
		'top': $element.offset().top + $element.outerHeight( true )
	} );
};

/**
 * Gets the currently selected item.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.getSelectedItem = function () {
	return this.selectedItem;
};

/**
 * Adds a group.
 *
 * @method
 * @param {string} name Name of group
 * @param {string} label Group label
 * @throws {Error} Name must be unique for each group
 */
ve.ui.TextInputMenuWidget.prototype.addGroup = function ( name, label ) {
	if ( name in this.groups ) {
		throw new Error( 'Name must be unique for each group' );
	}
	var group = {
			'name': name,
			'items': [],
			'$': this.$$( '<li>' ),
			'$label': this.$$( '<span>' ),
			'$items': this.$$( '<ul>' )
		};
	group.$label.text( label ).addClass( 've-ui-textInputMenuWidget-group-label' );
	group.$items.addClass( 've-ui-textInputMenuWidget-items' );
	group.$
		.hide()
		.attr( 'rel', name )
		.addClass( 've-ui-textInputMenuWidget-group' )
		.append( group.$label )
		.append( group.$items );
	this.$groups.append( group.$ );
	this.groups[name] = group;
	// Group names and item objects are collected in a sequence for consistent ordering
	this.sequence.push( name );
};

/**
 * Adds an item.
 *
 * @method
 * @param {string} groupName Name of group
 * @param {string} label Item label
 * @param {Object} data Item data
 * @throws {Error} Group does not exist
 * @throws {Error} Data must be unique for each item
 */
ve.ui.TextInputMenuWidget.prototype.addItem = function ( groupName, label, data ) {
	if ( !( groupName in this.groups ) ) {
		throw new Error( 'Group does not exist:' + groupName );
	}
	var group = this.groups[groupName],
		hash = ve.getHash( data ),
		item = {
			'group': group,
			'label': label,
			'data': data,
			'$': this.$$( '<li>' ),
			'$label': this.$$( '<span>' )
		};
	if ( hash in this.items ) {
		throw new Error( 'Data must be unique for each item' );
	}
	item.$label.text( label ).addClass( 've-ui-textInputMenuWidget-item-label' );
	item.$
		.data( 'item', item )
		.addClass( 've-ui-textInputMenuWidget-item' )
		.append( item.$label );
	group.$.show();
	group.$items.append( item.$ );
	group.items.push( item );
	this.items[hash] = item;
	// Items are inserted before their group name, for quick splicing
	this.sequence.splice( this.sequence.indexOf( groupName ), 0, item );
	if ( this.visible ) {
		item.$.autoEllipsis( { 'hasSpan': true, 'tooltip': true } );
	} else {
		this.newItems.push( item );
	}
};

/**
 * Removes all items.
 *
 * @method
 */
ve.ui.TextInputMenuWidget.prototype.clearItems = function () {
	this.groups = {};
	this.items = {};
	this.sequence = [];
	this.selectedItem = null;
	this.$groups.empty();
};

/**
 * Gets an item from its data.
 *
 * This performs a hash comparison, not an identity comparison.
 *
 * @method
 * @param {Object} data Item data
 */
ve.ui.TextInputMenuWidget.prototype.getItemFromData = function ( data ) {
	var hash = ve.getHash( data );
	if ( hash in this.items ) {
		return this.items[hash];
	}
};

/**
 * Selects an item.
 *
 * @method
 * @param {Object} data Item data
 * @returns {boolean} Item was selected
 */
ve.ui.TextInputMenuWidget.prototype.selectItemByData = function ( data ) {
	var hash = ve.getHash( data ),
		item = this.items[hash];
	if ( item && item !== this.selectedItem ) {
		this.selectedItem = item;
		this.$groups.find( '.ve-ui-textInputMenuWidget-item-selected' )
			.removeClass( 've-ui-textInputMenuWidget-item-selected' );
		item.$.addClass( 've-ui-textInputMenuWidget-item-selected' );
		this.emit( 'select', item.data );
		return true;
	}
	return false;
};

/**
 * Selects the next item in the menu.
 *
 * @method
 * @param {number} direction Direction to move selection in
 * @returns {boolean} A different item was selected
 */
ve.ui.TextInputMenuWidget.prototype.selectRelativeItem = function ( direction ) {
	var item,
		i = direction > 0 ?
			// Default to 0 instead of -1, if nothing is selected let's start at the beginning
			Math.max( 0, this.sequence.indexOf( this.selectedItem ) + direction ) :
			// Default to n-1 instead of -1, if nothing is selected let's start at the end
			Math.min( this.sequence.indexOf( this.selectedItem ) + direction, this.sequence.length - 1 ),
		len = this.sequence.length,
		inc = direction > 0 ? 1 : -1,
		stopAt = i;
	// Iterate to the next item in the sequence
	while ( i < len ) {
		item = this.sequence[i];
		if ( ve.isPlainObject( item ) ) {
			return this.selectItemByData( item.data );
		}
		// Wrap around
		i = ( i + inc + len ) % len;
		if ( i === stopAt ) {
			// We've looped around, I guess we're all alone
			return this.selectItemByData( item.data );
		}
	}
	return false;
};

/**
 * Selects the next item in the menu.
 *
 * @method
 * @param {number} index Item index
 * @returns {boolean} A different item was selected
 */
ve.ui.TextInputMenuWidget.prototype.selectItemByIndex = function ( index ) {
	var item, itemAtIndex,
		i = 0,
		len = this.sequence.length,
		at = 0;
	while ( i < len ) {
		item = this.sequence[i];
		if ( ve.isPlainObject( item ) ) {
			itemAtIndex = item;
			if ( at === index ) {
				break;
			}
			at++;
		}
		i++;
	}
	if ( itemAtIndex ) {
		return this.selectItemByData( itemAtIndex.data );
	}
	return false;
};
