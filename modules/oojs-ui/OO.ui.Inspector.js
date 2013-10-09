/*!
 * ObjectOriented UserInterface Inspector class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Non-modal interface in a child frame.
 *
 * @class
 * @abstract
 * @extends OO.ui.Window
 *
 * @constructor
 * @param {OO.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 */
OO.ui.Inspector = function OoUiInspector( windowSet, config ) {
	// Parent constructor
	OO.ui.Window.call( this, windowSet, config );

	// Properties
	this.initialSelection = null;

	// Initialization
	this.$.addClass( 'oo-ui-inspector' );
};

/* Inheritance */

OO.inheritClass( OO.ui.Inspector, OO.ui.Window );

/* Static Properties */

OO.ui.Inspector.static.titleMessage = 'oo-ui-inspector-title';

/**
 * Symbolic name of dialog.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Inspector.static.name = '';

/**
 * The inspector comes with a remove button

 * @static
 * @inheritable
 * @property {boolean}
 */
OO.ui.Inspector.static.removeable = true;

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
OO.ui.Inspector.prototype.initialize = function () {
	// Parent method
	OO.ui.Window.prototype.initialize.call( this );

	// Initialization
	this.frame.$content.addClass( 'oo-ui-inspector-content' );
	this.$form = this.$$( '<form>' );
	this.closeButton = new OO.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'previous', 'title': OO.ui.msg( 'ooui-inspector-close-tooltip' )
	} );
	if ( this.constructor.static.removeable ) {
		this.removeButton = new OO.ui.IconButtonWidget( {
			'$$': this.$$, 'icon': 'remove', 'title': OO.ui.msg( 'ooui-inspector-remove-tooltip' )
		} );
	}

	// Events
	this.$form.on( {
		'submit': OO.ui.bind( this.onFormSubmit, this ),
		'keydown': OO.ui.bind( this.onFormKeyDown, this )
	} );
	this.closeButton.connect( this, { 'click': 'onCloseButtonClick' } );
	if ( this.constructor.static.removeable ) {
		this.removeButton.connect( this, { 'click': 'onRemoveButtonClick' } );
	}

	// Initialization
	this.closeButton.$.addClass( 'oo-ui-inspector-closeButton' );
	this.$head.prepend( this.closeButton.$ );
	if ( this.constructor.static.removeable ) {
		this.removeButton.$.addClass( 'oo-ui-inspector-removeButton' );
		this.$head.append( this.removeButton.$ );
	}
	this.$body.append( this.$form );
};

/**
 * Handle close button click events.
 *
 * @method
 */
OO.ui.Inspector.prototype.onCloseButtonClick = function () {
	this.close( 'back' );
};

/**
 * Handle remove button click events.
 *
 * @method
 */
OO.ui.Inspector.prototype.onRemoveButtonClick = function () {
	this.close( 'remove' );
};

/**
 * Handle form submission events.
 *
 * @method
 * @param {jQuery.Event} e Form submit event
 */
OO.ui.Inspector.prototype.onFormSubmit = function () {
	this.close( 'apply' );
	return false;
};

/**
 * Handle form keydown events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
OO.ui.Inspector.prototype.onFormKeyDown = function ( e ) {
	// Escape
	if ( e.which === OO.ui.Keys.ESCAPE ) {
		this.close( 'back' );
		return false;
	}
};
