/*!
 * VisualEditor UserInterface LinkInspector class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Link inspector.
 *
 * @class
 * @extends ve.ui.AnnotationInspector
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.LinkInspector = function VeUiLinkInspector( surface, config ) {
	// Parent constructor
	ve.ui.AnnotationInspector.call( this, surface, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.LinkInspector, ve.ui.AnnotationInspector );

/* Static properties */

ve.ui.LinkInspector.static.icon = 'link';

ve.ui.LinkInspector.static.titleMessage = 'visualeditor-linkinspector-title';

ve.ui.LinkInspector.static.linkTargetInputWidget = ve.ui.LinkTargetInputWidget;

/**
 * Annotation models this inspector can edit.
 *
 * @static
 * @property {Function[]}
 */
ve.ui.LinkInspector.static.modelClasses = [ ve.dm.LinkAnnotation ];

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.AnnotationInspector.prototype.initialize.call( this );

	// Properties
	this.targetInput = new this.constructor.static.linkTargetInputWidget( {
		'$$': this.frame.$$, '$overlay': this.surface.$localOverlayMenus
	} );

	// Initialization
	this.$form.append( this.targetInput.$ );
};

/**
 * Handle the inspector being opened.
 */
ve.ui.LinkInspector.prototype.onOpen = function () {
	// Parent method
	ve.ui.AnnotationInspector.prototype.onOpen.call( this );

	// Wait for animation to complete
	this.surface.disable();
	setTimeout( ve.bind( function () {
		// Note: Focus input prior to setting target annotation
		this.targetInput.$input.focus();
		// Setup annotation
		this.targetInput.setAnnotation( this.initialAnnotation );
		this.targetInput.$input.select();
		this.surface.enable();
	}, this ), 200 );
};

/**
 * @inheritdoc
 */
ve.ui.LinkInspector.prototype.getAnnotationFromText = function ( text ) {
	return new ve.dm.LinkAnnotation( { 'type': 'link', 'attributes': { 'href': text } } );
};

/* Registration */

ve.ui.inspectorFactory.register( 'link', ve.ui.LinkInspector );
