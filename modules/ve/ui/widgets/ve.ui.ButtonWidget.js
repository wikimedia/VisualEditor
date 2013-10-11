/*!
 * VisualEditor UserInterface ButtonWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ButtonWidget object.
 *
 * @class
 * @abstract
 * @extends ve.ui.Widget
 * @mixins ve.ui.FlaggableElement
 * @mixins ve.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {number} [tabIndex] Button's tab index
 * @cfg {string} [title=''] Title text
 * @cfg {string} [href] Hyperlink to visit when clicked
 * @cfg {string} [target] Target to open hyperlink in
 */
ve.ui.ButtonWidget = function VeUiButtonWidget( config ) {
	// Configuration initialization
	config = ve.extendObject( { 'target': '_blank' }, config );

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Mixin constructors
	ve.ui.FlaggableElement.call( this, config );
	ve.ui.LabeledElement.call( this, this.$$( '<span>' ), config );

	// Properties
	this.$button = this.$$( '<a>' );
	this.isHyperlink = typeof config.href === 'string';
	this.tabIndex = null;

	// Events
	this.$button.on( {
		'mousedown': ve.bind( this.onMouseDown, this ),
		'mouseup': ve.bind( this.onMouseUp, this ),
		'click': ve.bind( this.onClick, this ),
		'keypress': ve.bind( this.onKeyPress, this )
	} );

	// Initialization
	this.$button
		.addClass( 've-ui-buttonWidget-button' )
		.append( this.$label )
		.attr( {
			'role': 'button',
			'title': config.title,
			'href': config.href,
			'target': config.target
		} )
		.prop( 'tabIndex', config.tabIndex || 0 );
	this.$
		.addClass( 've-ui-buttonWidget' )
		.append( this.$button );
};

/* Inheritance */

OO.inheritClass( ve.ui.ButtonWidget, ve.ui.Widget );

OO.mixinClass( ve.ui.ButtonWidget, ve.ui.FlaggableElement );
OO.mixinClass( ve.ui.ButtonWidget, ve.ui.LabeledElement );

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
ve.ui.ButtonWidget.prototype.onMouseDown = function () {
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
ve.ui.ButtonWidget.prototype.onMouseUp = function () {
	// Restore the tab-index after the button is up to restore the button's accesssibility
	this.$button.attr( 'tabIndex', this.tabIndex );
};

/**
 * Handles mouse click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 * @emits click
 */
ve.ui.ButtonWidget.prototype.onClick = function () {
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
 * @emits click
 */
ve.ui.ButtonWidget.prototype.onKeyPress = function ( e ) {
	if ( !this.disabled && e.which === ve.Keys.SPACE ) {
		if ( this.isHyperlink ) {
			this.onClick();
			return true;
		}
	}
	return false;
};
