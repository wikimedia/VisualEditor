/*!
 * VisualEditor UserInterface ButtonTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface button tool.
 *
 * @abstract
 * @class
 * @extends ve.ui.Tool
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.ButtonTool = function VeUiButtonTool( toolbar ) {
	// Parent constructor
	ve.ui.Tool.call( this, toolbar );

	// Properties
	this.active = false;
	this.disabled = false;

	// Events
	this.$.on( {
		'mousedown': ve.bind( this.onMouseDown, this ),
		'mouseup': ve.bind( this.onMouseUp, this )
	} );

	// Initialization
	this.$.addClass( 've-ui-buttonTool' );
	var name,
		icon = this.constructor.static.icon,
		lang = ve.init.platform.getUserLanguage();
	if ( icon ) {
		if ( ve.isPlainObject( icon ) ) {
			name = lang in icon ? icon[lang] : icon['default'];
		} else {
			name = icon;
		}
		this.$.addClass( 've-ui-icon-' + name );
	}
};

/* Inheritance */

ve.inheritClass( ve.ui.ButtonTool, ve.ui.Tool );

/* Static Properties */

/**
 * Symbolic name of icon.
 *
 * Value should be the unique portion of an icon CSS class name, such as 'up' for 've-ui-icon-up'.
 *
 * For i18n purposes, this property can be an object containing a `default` icon name property and
 * additional icon names keyed by language code.
 *
 * Example of i18n icon definition:
 *     { 'default': 'bold-a', 'en': 'bold-b', 'de': 'bold-f' }
 *
 * @abstract
 * @static
 * @property
 * @type {string|Object}
 */
ve.ui.Tool.static.icon = '';

/* Methods */

/**
 * Handle the mouse button being pressed.
 *
 * @method
 * @param {jQuery.Event} e Normalized event
 */
ve.ui.ButtonTool.prototype.onMouseDown = function ( e ) {
	if ( e.which === 1 ) {
		e.preventDefault();
		return false;
	}
};

/**
 * Handle the mouse button being released.
 *
 * @method
 * @param {jQuery.Event} e Normalized event
 */
ve.ui.ButtonTool.prototype.onMouseUp = function ( e ) {
	if ( e.which === 1 && !this.disabled ) {
		return this.onClick( e );
	}
};

/**
 * Handle the button being clicked.
 *
 * This is an abstract method that must be overridden in a concrete subclass.
 *
 * @abstract
 * @method
 */
ve.ui.ButtonTool.prototype.onClick = function () {
	throw new Error(
		've.ui.ButtonTool.onClick not implemented in this subclass: ' + this.constructor
	);
};

/**
 * Handle the toolbar state being cleared.
 *
 * @method
 */
ve.ui.ButtonTool.prototype.onClearState = function () {
	this.setActive( false );
};

/**
 * Check if the button is active.
 *
 * @method
 * @param {boolean} Button is active
 */
ve.ui.ButtonTool.prototype.isActive = function () {
	return this.active;
};

/**
 * Make the button appear active or inactive.
 *
 * @method
 * @param {boolean} state Make button appear active
 */
ve.ui.ButtonTool.prototype.setActive = function ( state ) {
	this.active = !!state;
	if ( this.active ) {
		this.$.addClass( 've-ui-buttonTool-active' );
	} else {
		this.$.removeClass( 've-ui-buttonTool-active' );
	}
};

/**
 * Check if the button is disabled.
 *
 * @method
 * @param {boolean} Button is disabled
 */
ve.ui.ButtonTool.prototype.isDisabled = function () {
	return this.disabled;
};

/**
 * Set the disabled state of the button.
 *
 * This will change the button's appearance and prevent the {onClick} from being called.
 *
 * @method
 * @param {boolean} state Disable button
 */
ve.ui.ButtonTool.prototype.setDisabled = function ( state ) {
	this.disabled = !!state;
	if ( this.disabled ) {
		this.$.addClass( 've-ui-buttonTool-disabled' );
	} else {
		this.$.removeClass( 've-ui-buttonTool-disabled' );
	}
};
