/*!
 * user interface PagedPagedOutlineLayout class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

 /**
 * Layout containing a series of pages and an outline controlling their visibility.
 *
 * The outline takes up the left third, the pages taking up the remaining two-thirds on the right.
 *
 * @class
 * @extends OO.ui.PagedLayout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.editable] Show controls for adding, removing and reordering items in
 *  the outline
 * @param {Object[]} [config.adders] List of adders for controls, each an object with name, icon
 *  and title properties
 */
OO.ui.PagedOutlineLayout = function OoUiPagedOutlineLayout( config ) {
	// Initialize configuration
	config = config || {};
	config.attachPagesPanel = false;

	// Parent constructor
	OO.ui.PagedLayout.call( this, config );

	// Properties
	this.adders = config.adders || null;
	this.editable = !!config.editable;
	this.outlineControlsWidget = null;
	this.outlinePanel = new OO.ui.PanelLayout( { '$$': this.$$, 'scrollable': true } );
	this.outlineWidget = new OO.ui.OutlineWidget( { '$$': this.$$ } );
	this.gridLayout = new OO.ui.GridLayout(
		[this.outlinePanel, this.pagesPanel], { '$$': this.$$, 'widths': [1, 2] }
	);

	if ( this.editable ) {
		this.outlineControlsWidget = new OO.ui.OutlineControlsWidget(
			this.outlineWidget, { '$$': this.$$, 'adders': this.adders }
		);
	}

	// Events
	this.outlineWidget.connect( this, { 'select': 'onPageOutlineSelect' } );
	this.pagesPanel.connect( this, { 'set': 'onPagedLayoutSet' } );

	// Initialization
	this.outlinePanel.$
		.addClass( 'oo-ui-pagedOutlineLayout-outlinePanel' )
		.append( this.outlineWidget.$ );

	if ( this.editable ) {
		this.outlinePanel.$
			.addClass( 'oo-ui-pagedOutlineLayout-outlinePanel-editable' )
			.append( this.outlineControlsWidget.$ );
	}

	this.$
		.addClass( 'oo-ui-pagedOutlineLayout' )
		.append( this.gridLayout.$ );
};

/* Inheritance */

OO.inheritClass( OO.ui.PagedOutlineLayout, OO.ui.PagedLayout );

/* Methods */

/**
 * Add a page to the layout.
 *
 * @method
 * @param {string} name Symbolic name of page
 * @param {Object} [config] Condifugration options
 * @param {jQuery|string} [config.label=name] Page label
 * @param {string} [config.icon] Symbolic name of icon
 * @param {number} [config.level=0] Indentation level
 * @param {number} [config.index] Specific index to insert page at
 * @param {jQuery} [config.$content] Page content
 * @param {jQuery} [config.moveable] Allow page to be moved in the outline
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.addPage = function ( name, config ) {
	config = config || {};

	this.outlineWidget.addItems(
		[
			new OO.ui.OutlineItemWidget( name, {
				'$$': this.$$,
				'label': config.label || name,
				'level': config.level || 0,
				'icon': config.icon,
				'moveable': config.moveable
			} )
		],
		config.index
	);

	this.updateOutlineWidget();

	// Parent method
	return OO.ui.PagedLayout.prototype.addPage.call( this, name, config );
};

/**
 * Clear all pages.
 *
 * @method
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.clearPages = function () {
	this.outlineWidget.clearItems();

	// Parent method
	return OO.ui.PagedLayout.prototype.clearPages.call( this );
};

/**
 * Get the outline widget.
 *
 * @method
 * @returns {OO.ui.OutlineWidget} The outline widget.
 */
OO.ui.PagedOutlineLayout.prototype.getOutline = function () {
	return this.outlineWidget;
};

/**
 * Get the outline controls widget. If the outline is not editable, null is returned.
 *
 * @method
 * @returns {OO.ui.OutlineControlsWidget|null} The outline controls widget.
 */
OO.ui.PagedOutlineLayout.prototype.getOutlineControls = function () {
	return this.outlineControlsWidget;
};

/**
 * Handle PagedLayout set events.
 *
 * @method
 * @param {OO.ui.PanelLayout} page The page panel that is now the current panel.
 */
OO.ui.PagedOutlineLayout.prototype.onPagedLayoutSet = function ( page ) {
	page.$.find( ':input:first' ).focus();
};

/**
 * Handle outline select events.
 *
 * @method
 * @param {OO.ui.OptionWidget} item Selected item
 */
OO.ui.PagedOutlineLayout.prototype.onPageOutlineSelect = function ( item ) {
	if ( item ) {
		OO.ui.PagedLayout.prototype.setPage.call( this, item.getData() );
	}
};

/**
 * Remove a page.
 *
 * @method
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.removePage = function ( name ) {
	var page = this.pages[name];

	if ( page ) {
		this.outlineWidget.removeItems( [ this.outlineWidget.getItemFromData( name ) ] );
		this.updateOutlineWidget();
	}

	// Parent method
	return OO.ui.PagedLayout.prototype.removePage.call( this, name );
};

/**
 * Call this after adding or removing items from the OutlineWidget.
 *
 * @method
 * @chainable
 */
OO.ui.PagedOutlineLayout.prototype.updateOutlineWidget = function () {
	// Auto-select first item when nothing is selected anymore
	if ( !this.outlineWidget.getSelectedItem() ) {
		this.outlineWidget.selectItem( this.outlineWidget.getFirstSelectableItem() );
	}

	return this;
};

/**
 * @inheritdoc
 */
OO.ui.PagedOutlineLayout.prototype.setPage = function ( name ) {
	if ( name !== this.outlineWidget.getSelectedItem().getData() ) {
		this.outlineWidget.selectItem( this.outlineWidget.getItemFromData( name ) );
	}
};
