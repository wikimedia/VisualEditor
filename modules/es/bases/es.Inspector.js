/**
 * Creates an es.Inspector object.
 * 
 * @class
 * @constructor
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 */
es.Inspector = function( toolbar, context ) {
	// Inheritance
	es.EventEmitter.call( this );
	if ( !toolbar || !context ) {
		return;
	}

	// Properties
	this.toolbar = toolbar;
	this.context = context;
	this.$ = $( '<div class="es-inspector"></div>' );
	this.$closeButton = $( '<div class="es-inspector-closeButton"></div>' ).appendTo( this.$ );
	this.$form = $( '<form></form>' ).appendTo( this.$ );

	// Events
	var _this = this;
	this.$closeButton.click( function() {
		_this.context.closeInspector();
	} );
	this.$form.submit( function( e ) {
		_this.context.closeInspector();
		e.preventDefault();
		return false;
	} );
};

/* Methods */

es.Inspector.prototype.open = function() {
	this.$.show();
	this.context.closeMenu();
	if ( this.onOpen ) {
		this.onOpen();
	}
	this.emit( 'open' );
};

es.Inspector.prototype.close = function() {
	this.$.hide();
	if ( this.onClose ) {
		this.onClose();
	}
	this.emit( 'close' );
};

/* Inheritance */

es.extendClass( es.Inspector, es.EventEmitter );
