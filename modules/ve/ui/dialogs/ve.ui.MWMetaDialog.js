/*!
 * VisualEditor user interface MWMetaDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * Document dialog.
 *
 * @class
 * @extends ve.ui.PagedDialog
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.MWMetaDialog = function VeUiMWMetaDialog( surface ) {
	// Parent constructor
	ve.ui.PagedDialog.call( this, surface );

	// Properties
	this.metaList = surface.getModel().metaList;
	this.defaultSortKeyItem = this.getDefaultSortKeyItem();
	this.defaultSortKeyChanged = false;
	this.fallbackDefaultSortKey = mw.config.get( 'wgTitle' );

	// Events
	this.metaList.connect( this, {
		'insert': 'onMetaListInsert',
		'remove': 'onMetaListRemove'
	} );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWMetaDialog, ve.ui.PagedDialog );

/* Static Properties */

ve.ui.MWMetaDialog.static.titleMessage = 'visualeditor-dialog-meta-title';

ve.ui.MWMetaDialog.static.icon = 'settings';

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWMetaDialog.prototype.onOpen = function () {
	var surfaceModel = this.surface.getModel(),
		categoryWidget = this.categoryWidget;

	// Force all previous transactions to be separate from this history state
	surfaceModel.breakpoint();
	surfaceModel.stopHistoryTracking();

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Update input position once visible
	setTimeout( function () {
		categoryWidget.fitInput();
	} );
};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWMetaDialog.prototype.onClose = function ( action ) {
	var surfaceModel = this.surface.getModel(),
		defaultSortKeyItem;

	// Parent method
	ve.ui.PagedDialog.prototype.onClose.call( this );

	// Place transactions made while dialog was open in a common history state
	surfaceModel.breakpoint();

	// Undo everything done in the dialog and prevent redoing those changes
	if ( action === 'cancel' ) {
		surfaceModel.undo();
		surfaceModel.truncateUndoStack();
	}

	if ( this.defaultSortKeyChanged ) {
		defaultSortKeyItem = new ve.dm.MWDefaultSortMetaItem( {
			'type': 'MWdefaultSort',
			'attributes': { 'content': this.defaultSortInput.getValue() }
		} );
		if ( this.defaultSortKeyItem ) {
			this.defaultSortKeyItem.replaceWith( defaultSortKeyItem );
		} else {
			this.metaList.insertMeta( defaultSortKeyItem );
		}
	}

	// Return to normal tracking behavior
	surfaceModel.startHistoryTracking();
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWMetaDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.PagedDialog.prototype.initialize.call( this );

	// Properties
	this.categoriesFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.$$, 'label': 'Categories', 'icon': 'tag'
	} );
	this.categorySettingsFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.$$, 'label': 'Category settings', 'icon': 'settings'
	} );
	this.categoryWidget = new ve.ui.MWCategoryWidget( {
		'$$': this.$$, '$overlay': this.$overlay
	} );
	this.defaultSortInput = new ve.ui.TextInputWidget( {
		'$$': this.$$, 'placeholder': this.fallbackDefaultSortKey
	} );
	this.defaultSortLabel = new ve.ui.InputLabelWidget( {
		'$$': this.$$,
		'input': this.defaultSortInput,
		'label': 'Default page name on category page'
	} );

	// Events
	this.categoryWidget.connect( this, {
		'newCategory': 'onNewCategory',
		'updateSortkey': 'onUpdateSortKey'
	} );
	this.defaultSortInput.connect( this, {
		'change': 'onDefaultSortChange'
	} );

	// Initialization
	this.defaultSortInput.setValue(
		this.defaultSortKeyItem ? this.defaultSortKeyItem.getAttribute( 'content' ) : ''
	);
	this.categoryWidget.addItems( this.getCategoryItems() );
	this.addPage( 'categories', 'Categories', 'tag' )
		.addPage( 'languages', 'Languages', 'language' );
	this.pages.categories.$.append( this.categoriesFieldset.$, this.categorySettingsFieldset.$ );
	this.categoriesFieldset.$.append( this.categoryWidget.$ );
	this.categorySettingsFieldset.$.append(
		this.defaultSortLabel.$, this.defaultSortInput.$
	);
};

