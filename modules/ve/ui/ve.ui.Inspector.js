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
 * @extends {ve.EventEmitter}
 * @param {ve.ui.Toolbar} toolbar
 * @param {ve.ui.Context} context
 */
ve.ui.Inspector = function ve_ui_Inspector( toolbar, context ) {
	var inspector = this;

	// Inheritance
	ve.EventEmitter.call( this );

	if ( !toolbar || !context ) {
		return;
	}

	// Properties
	this.toolbar = toolbar;
	this.context = context;
	this.$ = $( '<div class="ve-ui-inspector"></div>', context.inspectorDoc );
	this.$closeButton = $(
		'<div class="ve-ui-inspector-button ve-ui-inspector-closeButton"></div>',
		context.inspectorDoc
	);
	this.$acceptButton = $(
		'<div class="ve-ui-inspector-button ve-ui-inspector-acceptButton"></div>',
		context.inspectorDoc
	);
	this.$form = $( '<form>', context.inspectorDoc );

	// DOM Changes
	this.$.append( this.$closeButton, this.$acceptButton, this.$form );

	// Events
	this.$closeButton.on( {
		'click': function () {
			context.closeInspector( false );
		}
	} );
	this.$acceptButton.on( {
		'click': function () {
			context.closeInspector ( true );
		}
	} );
	this.$form.on( {
		'submit': ve.bind( this.onSubmit, this ),
		'keydown': ve.bind( this.onKeyDown, this )
	} );
};

/* Inheritance */

ve.inheritClass( ve.ui.Inspector, ve.EventEmitter );

/* Methods */

ve.ui.Inspector.prototype.onSubmit = function ( e ) {
	e.preventDefault();
	this.context.closeInspector( true );
	return false;
};

ve.ui.Inspector.prototype.onKeyDown = function ( e ) {
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
