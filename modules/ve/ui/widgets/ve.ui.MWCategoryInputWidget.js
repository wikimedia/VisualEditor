/*!
 * VisualEditor UserInterface MWCategoryInputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * Creates an ve.ui.MWCategoryInputWidget object.
 *
 * @class
 * @extends ve.ui.InputWidget
 * @mixins ve.ui.PendingInputWidget
 * @mixins ve.ui.LookupInputWidget
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.MWCategoryInputWidget = function VeUiMWCategoryInputWidget( categoryWidget, config ) {
	// Config intialization
	config = ve.extendObject( {
		'placeholder': ve.msg( 'visualeditor-category-input-placeholder' )
	}, config );

	// Parent constructor
	ve.ui.InputWidget.call( this, config );

	// Mixin constructors
	ve.ui.PendingInputWidget.call( this );
	ve.ui.LookupInputWidget.call( this, this, config );

	// Properties
	this.categoryWidget = categoryWidget;
	this.forceCapitalization = mw.config.get( 'wgCaseSensitiveNamespaces' ).indexOf( 14 ) === -1;
	this.categoryPrefix = 'Category:';

	// Initialization
	this.$.addClass( 've-ui-mwCategoryInputWidget' );
	this.lookupMenu.$.addClass( 've-ui-mwCategoryInputWidget-menu' );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWCategoryInputWidget, ve.ui.InputWidget );

ve.mixinClass( ve.ui.MWCategoryInputWidget, ve.ui.PendingInputWidget );
ve.mixinClass( ve.ui.MWCategoryInputWidget, ve.ui.LookupInputWidget );

/* Static Properties */

ve.ui.MWCategoryInputWidget.static.inputType = 'text';

/* Methods */

/**
 * Gets a new request object of the current lookup query value.
 *
 * @method
 * @returns {jQuery.Deferred} Deferred object with success and fail handlers already attached
 */
ve.ui.MWCategoryInputWidget.prototype.getLookupRequest = function () {
	return $.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'data': {
			'format': 'json',
			'action': 'opensearch',
			'search': this.categoryPrefix + this.value,
			'suggest': ''
		},
		'dataType': 'json'
	} );
};

/**
 * Get lookup cache item from server response data.
 *
 * @method
 * @param {Mixed} data Response from server
 */
ve.ui.MWCategoryInputWidget.prototype.getLookupCacheItemFromData = function ( data ) {
	return ve.isArray( data ) && data.length ?
		data[1].map( ve.bind( function ( item ) {
			return item.replace( new RegExp( this.categoryPrefix, 'gi' ),  '' );
		}, this ) ) :
		[];
};

/**
 * Get list of menu items from a server response.
 *
 * @param {Object} data Query result
 * @returns {ve.ui.MenuItemWidget[]} Menu items
 */
ve.ui.MWCategoryInputWidget.prototype.getLookupMenuItemsFromData = function ( data ) {
	var i, len, item,
		exactMatch = false,
		newCategoryItems = [],
		existingCategoryItems = [],
		matchingCategoryItems = [],
		items = [],
		menu$$ = this.lookupMenu.$$,
		category = this.getCategoryItemFromValue( this.value ),
		existingCategories = this.categoryWidget.getCategories(),
		matchingCategories = data || [],
		pattern = new RegExp( '^' + category.value );

	// Existing categories
	for ( i = 0, len = existingCategories.length; i < len; i++ ) {
		item = existingCategories[i];
		if ( item.match( pattern ) ) {
			if ( item === category.value ) {
				exactMatch = true;
			}
			existingCategoryItems.push( item );
		}
	}
	// Matching categories
	for ( i = 0, len = matchingCategories.length; i < len; i++ ) {
		item = matchingCategories[i];
		if (
			existingCategoryItems.indexOf( item ) === -1 &&
			item.match( pattern )
		) {
			if ( item === category.value ) {
				exactMatch = true;
			}
			matchingCategoryItems.push( item );
		}
	}
	// New category
	if ( !exactMatch ) {
		newCategoryItems.push( category.value );
	}

	// Add sections for non-empty groups
	if ( newCategoryItems.length ) {
		items.push( new ve.ui.MenuSectionItemWidget(
			'newCategory', { '$$': menu$$, 'label': 'New category' }
		) );
		for ( i = 0, len = newCategoryItems.length; i < len; i++ ) {
			item = newCategoryItems[i];
			items.push( new ve.ui.MenuItemWidget( item, { '$$': menu$$, 'label': item } ) );
		}
	}
	if ( existingCategoryItems.length ) {
		items.push( new ve.ui.MenuSectionItemWidget(
			'inArticle', { '$$': menu$$, 'label': 'Move this category here' }
		) );
		for ( i = 0, len = existingCategoryItems.length; i < len; i++ ) {
			item = existingCategoryItems[i];
			items.push( new ve.ui.MenuItemWidget( item, { '$$': menu$$, 'label': item } ) );
		}
	}
	if ( matchingCategoryItems.length ) {
		items.push( new ve.ui.MenuSectionItemWidget(
			'matchingCategories', { '$$': menu$$, 'label': 'Matching categories' }
		) );
		for ( i = 0, len = matchingCategories.length; i < len; i++ ) {
			item = matchingCategories[i];
			items.push( new ve.ui.MenuItemWidget( item, { '$$': menu$$, 'label': item } ) );
		}
	}

	return items;
};

/**
 * Get a category item.
 *
 * @method
 * @param {string} value Category name
 * @returns {Object} Category item with name, value and metaItem properties
 */
ve.ui.MWCategoryInputWidget.prototype.getCategoryItemFromValue = function ( value ) {
	var title;

	// Normalize
	try {
		title = new mw.Title( this.categoryPrefix + value );
		return {
			'name': title.getPrefixedText(),
			'value': title.getNameText(),
			'metaItem': {}
		};
	} catch ( e ) { }

	if ( this.forceCapitalization ) {
		value = value.substr( 0, 1 ).toUpperCase() + value.substr( 1 );
	}

	return { 'name': this.categoryPrefix + value, 'value': value, 'metaItem': {} };
};