/**
 * Get default sort key item.
 *
 * @returns {string} Default sort key item
 */
ve.ui.MWMetaDialog.prototype.getDefaultSortKeyItem = function () {
	var items = this.metaList.getItemsInGroup( 'MWdefaultSort' );
	return items.length ? items[0] : null;
};

/**
 * Get array of category items from meta list
 *
 * @method
 * @returns {Object[]} items
 */
ve.ui.MWMetaDialog.prototype.getCategoryItems = function () {
	var i,
		items = [],
		categories = this.metaList.getItemsInGroup( 'MWcategory' );

	// Loop through MwCategories and build out items
	for ( i = 0; i < categories.length; i++ ) {
		items.push( this.getCategoryItemFromMetaListItem( categories[i] ) );
	}
	return items;
};

/**
 * Gets category item from meta list item
 *
 * @method
 * @param {Object} ve.dm.MWCategoryMetaItem
 * @returns {Object} item
 */
ve.ui.MWMetaDialog.prototype.getCategoryItemFromMetaListItem = function ( metaItem ) {
	return {
		'name': metaItem.element.attributes.category,
		'value': metaItem.element.attributes.category.split( ':' )[1],
		// TODO: sortkey is lcase, make consistent throughout CategoryWidget
		'sortKey': metaItem.element.attributes.sortkey,
		'metaItem': metaItem
	};
};

/**
 * Get metaList like object to insert from item
 *
 * @method
 * @param {Object} item category widget item
 * @returns {Object} metaBase
 */
ve.ui.MWMetaDialog.prototype.getCategoryItemForInsertion = function ( item ) {
	return {
		'attributes': { 'category': item.name, 'sortkey': item.sortKey || '' },
		'type': 'MWcategory'
	};
};

/**
 * Handle category default sort change events.
 *
 * @param {string} value Default sort value
 */
ve.ui.MWMetaDialog.prototype.onDefaultSortChange = function ( value ) {
	this.categoryWidget.setDefaultSortKey( value === '' ? this.fallbackDefaultSortKey : value );
	this.defaultSortKeyChanged = true;
};

/**
 * Inserts new category into meta list
 *
 * @method
 * @param {Object} item
 */
ve.ui.MWMetaDialog.prototype.onNewCategory = function ( item ) {
	// Insert new metaList item
	this.insertMetaListItem( this.getCategoryItemForInsertion( item ) );
};

/**
 * Removes and re-inserts updated category widget item
 *
 * @method
 * @param {Object} item
 */
ve.ui.MWMetaDialog.prototype.onUpdateSortKey = function ( item ) {
	// Replace meta item with updated one
	item.metaItem.replaceWith( this.getCategoryItemForInsertion( item ) );
};

/**
 * Bound to MetaList insert event for adding meta dialog components.
 *
 * @method
 * @param {Object} ve.dm.MetaItem
 */
ve.ui.MWMetaDialog.prototype.onMetaListInsert = function ( metaItem ) {
	// Responsible for adding UI components
	if ( metaItem.element.type === 'MWcategory' ) {
		this.categoryWidget.addItems(
			[ this.getCategoryItemFromMetaListItem( metaItem ) ],
			this.metaList.findItem( metaItem.getOffset(), metaItem.getIndex(), 'MWcategory' )
		);
	}
};

/**
 * Bound to MetaList insert event for removing meta dialog components.
 *
 * @method
 * @param {Object} ve.dm.MetaItem
 */
ve.ui.MWMetaDialog.prototype.onMetaListRemove = function ( metaItem ) {
	var item;

	if ( metaItem.element.type === 'MWcategory' ) {
		item = this.getCategoryItemFromMetaListItem( metaItem );
		this.categoryWidget.removeItems( [item.value] );
	}
};

/**
 * Inserts a meta list item
 *
 * @param {Object} metaBase meta list insert object
 */
ve.ui.MWMetaDialog.prototype.insertMetaListItem = function ( metaBase ) {
	var offset = this.surface.getModel().getDocument().getData().length;
	this.metaList.insertMeta( metaBase, offset );
};

/* Registration */

ve.ui.dialogFactory.register( 'mwMeta', ve.ui.MWMetaDialog );
