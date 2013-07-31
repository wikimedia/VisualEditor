/*!
 * VisualEditor UserInterface LanguageInspector class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Language inspector.
 *
 * @class
 * @extends ve.ui.AnnotationInspector
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.LanguageInspector = function VeUiLanguageInspector( surface, config ) {
	// Parent constructor
	ve.ui.AnnotationInspector.call( this, surface, config );

	this.initLang = '';
	this.initDir = '';
};

/* Inheritance */

ve.inheritClass( ve.ui.LanguageInspector, ve.ui.AnnotationInspector );

/* Static properties */

ve.ui.LanguageInspector.static.icon = 'language';

ve.ui.LanguageInspector.static.titleMessage = 'visualeditor-languageinspector-title';

/**
 * Annotation models this inspector can edit.
 *
 * @static
 * @property {Function[]}
 */
ve.ui.LanguageInspector.static.modelClasses = [ ve.dm.LanguageAnnotation ];

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.LanguageInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.AnnotationInspector.prototype.initialize.call( this );

	// Properties
	this.targetInput = new ve.ui.LanguageInputWidget( {
		'$$': this.frame.$$, '$overlay': this.surface.$localOverlay
	} );

	// Initialization
	this.$form.append( this.targetInput.$ );
};

/**
 * Handle the inspector being opened.
 */
ve.ui.LanguageInspector.prototype.onOpen = function () {
	// Parent method
	ve.ui.AnnotationInspector.prototype.onOpen.call( this );

	// Wait for animation to complete
	setTimeout( ve.bind( function () {
		// Setup annotation
		this.targetInput.setAnnotation( this.initialAnnotation );
	}, this ), 200 );
};
/**
 * Handle the inspector being setup.
 * Make sure the initial language and direction are set by the parent of the DOM
 * element of the selected fragment before the rest of the onSetup method is
 * processed by the parent ve.ui.AnnotationInspector
 */
ve.ui.LanguageInspector.prototype.onSetup = function () {
	var fragDOM,
		fragment = this.surface.getModel().getFragment( null, true );

	// Get the fragment documentView object (the real DOM object):
	fragDOM = this.surface.getView().documentView.getNodeFromOffset( fragment.getRange( true ).start );

	// Set initial parameters according to parent of the DOM object.
	// This will be called only if the annotation doesn't already exist, setting
	// the default value as the current language/dir of the selected text.
	if ( fragDOM ) {
		this.initLang = fragDOM.$.closest('[lang]').attr('lang') || 'en';
		this.initDir = fragDOM.$.closest('[dir]').css('direction') || 'ltr';
	}

	// Parent method
	ve.ui.AnnotationInspector.prototype.onSetup.call( this );
};
/**
 * @inheritdoc
 */
ve.ui.LanguageInspector.prototype.getAnnotationFromText = function () {
	return new ve.dm.LanguageAnnotation( {
		'type': 'language',
		'attributes': {
			'lang': this.initLang,
			'dir': this.initDir
		}
	} );
};

/* Registration */

ve.ui.inspectorFactory.register( 'language', ve.ui.LanguageInspector );
