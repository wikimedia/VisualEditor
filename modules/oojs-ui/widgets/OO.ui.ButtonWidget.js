/*!
 * ObjectOriented UserInterface ButtonWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.ButtonWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.FlaggableElement
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {number} [tabIndex] Button's tab index
 * @cfg {string} [title=''] Title text
 * @cfg {string} [href] Hyperlink to visit when clicked
 * @cfg {string} [target] Target to open hyperlink in
 */
OO.ui.ButtonWidget = function OoUiButtonWidget( config ) {
	// Configuration initialization
	config = OO.ui.extendObject( { 'target': '_blank' }, config );

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.FlaggableElement.call( this, config );
	OO.ui.LabeledElement.call( this, this.$$( '<span>' ), config );

	// Properties
	this.$button = this.$$( '<a>' );
	this.isHyperlink = typeof config.href === 'string';
	this.tabIndex = null;

	// Events
	this.$button.on( {
		'mousedown': OO.ui.bind( this.onMouseDown, this ),
		'mouseup': OO.ui.bind( this.onMouseUp, this ),
		'click': OO.ui.bind( this.onClick, this ),
		'keypress': OO.ui.bind( this.onKeyPress, this )
	} );

	// Initialization
	this.$button
		.addClass( 'oo-ui-buttonWidget-button' )
		.append( this.$label )
		.attr( {
			'role': 'button',
			'title': config.title,
			'href': config.href,
			'target': config.target
		} )
		.prop( 'tabIndex', config.tabIndex || 0 );
	this.$
		.addClass( 'oo-ui-buttonWidget' )
		.append( this.$button );
};

/* Inheritance */

OO.inheritClass( OO.ui.ButtonWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.ButtonWidget, OO.ui.FlaggableElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.LabeledElement );

/* Events */

/**
 * @event click
 */

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.ButtonWidget.prototype.onMouseDown = function () {
	this.tabIndex = this.$button.attr( 'tabIndex' );
	// Remove the tab-index while the button is down to prevent the button from stealing focus
	this.$button.removeAttr( 'tabIndex' );
};

/**
 * Handles mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.ButtonWidget.prototype.onMouseUp = function () {
	// Restore the tab-index after the button is up to restore the button's accesssibility
	this.$button.attr( 'tabIndex', this.tabIndex );
};

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 * @fires click
 */
OO.ui.ButtonWidget.prototype.onClick = function () {
	if ( !this.disabled ) {
		this.emit( 'click' );
		if ( this.isHyperlink ) {
			return true;
		}
	}
	return false;
};

/**
 * Handles keypress events.
 *
 * @method
 * @param {jQuery.Event} e Keypress event
 * @fires click
 */
OO.ui.ButtonWidget.prototype.onKeyPress = function ( e ) {
	if ( !this.disabled && e.which === OO.ui.Keys.SPACE ) {
		if ( this.isHyperlink ) {
			this.onClick();
			return true;
		}
	}
	return false;
};
