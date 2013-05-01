/*!
 * VisualEditor user interface MWMetaDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

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
	var surfaceModel = this.surface.getModel();

	// Force all previous transactions to be separate from this history state
	surfaceModel.breakpoint();
	surfaceModel.stopHistoryTracking();

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );
};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWMetaDialog.prototype.onClose = function ( action ) {
	var surfaceModel = this.surface.getModel();

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Place transactions made while dialog was open in a common history state
	surfaceModel.breakpoint();

	// Undo everything done in the dialog and prevent redoing those changes
	if ( action === 'cancel' ) {
		surfaceModel.undo();
		surfaceModel.truncateUndoStack();
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
	this.categoryWidget = new ve.ui.MWCategoryWidget( {
		'$$': this.$$, '$overlay': this.$overlay
	} );

	// Events
	this.categoryWidget.connect( this, {
		'newCategory': 'onNewCategory',
		'updateSortkey': 'onUpdateSortKey'
	} );

	// Initialization
	this.categoryWidget.addItems( this.getCategoryItems() );
	this.addPage( 'categories', 'Categories', 'tag' )
		.addPage( 'languages', 'Languages', 'language' );
	this.pages.categories.$.append( this.categoryWidget.$ );
};

/**
 * Gets array of category items from meta list
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
	// Store the offset and index before removing
	var offset = item.metaItem.offset,
		index = item.metaItem.index;

	item.metaItem.remove();
	// It would seem as if insertItem happens before the onRemove event is sent to CategoryWidget,
	// Remove the reference there so it doesn't try to get removed again onMetaListInsert
	delete this.categoryWidget.categories[item.name];
	// Insert updated meta item at same offset and index
	this.metaList.insertMeta( this.getCategoryItemForInsertion( item ), offset, index );
};

/**
 * Bound to MetaList insert event for adding meta dialog components.
 *
 * @method
 * @param {Object} ve.dm.MetaItem
 */
ve.ui.MWMetaDialog.prototype.onMetaListInsert = function ( metaItem ) {
	// Responsible for adding UI components.
	if ( metaItem.element.type === 'MWcategory' ) {
		this.categoryWidget.addItems( [ this.getCategoryItemFromMetaListItem( metaItem ) ] );
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
