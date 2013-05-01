/*!
 * VisualEditor user interface PagedDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Paged dialog.
 *
 * A paged dialog has an outline in the left third, and a series of pages in the right two-thirds.
 * Pages can be added using the #addPage method, and later accessed using `this.pages[name]` or
 * through the #getPage method.
 *
 * @class
 * @abstract
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.PagedDialog = function VeUiPagedDialog( surface ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface );

	// Properties
	this.pages = {};
};

/* Inheritance */

ve.inheritClass( ve.ui.PagedDialog, ve.ui.Dialog );

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.PagedDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Properties
	this.outlinePanel = new ve.ui.PanelLayout( { '$$': this.$$, 'scroll': true } );
	this.pagesPanel = new ve.ui.StackPanelLayout( { '$$': this.$$ } );
	this.layout = new ve.ui.GridLayout(
		[this.outlinePanel, this.pagesPanel], { '$$': this.$$, 'widths': [1, 2] }
	);
	this.outlineWidget = new ve.ui.OutlineWidget( { '$$': this.$$ } );

	// Events
	this.outlineWidget.connect( this, { 'select': 'onOutlineSelect' } );

	// Initialization
	this.outlinePanel.$.append( this.outlineWidget.$ ).addClass( 've-ui-pagedDialog-outlinePanel' );
	this.pagesPanel.$.addClass( 've-ui-pagedDialog-pagesPanel' );
	this.$body.append( this.layout.$ );
};

/**
 * Handle outline select events.
 *
 * @method
 * @param {ve.ui.OptionWidget} item Selected item
 */
ve.ui.PagedDialog.prototype.onOutlineSelect = function ( item ) {
	if ( item ) {
		this.pagesPanel.showItem( this.pages[item.getData()] );
	}
};

/**
 * Add a page to the dialog.
 *
 * @method
 * @param {string} name Symbolic name of page
 * @param {jQuery|string} [label] Page label
 * @param {string} [icon] Symbolic name of icon
 * @chainable
 */
ve.ui.PagedDialog.prototype.addPage = function ( name, label, icon ) {
	var config = { '$$': this.$$, 'icon': icon, 'label': label || name };

	// Create and add page panel and outline item
	this.pages[name] = new ve.ui.PagePanelLayout( config );
	this.pagesPanel.addItems( [this.pages[name]] );
	this.outlineWidget.addItems( [ new ve.ui.OutlineItemWidget( name, config ) ] );

	// Auto-select first item when nothing is selected yet
	if ( !this.outlineWidget.getSelectedItem() ) {
		this.outlineWidget.selectItem( this.outlineWidget.getClosestSelectableItem( 0 ) );
	}

	return this;
};

/**
 * Get a page by name.
 *
 * @method
 * @param {string} name Symbolic name of page
 * @returns {ve.ui.PagePanelLayout|undefined} Page, if found
 */
ve.ui.PagedDialog.prototype.getPage = function ( name ) {
	return this.pages[name];
};
