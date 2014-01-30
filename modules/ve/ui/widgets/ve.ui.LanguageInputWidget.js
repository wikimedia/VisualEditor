/*!
 * VisualEditor UserInterface LanguageInputWidget class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LanguageInputWidget object.
 *
 * @class
 * @extends OO.ui.TextInputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [language] Language code
 * @cfg {string} [direction] Direction, either `ltr` or `rtl`
 */
ve.ui.LanguageInputWidget = function VeUiLanguageInputWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Properties
	this.annotation = null;
	this.onEditTimeout = null;
	this.onAfterEditHandler = ve.bind( this.onAfterEdit, this );

	// Initialization
	this.initialize();
	this.setValue( { 'lang': config.language, 'dir': config.direction } );
};

/* Inheritance */

OO.inheritClass( ve.ui.LanguageInputWidget, OO.ui.Widget );

/* Events */

/**
 * @event change
 * @param {Object} value
 * @param {string} [value.lang] Language code
 * @param {string} [value.dir] Direction
 */

/* Methods */

/**
 * Handle value-changing events.
 *
 * Change events are debounced so that changing the lang and dir consecutively will only change the
 * value one time. This might occur when using a utility to find a language, but won't happen if the
 * user manally sets the language and direction through the user interface.
 */
ve.ui.LanguageInputWidget.prototype.onEdit = function () {
	if ( !this.disabled && !this.onEditTimeout ) {
		this.onEditTimeout = setTimeout( this.onAfterEditHandler );
	}
};

/**
 * Handle debounced edit events.
 */
ve.ui.LanguageInputWidget.prototype.onAfterEdit = function () {
	var selectedItem = this.directionSelect.getSelectedItem();

	this.setValue( {
		'lang': this.languageTextInput.getValue(),
		'dir': selectedItem ? selectedItem.getData() : null
	} );
	this.onEditTimeout = null;
};

/**
 * Set language and direction values.
 *
 * @param {Object.<string,string>} values Map of values
 * @param {string} [values.lang] Language code
 * @param {string} [values.dir] Direction
 */
ve.ui.LanguageInputWidget.prototype.setValue = function ( values ) {
	var prev = this.annotation ? this.annotation.getAttributes() : {},
		next = { 'lang': values.lang, 'dir': values.dir || null };

	if ( prev.lang !== next.lang || prev.dir !== next.dir ) {
		this.setAnnotation( next.lang || next.dir ?
			new ve.dm.LanguageAnnotation( {
				'type': 'meta/language',
				'attributes': next
			} ) :
			null
		);
		this.emit( 'change', next );
	}
};

/**
 * Get language and direction values.
 *
 * @returns {Object.<string,string>} Map of values, containing `lang` and `dir` if present
 */
ve.ui.LanguageInputWidget.prototype.getValue = function () {
	var attr = this.annotation.getAttributes();
	return { 'lang': attr.lang, 'dir': attr.dir };
};

/**
 * Set the annotation.
 *
 * The inputs value will automatically be updated.
 *
 * @param {ve.dm.LinkAnnotation|null} annotation Link annotation or null to reset
 * @chainable
 */
ve.ui.LanguageInputWidget.prototype.setAnnotation = function ( annotation ) {
	this.annotation = annotation;
	if ( annotation ) {
		this.languageTextInput.setValue( annotation.getAttribute( 'lang' ) );
		this.directionSelect.selectItem(
			this.directionSelect.getItemFromData( annotation.getAttribute( 'dir' ) || null )
		);
	} else {
		this.languageTextInput.setValue( '' );
		this.directionSelect.selectItem( this.directionSelect.getItemFromData( null ) );
	}

	return this;
};

/**
 * Get the annotation value.
 *
 * @returns {ve.dm.LinkAnnotation} Link annotation
 */
ve.ui.LanguageInputWidget.prototype.getAnnotation = function () {
	return this.annotation;
};

/**
 * Initialize contents.
 */
ve.ui.LanguageInputWidget.prototype.initialize = function () {
	// Properties
	this.languageTextInput = new OO.ui.TextInputWidget( {
		'$': this.$,
		'classes': [ 've-ui-langInputWidget-languageTextInput' ]
	} );
	this.directionSelect = new OO.ui.ButtonSelectWidget( {
		'$': this.$,
		'classes': [ 've-ui-langInputWidget-directionSelect' ],
	} );
	this.directionSelect.addItems( [
		new OO.ui.ButtonOptionWidget( 'rtl', { '$': this.$, 'icon': 'text-dir-rtl' } ),
		new OO.ui.ButtonOptionWidget( null, { '$': this.$, 'label': 'Auto' } ),
		new OO.ui.ButtonOptionWidget( 'ltr', { '$': this.$, 'icon': 'text-dir-ltr' } )
	] );

	this.languageTextInputLabel = new OO.ui.InputLabelWidget( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-languageinspector-widget-label-langcode' ),
		'input': this.languageTextInput
	} );
	this.directionSelectLabel = new OO.ui.InputLabelWidget( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-languageinspector-widget-label-direction' )
	} );
	this.$languageField = this.$( '<div>' );
	this.$directionField = this.$( '<div>' );

	// Initialization
	this.$languageField
		.addClass( 've-ui-langInputWidget-field' )
		.append( this.languageTextInputLabel.$element, this.languageTextInput.$element );
	this.$directionField
		.addClass( 've-ui-langInputWidget-field' )
		.append( this.directionSelectLabel.$element, this.directionSelect.$element );
	this.$element
		.addClass( 've-ui-langInputWidget' )
		.append( this.$languageField, this.$directionField );

	// Events
	this.languageTextInput.connect( this, { 'change': 'onEdit' } );
	this.directionSelect.connect( this, { 'select': 'onEdit' } );
};
