/*!
 * ObjectOriented UserInterface LookupInputWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Lookup input widget.
 *
 * Mixin that adds a menu showing suggested values to a text input. Subclasses must handle `select`
 * events on #lookupMenu to make use of selections.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {OO.ui.TextInputWidget} input Input widget
 * @param {Object} [config] Configuration options
 * @cfg {jQuery} [$overlay=this.$( 'body' )] Overlay layer
 */
OO.ui.LookupInputWidget = function OoUiLookupInputWidget( input, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.lookupInput = input;
	this.$overlay = config.$overlay || this.$( 'body' );
	this.lookupMenu = new OO.ui.TextInputMenuWidget( this, {
		'$': OO.ui.Element.getJQuery( this.$overlay ),
		'input': this.lookupInput,
		'$container': config.$container
	} );
	this.lookupCache = {};
	this.lookupQuery = null;
	this.lookupRequest = null;

	// Events
	this.$overlay.append( this.lookupMenu.$element );

	this.lookupInput.$input.on( {
		'focus': OO.ui.bind( this.onLookupInputFocus, this ),
		'blur': OO.ui.bind( this.onLookupInputBlur, this ),
		'mousedown': OO.ui.bind( this.onLookupInputMouseDown, this )
	} );
	this.lookupInput.connect( this, { 'change': 'onLookupInputChange' } );

	// Initialization
	this.$element.addClass( 'oo-ui-lookupWidget' );
	this.lookupMenu.$element.addClass( 'oo-ui-lookupWidget-menu' );
};

/* Methods */

/**
 * Handle input focus event.
 *
 * @method
 * @param {jQuery.Event} e Input focus event
 */
OO.ui.LookupInputWidget.prototype.onLookupInputFocus = function () {
	this.openLookupMenu();
};

/**
 * Handle input blur event.
 *
 * @method
 * @param {jQuery.Event} e Input blur event
 */
OO.ui.LookupInputWidget.prototype.onLookupInputBlur = function () {
	this.lookupMenu.hide();
};

/**
 * Handle input mouse down event.
 *
 * @method
 * @param {jQuery.Event} e Input mouse down event
 */
OO.ui.LookupInputWidget.prototype.onLookupInputMouseDown = function () {
	this.openLookupMenu();
};

/**
 * Handle input change event.
 *
 * @method
 * @param {string} value New input value
 */
OO.ui.LookupInputWidget.prototype.onLookupInputChange = function () {
	this.openLookupMenu();
};

/**
 * Open the menu.
 *
 * @method
 * @chainable
 */
OO.ui.LookupInputWidget.prototype.openLookupMenu = function () {
	var value = this.lookupInput.getValue();

	if ( this.lookupMenu.$input.is( ':focus' ) && $.trim( value ) !== '' ) {
		this.populateLookupMenu();
		if ( !this.lookupMenu.isVisible() ) {
			this.lookupMenu.show();
		}
	} else {
		this.lookupMenu.hide();
	}

	return this;
};

/**
 * Populate lookup menu with current information.
 *
 * @method
 * @chainable
 */
OO.ui.LookupInputWidget.prototype.populateLookupMenu = function () {
	var items = this.getLookupMenuItems();

	this.lookupMenu.clearItems();

	if ( items.length ) {
		this.lookupMenu.show();
		this.lookupMenu.addItems( items );
		this.initializeLookupMenuSelection();
	} else {
		this.lookupMenu.hide();
	}

	return this;
};

/**
 * Set selection in the lookup menu with current information.
 *
 * @method
 * @chainable
 */
OO.ui.LookupInputWidget.prototype.initializeLookupMenuSelection = function () {
	if ( !this.lookupMenu.getSelectedItem() ) {
		this.lookupMenu.intializeSelection( this.lookupMenu.getFirstSelectableItem() );
	}
	this.lookupMenu.highlightItem( this.lookupMenu.getSelectedItem() );
};

/**
 * Get lookup menu items for the current query.
 *
 * @method
 * @returns {OO.ui.MenuItemWidget[]} Menu items
 */
OO.ui.LookupInputWidget.prototype.getLookupMenuItems = function () {
	var value = this.lookupInput.getValue();

	if ( value && value !== this.lookupQuery ) {
		// Abort current request if query has changed
		if ( this.lookupRequest ) {
			this.lookupRequest.abort();
			this.lookupQuery = null;
			this.lookupRequest = null;
		}
		if ( value in this.lookupCache ) {
			return this.getLookupMenuItemsFromData( this.lookupCache[value] );
		} else {
			this.lookupQuery = value;
			this.lookupRequest = this.getLookupRequest()
				.always( OO.ui.bind( function () {
					this.lookupQuery = null;
					this.lookupRequest = null;
				}, this ) )
				.done( OO.ui.bind( function ( data ) {
					this.lookupCache[value] = this.getLookupCacheItemFromData( data );
					this.openLookupMenu();
				}, this ) );
			this.pushPending();
			this.lookupRequest.always( OO.ui.bind( function () {
				this.popPending();
			}, this ) );
		}
	}
	return [];
};

/**
 * Get a new request object of the current lookup query value.
 *
 * @method
 * @abstract
 * @returns {jqXHR} jQuery AJAX object, or promise object with an .abort() method
 */
OO.ui.LookupInputWidget.prototype.getLookupRequest = function () {
	// Stub, implemented in subclass
	return null;
};

/**
 * Handle successful lookup request.
 *
 * Overriding methods should call #populateLookupMenu when results are available and cache results
 * for future lookups in #lookupCache as an array of #OO.ui.MenuItemWidget objects.
 *
 * @method
 * @abstract
 * @param {Mixed} data Response from server
 */
OO.ui.LookupInputWidget.prototype.onLookupRequestDone = function () {
	// Stub, implemented in subclass
};

/**
 * Get a list of menu item widgets from the data stored by the lookup request's done handler.
 *
 * @method
 * @abstract
 * @param {Mixed} data Cached result data, usually an array
 * @returns {OO.ui.MenuItemWidget[]} Menu items
 */
OO.ui.LookupInputWidget.prototype.getLookupMenuItemsFromData = function () {
	// Stub, implemented in subclass
	return [];
};
