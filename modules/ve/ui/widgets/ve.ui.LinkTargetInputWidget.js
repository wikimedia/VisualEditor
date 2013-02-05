/*!
 * VisualEditor user interface LinkTargetInputWidget class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LinkTargetInputWidget object.
 *
 * @class
 * @constructor
 * @extends ve.ui.TextInputWidget
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {jQuery} $overlay DOM element to add menu to
 * @param {string} [name] Input name, used by HTML forms
 * @param {string} [value] Input value
 */
ve.ui.LinkTargetInputWidget = function VeUiLinkTargetInputWidget( $$, $overlay, name, value ) {
	// Parent constructor
	ve.ui.TextInputWidget.call( this, $$, name, value );

	// Properties
	this.annotation = null;

	// Events
	this.addListenerMethod( this, 'change', 'onChange' );

	// Initialization
	this.$.addClass( 've-ui-linkTargetInputWidget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.LinkTargetInputWidget, ve.ui.TextInputWidget );

/* Methods */

/**
 * Handles change events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.LinkTargetInputWidget.prototype.onChange = function ( value ) {
	if ( value === '' ) {
		this.annotation = null;
	} else {
		this.setAnnotation( new ve.dm.LinkAnnotation( { 'href': value } ) );
	}
};

/**
 * Sets the annotation value.
 *
 * The input value will automatically be updated.
 *
 * @method
 * @param {ve.dm.LinkAnnotation} annotation Link annotation
 */
ve.ui.LinkTargetInputWidget.prototype.setAnnotation = function ( annotation ) {
	this.annotation = annotation;
	this.setValue( this.getTargetFromAnnotation( annotation ), 'annotation' );
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
