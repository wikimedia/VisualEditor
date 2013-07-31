/*!
 * VisualEditor UserInterface LanguageInputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LanguageInputWidget object.
 *
 * @class
 * @extends ve.ui.TextInputWidget
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.LanguageInputWidget = function VeUiLanguageInputWidget( config ) {
	var ulsParams, langInpObj, table;

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.$langCodeDisp = this.getDisplayElement( config ); // language code
	this.$langNameDisp = this.getDisplayElement( config ); // human-readable language name
	this.$dirDisp = this.getDisplayElement( config );

	// Placeholders for annotation value
	this.annotation = null;
	this.lang = '';
	this.dir = '';

	// Create the informational table:
	table = $( '<table>' ).css( { 'width': '100%' } )
		.addClass( 've-LanguageInspector-information' )
		.append( $( '<tr>' )
			.append( $( '<td>' )
				.addClass( 've-ui-LanguageInspector-info-title' )
				.text( ve.msg( 'visualeditor-languageinspector-widget-label-language' ) ) )
			.append( $( '<td>' )
				.addClass( 've-ui-LanguageInspector-info-langname' )
			.append( this.$langNameDisp ) ) )
		.append( $( '<tr>' )
			.append( $( '<td>' )
				.addClass( 've-ui-LanguageInspector-info-title' )
				.text( ve.msg( 'visualeditor-languageinspector-widget-label-langcode' ) ) )
			.append( $( '<td>' )
				.addClass( 've-ui-LanguageInspector-info-langcode' )
			.append( this.$langCodeDisp ) ) )
		.append( $( '<tr>' )
			.append( $( '<td>' )
				.addClass( 've-ui-LanguageInspector-info-title' )
				.text( ve.msg( 'visualeditor-languageinspector-widget-label-direction' ) ) )
			.append( $( '<td>' )
				.addClass( 've-ui-LanguageInspector-info-dir' )
			.append( this.$dirDisp ) ) );
	this.$.append( table );

	// Use a different reference than 'this' to avoid scope problems
	// inside the $.ULS callback:
	langInpObj = this;

	// Initialization
	this.$.addClass( 've-ui-LangInputWidget' );

	ulsParams = {
		onSelect: function( language ) {
			langInpObj.setValue( language );
		},
		compact: true,
		// Temporary Quicklist for the Prototype:
		// (This will likely change once we find a better list)
		quickList: [ 'en', 'hi', 'he', 'ml', 'ta', 'fr' ]
	};

	// Create a 'change language' Button:
	this.$button = new ve.ui.ButtonWidget({
		'label': ve.msg( 'visualeditor-languageinspector-widget-changelang' ),
		'flags': ['primary']
	});

	// Attach ULS event call
	this.$button.$.uls( ulsParams );

	this.$.append( this.$button.$ );
};

/* Inheritance */

ve.inheritClass( ve.ui.LanguageInputWidget, ve.ui.Widget );

/* Methods */
/**
 * Get display element. This replaces the 'getInputElement'
 * of the InputWidget
 *
 * @method
 * @param {Object} [config] Config options
 * @returns {jQuery} span element
 */
ve.ui.LanguageInputWidget.prototype.getDisplayElement = function () {
	return this.$$( '<span>' );
};

/**
 * Set the value of the language display
 *
 * Overrides setValue to keep annotations in sync.
 *
 * @method
 * @param {string} value New value
 */
ve.ui.LanguageInputWidget.prototype.setValue = function ( value ) {
	// Keep annotation in sync with value
	if ( value === '' ) {
		this.annotation = null;
	} else {
		// Set up the annotation:
		this.setAnnotation( new ve.dm.LanguageAnnotation( {
			'type': 'language',
			'attributes': {
				'lang': value,
				'dir': $.uls.data.getDir( value )
			}
		} ) );
	}
};

/**
 * Get the value of the current annotation
 */
ve.ui.LanguageInputWidget.prototype.getValue = function () {
	// Specifically to be displayed
	return this.lang;
};
/**
 * Sets the annotation value.
 *
 * The input value will automatically be updated.
 *
 * @method
 * @param {ve.dm.LanguageAnnotation} annotation Language annotation
 * @chainable
 */
ve.ui.LanguageInputWidget.prototype.setAnnotation = function ( annotation ) {
	var langNameDisp = '';
	this.annotation = annotation;

	// Give precedence to dir value if it already exists:
	if ( annotation.element.attributes.dir ) {
		this.dir = annotation.element.attributes.dir;
	}

	// Set language according to currently set language
	// or leave blank if element has no language set
	if ( annotation.element.attributes.lang ) {
		this.lang = annotation.element.attributes.lang;
		// Take the full name of the language from its code:
		langNameDisp = $.uls.data.getAutonym( this.lang );
	} else {
		this.lang = '';
	}

	// If language exists, but dir is undefined/null,
	// fix the dir in terms of language:
	if ( this.lang && !this.dir ) {
		this.dir = $.uls.data.getDir( this.lang );
	}

	// Display the information in the table:
	this.$langCodeDisp.html( this.lang );
	this.$langNameDisp.html( langNameDisp );
	this.$dirDisp.html( this.dir );

	return this;
};

/**
 * Gets the annotation value.
 *
 * @method
 * @returns {ve.dm.LanguageAnnotation} Language annotation
 */
ve.ui.LanguageInputWidget.prototype.getAnnotation = function () {
	return this.annotation;
};

/**
 * Gets a target from an annotation.
 *
 * @method
 * @param {ve.dm.LanguageAnnotation} annotation Language annotation
 * @returns {string} Language
 */
ve.ui.LanguageInputWidget.prototype.getLanguageFromAnnotation = function ( annotation ) {
	if ( annotation instanceof ve.dm.LanguageAnnotation ) {
		return annotation.getAttribute( 'lang' );
	}
	return '';
};
