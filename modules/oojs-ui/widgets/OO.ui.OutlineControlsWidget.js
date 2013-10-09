/*!
 * ObjectOriented UserInterface OutlineControlsWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.OutlineControlsWidget object.
 *
 * @class
 *
 * @constructor
 * @param {OO.ui.OutlineWidget} outline Outline to control
 * @param {Object} [config] Configuration options
 * @cfg {Object[]} [adders] List of icons to show as addable item types, each an object with
 *  name, title and icon properties
 */
OO.ui.OutlineControlsWidget = function OoUiOutlineControlsWidget( outline, config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Properties
	this.outline = outline;
	this.adders = {};
	this.$adders = this.$$( '<div>' );
	this.$movers = this.$$( '<div>' );
	this.addButton = new OO.ui.IconButtonWidget( { '$$': this.$$, 'icon': 'add-item' } );
	this.upButton = new OO.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'collapse', 'title': OO.ui.msg( 'ooui-outline-control-move-up' )
	} );
	this.downButton = new OO.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'expand', 'title': OO.ui.msg( 'ooui-outline-control-move-down' )
	} );

	// Events
	outline.connect( this, {
		'select': 'onOutlineChange',
		'add': 'onOutlineChange',
		'remove': 'onOutlineChange'
	} );
	this.upButton.connect( this, { 'click': ['emit', 'move', -1] } );
	this.downButton.connect( this, { 'click': ['emit', 'move', 1] } );

	// Initialization
	this.$.addClass( 'oo-ui-outlineControlsWidget' );
	this.$adders.addClass( 'oo-ui-outlineControlsWidget-adders' );
	this.$movers
		.addClass( 'oo-ui-outlineControlsWidget-movers' )
		.append( this.upButton.$, this.downButton.$ );
	this.$.append( this.$adders, this.$movers );
	if ( config.adders && config.adders.length ) {
		this.setupAdders( config.adders );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.OutlineControlsWidget, OO.ui.Widget );

/* Events */

/**
 * @event move
 * @param {number} places Number of places to move
 */

/* Methods */

/**
 * Handle outline change events.
 *
 * @method
 */
OO.ui.OutlineControlsWidget.prototype.onOutlineChange = function () {
	var i, len, firstMoveable, lastMoveable,
		moveable = false,
		items = this.outline.getItems(),
		selectedItem = this.outline.getSelectedItem();

	if ( selectedItem && selectedItem.isMoveable() ) {
		moveable = true;
		i = -1;
		len = items.length;
		while ( ++i < len ) {
			if ( items[i].isMoveable() ) {
				firstMoveable = items[i];
				break;
			}
		}
		i = len;
		while ( i-- ) {
			if ( items[i].isMoveable() ) {
				lastMoveable = items[i];
				break;
			}
		}
	}
	this.upButton.setDisabled( !moveable || selectedItem === firstMoveable );
	this.downButton.setDisabled( !moveable || selectedItem === lastMoveable );
};

/**
 * Setup adders icons.
 *
 * @method
 * @param {Object[]} adders List of configuations for adder buttons, each containing a name, title
 *  and icon property
 */
OO.ui.OutlineControlsWidget.prototype.setupAdders = function ( adders ) {
	var i, len, addition, button,
		$buttons = this.$$( [] );

	this.$adders.append( this.addButton.$ );
	for ( i = 0, len = adders.length; i < len; i++ ) {
		addition = adders[i];
		button = new OO.ui.IconButtonWidget( {
			'$$': this.$$, 'icon': addition.icon, 'title': addition.title
		} );
		button.connect( this, { 'click': ['emit', 'add', addition.name] } );
		this.adders[addition.name] = button;
		this.$adders.append( button.$ );
		$buttons = $buttons.add( button.$ );
	}
};
