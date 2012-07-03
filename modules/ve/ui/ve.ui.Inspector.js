/**
 * VisualEditor user interface Inspector class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Inspector object.
 *
 * @class
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
ve.ui.Inspector = function( toolbar, context ) {
	// Inheritance
	ve.EventEmitter.call( this );
	if ( !toolbar || !context ) {
		return;
	}

	// Properties
	this.toolbar = toolbar;
	this.context = context;
	this.$ = $( '<div class="es-inspector"></div>' );
	//
	this.$closeButton = $( '<div class="es-inspector-button es-inspector-close-button"></div>' )
		.appendTo( this.$ );
	this.$acceptButton = $( '<div class="es-inspector-button es-inspector-accept-button"></div>' )
		.appendTo( this.$ );
	this.$form = $( '<form></form>' ).appendTo( this.$ );

	// Events
	var _this = this;
	this.$closeButton.click( function() {
		_this.context.closeInspector( false );
	} );
	this.$acceptButton.click( function() {
		if ( !$(this).is( '.es-inspector-button-disabled' ) ) {
			_this.context.closeInspector( true );
		}
	} );
	this.$form.submit( function( e ) {
		_this.context.closeInspector( true );
		e.preventDefault();
		return false;
	} );
	this.$form.keydown( function( e ) {
		// Escape
		if ( e.which === 27 ) {
			_this.context.closeInspector( false );
			e.preventDefault();
			return false;
		}
	} );
};

/* Methods */

ve.ui.Inspector.prototype.open = function() {
	// Prepare to open
	if ( this.prepareOpen ) {
		this.prepareOpen();
	}
	// Show
	this.$.show();
	this.context.closeMenu();
	// Open
	if ( this.onOpen ) {
		this.onOpen();
	}
	this.emit( 'open' );
};

ve.ui.Inspector.prototype.close = function( accept ) {
	this.$.hide();
	if ( this.onClose ) {
		this.onClose( accept );
	}
	this.emit( 'close' );
};

/* Inheritance */

ve.extendClass( ve.ui.Inspector, ve.EventEmitter );
