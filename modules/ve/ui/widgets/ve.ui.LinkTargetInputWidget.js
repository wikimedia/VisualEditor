/*!
 * VisualEditor UserInterface LinkTargetInputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LinkTargetInputWidget object.
 *
 * @class
 * @extends ve.ui.TextInputWidget
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.LinkTargetInputWidget = function VeUiLinkTargetInputWidget( config ) {
	// Parent constructor
	ve.ui.TextInputWidget.call( this, config );

	// Properties
	this.annotation = null;

	// Initialization
	this.$.addClass( 've-ui-linkTargetInputWidget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.LinkTargetInputWidget, ve.ui.TextInputWidget );

/* Methods */

/**
 * Set the value of the input.
 *
 * Overrides setValue to keep annotations in sync.
 *
 * @method
 * @param {string} value New value
 */
ve.ui.LinkTargetInputWidget.prototype.setValue = function ( value ) {
	// Keep annotation in sync with value
	value = this.sanitizeValue( value );
	if ( value === '' ) {
		this.annotation = null;
	} else {
		this.setAnnotation( new ve.dm.LinkAnnotation( { 'href': value } ) );
	}

	// Call parent method
	ve.ui.TextInputWidget.prototype.setValue.call( this, value );
};

/**
 * Sets the annotation value.
 *
 * The input value will automatically be updated.
 *
 * @method
 * @param {ve.dm.LinkAnnotation} annotation Link annotation
 * @chainable
 */
ve.ui.LinkTargetInputWidget.prototype.setAnnotation = function ( annotation ) {
	this.annotation = annotation;

	// Call parent method
	ve.ui.TextInputWidget.prototype.setValue.call(
		this, this.sanitizeValue( this.getTargetFromAnnotation( annotation ) )
	);

	return this;
};

/**
 * Gets the annotation value.
 *
 * @method
 * @returns {ve.dm.LinkAnnotation} Link annotation
 */
ve.ui.LinkTargetInputWidget.prototype.getAnnotation = function () {
	return this.annotation;
};

/**
 * Gets a target from an annotation.
 *
 * @method
 * @param {ve.dm.LinkAnnotation} annotation Link annotation
 * @returns {string} Target
 */
ve.ui.LinkTargetInputWidget.prototype.getTargetFromAnnotation = function ( annotation ) {
	if ( annotation instanceof ve.dm.LinkAnnotation ) {
		return annotation.data.href;
	}
	return '';
};
