/*!
 * VisualEditor UserInterface MenuItemWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.MenuItemWidget object.
 *
 * @class
 * @extends ve.ui.Widget
 * @mixins ve.ui.LabeledWidget
 *
 * @constructor
 * @param {jQuery|string} label Item label
 * @param {Mixed} data Item data, must be unique
 * @param {Object} [config] Config options
 * @cfg {string} [rel] Value for `rel` attribute in DOM, allowing per-item styling
 * @cfg {string} [group] Item group name
 * @cfg {boolean} [highlighted] Highlight item
 * @cfg {boolean} [selected] Select item
 */
ve.ui.MenuItemWidget = function VeUiMenuItemWidget( label, data, config ) {
	// Config intialization
	config = ve.extendObject( { 'group': null, 'highlighted': false, 'selected': false }, config );

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Mixin constructors
	ve.ui.LabeledWidget.call( this, this.$$( '<span>' ), config );

	// Properties
	this.label = label;
	this.data = data;
	this.group = config.group;
	this.highlighted = config.highlighted;
	this.selected = config.selected;

	// Events
	this.$.on( {
		'click': ve.bind( this.onClick, this ),
		'mouseover': ve.bind( this.onMouseOver, this ),
		'mouseout': ve.bind( this.onMouseOut, this ),
		'mousedown': ve.bind( this.onMouseDown, this ),
		'mouseup': ve.bind( this.onMouseUp, this )
	} );

	// Initialization
	this.setLabel( this.label );
	this.$label.addClass( 've-ui-menuItemWidget-label' );
	this.$.addClass( 've-ui-menuItemWidget' ).append( this.$label );
	this.setHighlighted( config.highlighted );
	this.$.attr( 'rel', config.rel );
};

/* Inheritance */

ve.inheritClass( ve.ui.MenuItemWidget, ve.ui.Widget );

ve.mixinClass( ve.ui.MenuItemWidget, ve.ui.LabeledWidget );

/* Events */

/**
 * @event highlight
 */

/**
 * @event select
 */

/* Static Properties */

ve.ui.MenuItemWidget.static.tagName = 'li';

/* Methods */

/**
 * Handle mouse click events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse click event
 */
ve.ui.MenuItemWidget.prototype.onClick = function () {
	this.setSelected( true );
	return false;
};

/**
 * Handle mouse over events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse over event
 */
ve.ui.MenuItemWidget.prototype.onMouseOver = function () {
	this.setHighlighted( true );
};

/**
 * Handle mouse out events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse out event
 */
ve.ui.MenuItemWidget.prototype.onMouseOut = function () {
	this.setHighlighted( false );
};

/**
 * Handle mouse down events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.MenuItemWidget.prototype.onMouseDown = function () {
	return false;
};

/**
 * Handle mouse up events.
 *
 * @method
 * @private
 * @param {jQuery.Event} e Mouse up event
 */
ve.ui.MenuItemWidget.prototype.onMouseUp = function () {
	return false;
};

/**
 * Get item data.
 *
 * @method
 * @returns {Mixed} Item data
 */
ve.ui.MenuItemWidget.prototype.getData = function () {
	return this.data;
};

/**
 * Get item group.
 *
 * @method
 * @returns {string} Item group
 */
ve.ui.MenuItemWidget.prototype.getGroup = function () {
	return this.group;
};

/**
 * Check if item is highlighted.
 *
 * @method
 * @returns {boolean} Item is highlighted
 */
ve.ui.MenuItemWidget.prototype.isHighlighted = function () {
	return this.highlighted;
};

/**
 * Check if item is selected.
 *
 * @method
 * @returns {boolean} Item is selected
 */
ve.ui.MenuItemWidget.prototype.isSelected = function () {
	return this.selected;
};

/**
 * Set highlighted state.
 *
 * @method
 * @param {boolean} [state=false] Highlight item
 * @chainable
 */
ve.ui.MenuItemWidget.prototype.setHighlighted = function ( state ) {
	this.highlighted = !!state;
	if ( this.highlighted ) {
		this.$.addClass( 've-ui-menuItemWidget-highlighted' );
		this.emit( 'highlight' );
	} else {
		this.$.removeClass( 've-ui-menuItemWidget-highlighted' );
	}
	return this;
};

/**
 * Set selected state.
 *
 * @method
 * @param {boolean} [state=false] Select item
 * @param {boolean} [silent=false] Update UI only, do not emit select event
 * @chainable
 */
ve.ui.MenuItemWidget.prototype.setSelected = function ( state, silent ) {
	this.selected = !!state;
	if ( this.selected ) {
		this.$.addClass( 've-ui-icon-check' );
		if ( !silent ) {
			this.emit( 'select' );
		}
	} else {
		this.$.removeClass( 've-ui-icon-check' );
	}
	return this;
};

/**
 * Make the item flash.
 *
 * @method
 * @param {Function} [done] Callback to execute when flash effect is complete.
 */
ve.ui.MenuItemWidget.prototype.flash = function ( done ) {
	var $this = this.$;

	$this.removeClass( 've-ui-menuItemWidget-highlighted' );
	setTimeout( function () {
		$this.addClass( 've-ui-menuItemWidget-highlighted' );
		if ( done ) {
			setTimeout( done, 100 );
		}
	}, 100 );
};
