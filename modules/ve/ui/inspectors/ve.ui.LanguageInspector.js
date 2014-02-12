/*!
 * VisualEditor UserInterface LanguageInspector class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Language inspector.
 *
 * @class
 * @extends ve.ui.AnnotationInspector
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this inspector is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.LanguageInspector = function VeUiLanguageInspector( windowSet, config ) {
	// Parent constructor
	ve.ui.AnnotationInspector.call( this, windowSet, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.LanguageInspector, ve.ui.AnnotationInspector );

/* Static properties */

ve.ui.LanguageInspector.static.name = 'language';

ve.ui.LanguageInspector.static.icon = 'language';

ve.ui.LanguageInspector.static.title =
	OO.ui.deferMsg( 'visualeditor-languageinspector-title' );

ve.ui.LanguageInspector.static.languageInputWidget = ve.ui.LanguageInputWidget;

ve.ui.LanguageInspector.static.modelClasses = [ ve.dm.LanguageAnnotation ];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.LanguageInspector.prototype.getAnnotation = function () {
	return this.languageInput.getAnnotation();
};

/**
 * @inheritdoc
 */
ve.ui.LanguageInspector.prototype.getAnnotationFromFragment = function ( fragment ) {
	var offset = fragment.getRange( true ).start,
		node = this.surface.getView().documentView.getNodeFromOffset( offset ),
		attr = {};

	// Set initial parameters according to parent of the DOM object.
	// This will be called only if the annotation doesn't already exist, setting the default value
	// as the current language/dir of the selected text.
	if ( node ) {
		attr.lang = node.$element.closest( '[lang]' ).attr( 'lang' );
		attr.dir = node.$element.css( 'direction' );
	}

	if ( !attr.lang ) {
		// This means there was no lang/dir defined anywhere. Get the default en/ltr:
		attr.lang = 'en';
		attr.dir = 'ltr';
	}

	return new ve.dm.LanguageAnnotation( { 'type': 'meta/language', 'attributes': attr } );
};

/**
 * @inheritdoc
 */
ve.ui.LanguageInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.AnnotationInspector.prototype.initialize.call( this );

	// Properties
	this.languageInput = new this.constructor.static.languageInputWidget( {
		'$': this.$, '$overlay': this.surface.$localOverlay
	} );

	// Initialization
	this.$form.append( this.languageInput.$element );
};

/**
 * @inheritdoc
 */
ve.ui.LanguageInspector.prototype.setup = function ( data ) {
	// Parent method
	ve.ui.AnnotationInspector.prototype.setup.call( this, data );

	this.languageInput.setAnnotation( this.initialAnnotation );
};

/* Registration */

ve.ui.inspectorFactory.register( ve.ui.LanguageInspector );
