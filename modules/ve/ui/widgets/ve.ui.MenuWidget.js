/*!
 * VisualEditor user interface MenuWidget class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.MenuWidget object.
 *
 * @class
 * @constructor
 * @param {Object[]} items List of items to append initially
 * @param {Function} callback Function to call if an item doesn't have its own callback
 * @param {jQuery} [$container] Container to render menu into
 * @param {jQuery} [$overlay=$( 'body' )] Element to append menu to
 */
ve.ui.MenuWidget = function VeUiMenuWidget( items, callback, $container, $overlay ) {
	// Properties
	this.items = [];
	this.autoNamedBreaks = 0;
	this.callback = callback;
	this.$ = $container || $( '<div class="ve-ui-menuWidget"></div>' );

	// Events
	this.$.on( {
		'mousedown': ve.bind( this.onMouseDown, this ),
		'mouseup': ve.bind( this.onMouseUp, this )
	} );

	// Initialization
	this.$.appendTo( $overlay || $( 'body' ) );
	this.addItems( items );
};

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.MenuWidget.prototype.onMouseDown = function ( e ) {
	if ( e.which === 1 ) {
		e.preventDefault();
		return false;
	}
};

/**
 * Handles mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.MenuWidget.prototype.onMouseUp = function ( e ) {
	var name, i, len, $item, item;
	if ( e.which === 1 ) {
		$item = $( e.target ).closest( '.ve-ui-menuWidget-item' );
		if ( $item.length ) {
			name = $item.attr( 'rel' );
			for ( i = 0, len = this.items.length; i < len; i++ ) {
				item = this.items[i];
				if ( item.name === name ) {
					if ( typeof item.callback === 'function' ) {
						item.callback( item );
					} else if ( typeof this.callback === 'function' ) {
						this.callback( item );
					}
					this.close();
					return true;
				}
			}
		}
	}
};

/**
 * Adds items to the menu.
 *
 * @method
 * @param {Object[]} items List of item objects
 * @param {Object} before Menu item to add items before
 */
ve.ui.MenuWidget.prototype.addItems = function ( items, before ) {
	var i, len;
	if ( !ve.isArray( items ) ) {
		throw new Error( 'Invalid items, must be array of objects.' );
	}
	for ( i = 0, len = items.length; i < len; i++ ) {
		this.addItem( items[i], before );
	}
};

/**
 * Adds item to the menu.
 *
 * @method
 * @param {Object} item Item object
 * @param {string} item.name Symbolic name of item
 * @param {string} item.label Item label
 * @param {Object} before Menu item to add item before
 */
ve.ui.MenuWidget.prototype.addItem = function ( item, before ) {
	if ( item === '-' ) {
		item = {
			'name': 'break-' + this.autoNamedBreaks++
		};
	}
	// Items that don't have custom DOM elements will be auto-created
	if ( !item.$ ) {
		if ( !item.name ) {
			throw new Error( 'Invalid menu item error. Items must have a name property.' );
		}
		if ( item.label ) {
			item.$ = $( '<div class="ve-ui-menuWidget-item"></div>' )
				.attr( 'rel', item.name )
				// TODO: this should take a labelmsg instead and call ve.msg()
				.append( $( '<span>' ).text( item.label ) );
		} else {
			// No label, must be a break
			item.$ = $( '<div class="ve-ui-menuWidget-break"></div>' )
				.attr( 'rel', item.name );
		}
		// TODO: Keyboard shortcut (and icons for them), support for keyboard accelerators, etc.
	}
	if ( before ) {
		for ( var i = 0; i < this.items.length; i++ ) {
			if ( this.items[i].name === before ) {
				this.items.splice( i, 0, item );
				this.items[i].$.before( item.$ );
				return;
			}
		}
	}
	this.items.push( item );
	this.$.append( item.$ );
};

/**
 * Removes item from the menu.
 *
 * @method
 * @param {string} name Symbolic name of item
 */
ve.ui.MenuWidget.prototype.removeItem = function ( name ) {
	for ( var i = 0; i < this.items.length; i++ ) {
		if ( this.items[i].name === name ) {
			this.items.splice( i, 1 );
			i--;
		}
	}
};

/**
 * Gets a list of all menu items.
 *
 * @method
 * @returns {Object[]} Menu item objects
 */
ve.ui.MenuWidget.prototype.getItems = function () {
	return this.items;
};

/**
 * Sets the position of the menu.
 *
 * @method
 * @returns {ve.Position} New menu position
 */
ve.ui.MenuWidget.prototype.setPosition = function ( position ) {
	return this.$.css( {
		'top': position.top,
		'left': position.left
	} );
};

/**
 * Opens the menu.
 *
 * @method
 */
ve.ui.MenuWidget.prototype.open = function () {
	this.$.show();
};

/**
 * Closes the menu.
 *
 * @method
 */
ve.ui.MenuWidget.prototype.close = function () {
	this.$.hide();
};

/**
 * Checks if the menu is currently open.
 *
 * @method
 * @returns {boolean} Menu is open
 */
ve.ui.MenuWidget.prototype.isOpen = function () {
	return this.$.is( ':visible' );
};
