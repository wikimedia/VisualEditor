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
ve.ui.Inspector = function ( toolbar, context ) {
	// Inheritance
	ve.EventEmitter.call( this );
	if ( !toolbar || !context ) {
		return;
	}
	var inspector = this;

	// Properties
	this.toolbar = toolbar;
	this.context = context;

	this.$ = $( '<div class="es-inspector"></div>', context.inspectorDoc );

	this.$closeButton = $( '<div class="es-inspector-button es-inspector-closeButton"></div>', context.inspectorDoc  )
		.appendTo( this.$ );
	this.$acceptButton = $( '<div class="es-inspector-button es-inspector-acceptButton"></div>', context.inspectorDoc  )
		.appendTo( this.$ );
	this.$form = $( '<form>', context.inspectorDoc ).appendTo( this.$ );

	// Inspector Events
	this.$closeButton.on( {
		'click': function() {
			context.closeInspector( false );
		}
	} );
	this.$acceptButton.on( {
		'click': function() {
			context.closeInspector ( true );
		}
	} );
	this.$form.on( {
		'submit': ve.bind( this.onSubmit, this ),
		'keydown': ve.bind( this.onKeyDown, this )
	} );
};

/* Methods */

ve.ui.Inspector.prototype.onSubmit = function( e ) {
	e.preventDefault();
	this.context.closeInspector( true );
	return false;
};

ve.ui.Inspector.prototype.onKeyDown = function( e ) {
	// Escape
	if ( e.which === 27 ) {
		this.context.closeInspector( false );
		e.preventDefault();
		return false;
	}
};

ve.ui.Inspector.prototype.open = function () {
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

ve.ui.Inspector.prototype.close = function ( accept ) {
	this.$.hide();
	if ( this.onClose ) {
		this.onClose( accept );
	}
	this.emit( 'close' );
};

/* Inheritance */

ve.extendClass( ve.ui.Inspector, ve.EventEmitter );
