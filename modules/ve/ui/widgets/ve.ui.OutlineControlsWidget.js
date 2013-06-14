/*!
 * VisualEditor UserInterface OutlineControlsWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.OutlineControlsWidget object.
 *
 * @class
 *
 * @constructor
 * @param {ve.ui.OutlineWidget} outline Outline to control
 * @param {Object} [config] Config options
 */
ve.ui.OutlineControlsWidget = function VeUiOutlineControlsWidget( outline, config ) {
	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.outline = outline;
	this.upButton = new ve.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'collapse', 'title': ve.msg( 'visualeditor-outline-control-move-up' )
	} );
	this.downButton = new ve.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'expand', 'title': ve.msg( 'visualeditor-outline-control-move-down' )
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
	this.$.addClass( 've-ui-outlineControlsWidget' );
	this.upButton.$.addClass( 've-ui-outlineControlsWidget-upButton' );
	this.downButton.$.addClass( 've-ui-outlineControlsWidget-downButton' );
	this.$.append( this.upButton.$, this.downButton.$ );
};

/* Inheritance */

ve.inheritClass( ve.ui.OutlineControlsWidget, ve.ui.Widget );

/* Events */

/**
 * @event move
 * @param {number} places Number of places to move
 */

/* Methods */

ve.ui.OutlineControlsWidget.prototype.onOutlineChange = function () {
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
