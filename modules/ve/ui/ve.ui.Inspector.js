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
 * @param {ve.ui.Context} context
 */
ve.ui.Inspector = function VeUiInspector( context ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.context = context;
	this.disabled = false;
	this.frame = context.getFrame();
	this.$ = $( '<div class="ve-ui-inspector"></div>' );
	this.$form = this.frame.$$( '<form></form>' );
	this.$title = this.frame.$$( '<div class="ve-ui-inspector-title"></div>' )
		.text( ve.msg( this.constructor.static.titleMessage ) );
	this.$titleIcon = this.frame.$$( '<div class="ve-ui-inspector-titleIcon"></div>' )
		.addClass( 've-ui-icon-' + this.constructor.static.icon );
	this.$closeButton = this.frame.$$(
		'<div class="ve-ui-inspector-button ve-ui-inspector-closeButton ve-ui-icon-close"></div>'
	);
	this.$removeButton = this.frame.$$(
		'<div class="ve-ui-inspector-button ve-ui-inspector-removeButton ve-ui-icon-remove"></div>'
	);

	// Events
	this.$closeButton.on( {
		'click': ve.bind( this.onCloseButtonClick, this ),
	} );
	this.$removeButton.on( {
		'click': ve.bind( this.onRemoveButtonClick, this ),
	} );
	this.$form.on( {
		'submit': ve.bind( this.onFormSubmit, this ),
		'keydown': ve.bind( this.onFormKeyDown, this )
	} );

	// Initialization
	this.$.append(
		this.$closeButton,
		this.$titleIcon,
		this.$title,
		this.$removeButton,
		this.$form
	);
};

/* Inheritance */

ve.inheritClass( ve.ui.Inspector, ve.EventEmitter );

/* Static Members */

ve.ui.Inspector.static.icon = 'inspector';

ve.ui.Inspector.static.titleMessage = 'visualeditor-inspector-title';

ve.ui.Inspector.static.typePattern = new RegExp();

/* Methods */

/**
 * Checks if this inspector is disabled.
 *
 * @method
 * @param {Boolean} Inspector is disabled
 */
ve.ui.Inspector.prototype.isDisabled = function () {
	return this.disabled;
};

/**
 * Disables inspector.
 *
 * @method
 * @param {Boolean} state Disable inspector
 */
ve.ui.Inspector.prototype.setDisabled = function ( state ) {
	this.disabled = !!state;
	if ( this.disabled ) {
		this.$.addClass( 've-ui-inspector-disabled' );
	} else {
		this.$.removeClass( 've-ui-inspector-disabled' );
	}
};

/**
 * Responds to close button click events.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ui.Inspector.prototype.onCloseButtonClick = function () {
	this.context.closeInspector( true );
};

/**
 * Responds to remove button click events.
 *
 * @method
 * @param {jQuery.Event} e Click event
 * @emits 'remove'
 */
ve.ui.Inspector.prototype.onRemoveButtonClick = function() {
	if ( !this.disabled ) {
		this.context.getSurface().execute(
			'annotation', 'clearAll', this.constructor.static.typePattern
		);
		this.onRemove();
		this.emit( 'remove' );
	}
	this.context.closeInspector();
};

/**
 * Responds to form submission events.
 *
 * @method
 * @param {jQuery.Event} e Submit event
 */
ve.ui.Inspector.prototype.onFormSubmit = function ( e ) {
	e.preventDefault();
	if ( this.$.hasClass( 've-ui-inspector-disabled' ) ) {
		return;
	}
	this.context.closeInspector( true );
	return false;
};

/**
 * Responds to form keydown events.
 *
 * @method
 * @param {jQuery.Event} e Keydown event
 */
ve.ui.Inspector.prototype.onFormKeyDown = function ( e ) {
	// Escape
	if ( e.which === 27 ) {
		this.context.closeInspector( true );
		e.preventDefault();
		return false;
	}
};

/**
 * Responds to the inspector being opened.
 *
 * This is when an inspector would initialize it's form with data from the selection.
 *
 * @method
 */
ve.ui.Inspector.prototype.onOpen = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Responds to the inspector being closed.
 *
 * This is when an inspector would apply any changes made in the form to the selection.
 *
 * @method
 * @param {Boolean} accept Changes to the form should be applied
 */
ve.ui.Inspector.prototype.onClose = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Responds to the annotation being inspected being removed.
 *
 * @method
 */
ve.ui.Inspector.prototype.onRemove = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Prepares the inspector to be opened.
 *
 * This gives an inspector an opportunity to make selection and annotation changes prior to the
 * inspector being opened.
 *
 * @method
 */
ve.ui.Inspector.prototype.prepareSelection = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Gets a list of matching annotations in selection.
 *
 * @method
 * @returns {ve.AnnotationSet} Matching annotations
 */
ve.ui.Inspector.prototype.getMatchingAnnotations = function () {
	return this.context.getSurface().getModel().getFragment().getAnnotations()
		.getAnnotationsByName( this.constructor.static.typePattern );
};

/**
 * Opens inspector.
 *
 * @method
 * @emits 'open'
 */
ve.ui.Inspector.prototype.open = function () {
	this.$.show();
	this.onOpen();
	this.emit( 'open' );
};

/**
 * Closes inspector.
 *
 * @method
 * @emits 'close'
 */
ve.ui.Inspector.prototype.close = function ( accept ) {
	this.$.hide();
	this.onClose( accept );
	this.emit( 'close' );
};
