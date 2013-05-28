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
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MWMetaDialog = function VeUiMWMetaDialog( surface, config ) {
	// Parent constructor
	ve.ui.PagedDialog.call( this, surface, config );

	// Properties
	this.metaList = surface.getModel().metaList;
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
ve.ui.MWMetaDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.PagedDialog.prototype.initialize.call( this );

	// Properties
	this.categoriesFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$, 'label': ve.msg( 'visualeditor-dialog-meta-categories-data-label' ), 'icon': 'tag'
	} );
	this.categorySettingsFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$, 'label': ve.msg( 'visualeditor-dialog-meta-categories-settings-label' ), 'icon': 'settings'
	} );
	this.categoryWidget = new ve.ui.MWCategoryWidget( {
		'$$': this.frame.$$, '$overlay': this.$overlay
	} );
	this.defaultSortInput = new ve.ui.TextInputWidget( {
		'$$': this.frame.$$, 'placeholder': this.fallbackDefaultSortKey
	} );
	this.defaultSortLabel = new ve.ui.InputLabelWidget( {
		'$$': this.frame.$$,
		'input': this.defaultSortInput,
		'label': ve.msg( 'visualeditor-dialog-meta-categories-defaultsort-label' )
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
	this.categoryWidget.addItems( this.getCategoryItems() );
	this.addPage( 'categories', ve.msg( 'visualeditor-dialog-meta-categories-section' ), 'tag' );
	// TODO: Implement language editing. Load page with:
	// .addPage( 'languages', ve.msg( 'visualeditor-dialog-meta-languages-section' ), 'language' );

	this.pages.categories.$.append( this.categoriesFieldset.$, this.categorySettingsFieldset.$ );
	this.categoriesFieldset.$.append( this.categoryWidget.$ );
	this.categorySettingsFieldset.$.append( this.defaultSortLabel.$, this.defaultSortInput.$ );
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWMetaDialog.prototype.onOpen = function () {
	var surfaceModel = this.surface.getModel(),
		categoryWidget = this.categoryWidget,
		defaultSortKeyItem = this.getDefaultSortKeyItem();

	this.defaultSortInput.setValue(
		defaultSortKeyItem ? defaultSortKeyItem.getAttribute( 'content' ) : ''
	);
	this.defaultSortKeyChanged = false;

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
	var newDefaultSortKeyItem,
		surfaceModel = this.surface.getModel(),
		currentDefaultSortKeyItem = this.getDefaultSortKeyItem();

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
		newDefaultSortKeyItem = new ve.dm.MWDefaultSortMetaItem( {
			'type': 'mwDefaultSort',
			'attributes': { 'content': this.defaultSortInput.getValue() }
		} );
		if ( currentDefaultSortKeyItem ) {
			currentDefaultSortKeyItem.replaceWith( newDefaultSortKeyItem );
		} else {
			this.metaList.insertMeta( newDefaultSortKeyItem );
		}
	}

	// Return to normal tracking behavior
	surfaceModel.startHistoryTracking();
};

/**
 * Get default sort key item.
 *
 * @returns {string} Default sort key item
 */
ve.ui.MWMetaDialog.prototype.getDefaultSortKeyItem = function () {
	var items = this.metaList.getItemsInGroup( 'mwDefaultSort' );
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
		categories = this.metaList.getItemsInGroup( 'mwCategory' );

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
		'type': 'mwCategory'
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
	if ( metaItem.element.type === 'mwCategory' ) {
		this.categoryWidget.addItems(
			[ this.getCategoryItemFromMetaListItem( metaItem ) ],
			this.metaList.findItem( metaItem.getOffset(), metaItem.getIndex(), 'mwCategory' )
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

	if ( metaItem.element.type === 'mwCategory' ) {
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
