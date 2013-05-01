/*!
 * VisualEditor UserInterface MWCategoryWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.MWCategoryWidget object.
 *
 * @class
 * @abstract
 * @extends ve.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.MWCategoryWidget = function VeUiMWCategoryWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.categories = {};
	this.$categories = this.$$( '<div>' );
	this.popupState = false;
	this.savedPopupState = false;
	this.popup = new ve.ui.MWCategoryPopupWidget( {
		'$$': this.$$, 'align': 'right', '$overlay': config.$overlay
	} );
	this.categoryInput = new ve.ui.MWCategoryInputWidget( this, {
		'$$': this.$$, '$overlay': config.$overlay, '$container': this.$
	} );

	// Events
	this.categoryInput.$input.on( 'keydown', ve.bind( this.onLookupInputKeyDown, this ) );
	this.categoryInput.lookupMenu.connect( this, { 'select': 'onLookupMenuItemSelect' } );
	this.popup.connect( this, {
		'removeCategory': 'onRemoveCategory',
		'updateSortkey': 'onUpdateSortkey',
		'hide': 'onPopupHide'
	} );

	// Initialization
	this.$.addClass( 've-ui-mwCategoryListWidget' )
		.append(
			this.$categories,
			this.categoryInput.$,
			this.$$( '<div>' ).css( 'clear', 'both' )
		);
};

/* Inheritance */

ve.inheritClass( ve.ui.MWCategoryWidget, ve.ui.Widget );

/* Events */

/**
 * @event newCategory
 * @param {Object} item category group item
 */

/**
 * @event updateSortkey
 * * @param {Object} item category group item
 */

/* Methods */

/**
 * Handle input key down event.
 *
 * @method
 * @param {jQuery.Event} e Input key down event
 */
ve.ui.MWCategoryWidget.prototype.onLookupInputKeyDown = function ( e ) {
	if ( this.categoryInput.getValue() !== '' && e.which === 13 ) {
		this.emit(
			'newCategory',
			this.categoryInput.getCategoryItemFromValue( this.categoryInput.getValue() )
		);
		this.categoryInput.setValue( '' );
	}
};

/**
 * Handle menu item select event.
 *
 * @method
 * @param {ve.ui.MenuItemWidget} item Selected item
 */
ve.ui.MWCategoryWidget.prototype.onLookupMenuItemSelect = function ( item ) {
	if ( item && item.getData() !== '' ) {
		this.emit( 'newCategory',  this.categoryInput.getCategoryItemFromValue( item.getData() ) );
		this.categoryInput.setValue( '' );
	}
};

/**
 * Calls metaItem remove method
 *
 * @param {String} name category name
 */
ve.ui.MWCategoryWidget.prototype.onRemoveCategory = function ( name ) {
	this.categories[name].metaItem.remove();
};

/**
 * Update sortkey value, emit upsteSortkey event
 *
 * @param {String} name
 * @param {String} value
 */
ve.ui.MWCategoryWidget.prototype.onUpdateSortkey = function ( name, value ) {
	this.categories[name].sortKey = value;
	this.emit( 'updateSortkey', this.categories[name] );
};

/**
 * Sets popup state when popup is hidden
 */
ve.ui.MWCategoryWidget.prototype.onPopupHide = function () {
	this.popupState = false;
};

/**
 * Saves current popup state
 */
ve.ui.MWCategoryWidget.prototype.onSavePopupState = function () {
	this.savedPopupState = this.popupState;
};

/**
 * Toggles popup menu per category item
 * @param {Object} item
 */
ve.ui.MWCategoryWidget.prototype.onTogglePoupupMenu = function ( item ) {
	// Close open popup.
	if ( this.savedPopupState === false || item.value !== this.popup.category ) {
		this.popup.openPopup( item );
	} else {
		// Handle toggle
		this.popup.closePopup();
	}
};

/**
 * Get list of category names.
 *
 * @method
 * @param {string[]} List of category names
 */
ve.ui.MWCategoryWidget.prototype.getCategories = function () {
	return ve.getObjectKeys( this.categories );
};

/**
 * Adds category items.
 *
 * @method
 * @param {Object[]} items [description]
 * @chainable
 */
ve.ui.MWCategoryWidget.prototype.addItems = function ( items ) {
	var i, len, item, categoryGroupItem,
		existingCategoryGroupItem = null;

	for ( i = 0, len = items.length; i < len; i++ ) {
		item = items[i];

		// Filter out categories derived from aliens.
		// TODO: Remove the block below once aliens no longer add items to metalist.
		if( 'html/0/about' in item.metaItem.element.attributes ) {
			return this;
		}
		categoryGroupItem = new ve.ui.MWCategoryItemWidget( { '$$': this.$$, 'item': item } );
		// Bind category item events.
		categoryGroupItem.connect( this, {
			'savePopupState': 'onSavePopupState',
			'togglePopupMenu': 'onTogglePoupupMenu'
		} );
		if ( item.value in this.categories ) {
			existingCategoryGroupItem = this.categories[item.value];
			this.categories[item.value].metaItem.remove();
		}
		this.categories[item.value] = categoryGroupItem;
		if ( existingCategoryGroupItem ) {
			categoryGroupItem.sortKey = existingCategoryGroupItem.sortKey;
		}
		this.$categories.append( categoryGroupItem.$ );
	}
	return this;
};

/**
 * Remove category items.
 *
 * @method
 * @param {string[]} names Names of categories to remove
 */
ve.ui.MWCategoryWidget.prototype.removeItems = function ( names ) {
	var i, len;

	for ( i = 0, len = names.length; i < len; i++ ) {
		this.categories[names[i]].$.remove();
		delete this.categories[names[i]];
	}
};
