/*!
 * VisualEditor UserInterface Inspector class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface inspector.
 *
 * @class
 * @extends ve.ui.Window
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.Inspector = function VeUiInspector( surface ) {
	// Inheritance
	ve.ui.Window.call( this, surface );

	// Properties
	this.initialSelection = null;

	// Initialization
	this.$.addClass( 've-ui-inspector' );
};

/* Inheritance */

ve.inheritClass( ve.ui.Inspector, ve.ui.Window );

/* Static Properties */

/**
 * Pattern to use when matching against annotation type strings.
 *
 * @static
 * @property {RegExp}
 */
ve.ui.Inspector.static.typePattern = new RegExp();

ve.ui.Inspector.static.titleMessage = 've-ui-inspector-title';

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.Inspector.prototype.initialize = function () {
	// Call parent method
	ve.ui.Window.prototype.initialize.call( this );

	// Initialization
	this.$form = this.$$( '<form>' );
	this.closeButton = new ve.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'previous', 'title': ve.msg( 'visualeditor-inspector-close-tooltip' )
	} );
	this.removeButton = new ve.ui.IconButtonWidget( {
		'$$': this.$$, 'icon': 'remove', 'title': ve.msg( 'visualeditor-inspector-remove-tooltip' )
	} );

	// Events
	this.$form.on( {
		'submit': ve.bind( this.onFormSubmit, this ),
		'keydown': ve.bind( this.onFormKeyDown, this )
	} );
	this.closeButton.on( 'click', ve.bind( this.onCloseButtonClick, this ) );
	this.removeButton.on( 'click', ve.bind( this.onRemoveButtonClick, this ) );

	// Initialization
	this.closeButton.$.addClass( 've-ui-inspector-closeButton' );
	this.removeButton.$.addClass( 've-ui-inspector-removeButton' );
	this.$head.prepend( this.closeButton.$ ).append( this.removeButton.$ );
	this.$body.append( this.$form );
};

/**
 * Handle close button click events.
 *
 * @method
 */
ve.ui.Inspector.prototype.onCloseButtonClick = function () {
	this.close();
};

/**
 * Handle remove button click events.
 *
 * @method
 */
ve.ui.Inspector.prototype.onRemoveButtonClick = function() {
	this.close( true );
};

/**
 * Handle form submission events.
 *
 * @method
 * @param {jQuery.Event} e Form submit event
 */
ve.ui.Inspector.prototype.onFormSubmit = function () {
	this.close();
	return false;
};

/**
 * Handle form keydown events.
 *
 * @method
 * @param {jQuery.Event} e Key down event
 */
ve.ui.Inspector.prototype.onFormKeyDown = function ( e ) {
	// Escape
	if ( e.which === 27 ) {
		this.close();
		return false;
	}
};

/**
 * Handle inspector initialize events.
 *
 * @method
 */
ve.ui.Inspector.prototype.onOpen = function () {
	this.initialSelection = this.surface.getModel().getSelection();
};

/**
 * Get matching annotations within a fragment.
 *
 * @method
 * @param {ve.dm.SurfaceFragment} fragment Fragment to get matching annotations within
 * @returns {ve.dm.AnnotationSet} Matching annotations
 */
ve.ui.Inspector.prototype.getMatchingAnnotations = function ( fragment ) {
	return fragment.getAnnotations().getAnnotationsByName( this.constructor.static.typePattern );
};

/* Initialization */

ve.ui.Inspector.static.addLocalStylesheets( [ 've.ui.Inspector.css' ] );
