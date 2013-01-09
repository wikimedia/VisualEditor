/*!
 * VisualEditor user interface Inspector class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Inspector object.
 *
 * @class
 * @extends ve.EventEmitter
 * @constructor
 * @param {ve.ui.Context} context
 */
ve.ui.Inspector = function VeUiInspector( context ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.context = context;
	this.initialSelection = null;
	this.closing = false;
	this.frame = context.getFrame();
	this.$ = $( '<div class="ve-ui-inspector"></div>' );
	this.$form = this.frame.$$( '<form></form>' );
	this.$title = this.frame.$$( '<div class="ve-ui-inspector-title"></div>' )
		.text( ve.msg( this.constructor.static.titleMessage ) );
	this.$titleIcon = this.frame.$$( '<div class="ve-ui-inspector-titleIcon"></div>' )
		.addClass( 've-ui-icon-' + this.constructor.static.icon );
	this.$closeButton = this.frame.$$(
		'<div class="ve-ui-inspector-button ve-ui-inspector-closeButton ve-ui-icon-close"></div>'
	).attr( 'title', ve.msg( 'visualeditor-inspector-close-tooltip' ) );
	this.$removeButton = this.frame.$$(
		'<div class="ve-ui-inspector-button ve-ui-inspector-removeButton ve-ui-icon-remove"></div>'
	).attr( 'title', ve.msg( 'visualeditor-inspector-remove-tooltip' ) );

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

/**
 * Symbolic name of icon.
 *
 * @static
 * @property
 * @type {string}
 */
ve.ui.Inspector.static.icon = 'inspector';

/**
 * Localized message for title.
 *
 * @static
 * @property
 * @type {string}
 */
ve.ui.Inspector.static.titleMessage = 'visualeditor-inspector-title';

/**
 * Pattern to use when matching against annotation type strings.
 *
 * @static
 * @property
 * @type {RegExp}
 */
ve.ui.Inspector.static.typePattern = new RegExp();

/* Methods */

/**
 * Responds to close button click events.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ui.Inspector.prototype.onCloseButtonClick = function () {
	this.close();
};

/**
 * Responds to remove button click events.
 *
 * @method
 * @param {jQuery.Event} e Click event
 * @emits 'remove'
 */
ve.ui.Inspector.prototype.onRemoveButtonClick = function() {
	this.close( true );
};

/**
 * Responds to form submission events.
 *
 * @method
 * @param {jQuery.Event} e Submit event
 */
ve.ui.Inspector.prototype.onFormSubmit = function ( e ) {
	e.preventDefault();
	this.close();
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
		this.close();
		e.preventDefault();
		return false;
	}
};

/**
 * Responds to the inspector being initialized.
 *
 * This gives an inspector an opportunity to make selection and annotation changes prior to the
 * inspector being opened.
 *
 * @method
 */
ve.ui.Inspector.prototype.onInitialize = function () {
	// This is a stub, override functionality in child classes
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
 * @param {boolean} accept Changes to the form should be applied
 */
ve.ui.Inspector.prototype.onClose = function () {
	// This is a stub, override functionality in child classes
};

/**
 * Gets a list of matching annotations in selection.
 *
 * @method
 * @param {ve.dm.SurfaceFragment} fragment Fragment to get matching annotations within
 * @returns {ve.AnnotationSet} Matching annotations
 */
ve.ui.Inspector.prototype.getMatchingAnnotations = function ( fragment ) {
	return fragment.getAnnotations().getAnnotationsByName( this.constructor.static.typePattern );
};

/**
 * Opens inspector.
 *
 * @method
 * @emits 'initialize'
 * @emits 'open'
 */
ve.ui.Inspector.prototype.open = function () {
	this.$.show();
	this.emit( 'beforeInitialize' );
	if ( this.onInitialize ) {
		this.onInitialize();
	}
	this.emit( 'afterInitialize' );
	this.initialSelection = this.context.getSurface().getModel().getSelection();
	this.emit( 'beforeOpen' );
	if ( this.onOpen ) {
		this.onOpen();
	}
	this.$form.find( ':input:visible:first' ).focus();
	this.emit( 'afterOpen' );
};

/**
 * Closes inspector.
 *
 * This method guards against recursive calling internally. Recursion on this method is caused by
 * changes to the document occuring in a close handler which in turn produce document model change
 * events, which in turn cause the context to close the inspector again, and so on.
 *
 * @method
 * @emits 'close' (remove)
 */
ve.ui.Inspector.prototype.close = function ( remove ) {
	if ( !this.closing ) {
		this.closing = true;
		this.$.hide();
		this.emit( 'beforeClose', remove );
		if ( this.onClose ) {
			this.onClose( remove );
		}
		this.context.getSurface().getView().getDocument().getDocumentNode().$.focus();
		this.emit( 'afterClose', remove );
		this.closing = false;
	}
};
