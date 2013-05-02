/*!
 * VisualEditor UserInterface MWCategoryPopupWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.MWCategoryPopupWidget object.
 *
 * @class
 * @extends ve.ui.PopupWidget
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.MWCategoryPopupWidget = function VeUiMwCategoryPopupWidget ( config ) {
	// Parent constructor
	ve.ui.PopupWidget.call( this, config );

	// Properties
	this.category = null;
	this.$title = this.$$( '<label>' );
	this.$menu = this.$$( '<div>' );
	this.removeButton = new ve.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'remove', 'title': ve.msg( 'visualeditor-inspector-remove-tooltip' )
	} );
	this.sortKeyInput = new ve.ui.TextInputWidget( { '$$': this.$$ } );
	this.sortKeyLabel = new ve.ui.InputLabelWidget(
		{ '$$': this.$$, '$input': this.sortKeyInput, 'label': 'Page name in category' }
	);
	this.$sortKeyForm = this.$$( '<form>' ).addClass( 've-ui-mwCategorySortkeyForm' )
		.append( this.sortKeyLabel.$, this.sortKeyInput.$ );

	// Events
	this.removeButton.connect( this, { 'click': 'onRemoveCategory' } );
	this.$sortKeyForm.on( 'submit', ve.bind( this.onSortKeySubmit, this ) );

	// Initialization
	this.$.addClass( 've-ui-mwCategoryPopupMenu' ).hide();
	this.$title
		.addClass( 've-ui-mwCategoryPopupTitle ve-ui-icon-tag' )
		.text( ve.msg( 'visualeditor-category-settings-label' ) );
	this.$menu.append(
		this.$title,
		this.removeButton.$.addClass( 've-ui-mwCategoryRemoveButton' ),
		this.$sortKeyForm
	);
	this.$body.append( this.$menu );
	config.$overlay.append( this.$ );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWCategoryPopupWidget, ve.ui.PopupWidget );

/* Events */

/**
 * @event removeCategory
 */

/**
 * @event updateSortkey
 */

/* Methods */

ve.ui.MWCategoryPopupWidget.prototype.onRemoveCategory = function () {
	this.emit( 'removeCategory', this.category );
	this.closePopup();
};

ve.ui.MWCategoryPopupWidget.prototype.onSortKeySubmit = function () {
	this.emit( 'updateSortkey', this.category, this.sortKeyInput.$input.val() );
	this.closePopup();
	return false;
};

ve.ui.MWCategoryPopupWidget.prototype.openPopup = function ( item ) {
	this.show();
	this.popupOpen = true;
	this.category = item.value;
	this.loadCategoryIntoPopup( item );
	this.setPopup( item );
};

ve.ui.MWCategoryPopupWidget.prototype.loadCategoryIntoPopup = function ( item ) {
	this.sortKeyInput.$input.val( item.sortKey );
};

ve.ui.MWCategoryPopupWidget.prototype.closePopup = function () {
	this.hide();
	this.popupOpen = false;
};

ve.ui.MWCategoryPopupWidget.prototype.setPopup = function ( item ) {
	var left = item.$.offset().left + ( item.$.width() - 17 ),
		top = item.$.offset().top + item.$.height(),
		width = this.$menu.outerWidth( true ),
		height = this.$menu.outerHeight( true );

	this.$.css( { 'left': left, 'top': top } );
	this.display( left, top, width, height );
};
