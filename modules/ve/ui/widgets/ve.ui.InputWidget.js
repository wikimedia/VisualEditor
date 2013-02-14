/*!
 * VisualEditor user interface InputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.InputWidget object.
 *
 * @abstract
 * @class
 * @constructor
 * @extends ve.ui.Widget
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {string} [type] HTML input type
 * @param {string} [name] HTML input name
 * @param {string} [value] Input value
 */
ve.ui.InputWidget = function VeUiInputWidget( $$, type, name, value ) {
	// Parent constructor
	ve.ui.Widget.call( this, $$ );

	// Properties
	this.$input = this.$$( '<input>' );
	this.value = this.sanitizeValue( value );
	this.readOnly = false;

	// Events
	this.$input.on(
		'keydown mouseup cut paste change input select', ve.bind( this.onInputChange, this )
	);

	// Initialization
	this.$input.attr( { 'type': type, 'name': name, 'value': value } );
	this.$
		.addClass( 've-ui-inputWidget' )
		.append( this.$input );
};

/* Inheritance */

ve.inheritClass( ve.ui.InputWidget, ve.ui.Widget );

/**
 * @event change
 * @param value
 * @param origin
 */

/* Methods */

/**
 * Handles potentially value-changing events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.InputWidget.prototype.onInputChange = function () {
	if ( !this.disabled ) {
		// Allow the stack to clear so the value will be updated
		setTimeout( ve.bind( function () {
			this.setValue( this.$input.val() );
		}, this ), 0 );
	}
};

/**
 * Gets the value of the input.
 *
 * @method
 * @returns {string} Input value
 */
ve.ui.InputWidget.prototype.getValue = function () {
	return this.value;
};

/**
 * Sets the value of the input.
 *
 * @method
 * @param {string} value New value
 * @param {string} [origin] Origin of change
 * @emits change
 */
ve.ui.InputWidget.prototype.setValue = function ( value, origin ) {
	var domValue = this.$input.val();
	value = this.sanitizeValue( value );
	if ( this.value !== value ) {
		this.value = value;
		// Only update the DOM if we must
		if ( domValue !== this.value ) {
			this.$input.val( this.value );
		}
		this.emit( 'change', this.value, origin );
	}
};

/**
 * Sanitize incoming value.
 *
 * @method
 * @param {string} value Original value
 * @returns {string} Sanitized value
 */
ve.ui.InputWidget.prototype.sanitizeValue = function ( value ) {
	return String( value );
};

/**
 * Check if the widget is read-only.
 *
 * @method
 * @param {boolean} Button is read-only
 */
ve.ui.InputWidget.prototype.isReadOnly = function () {
	return this.readOnly;
};

/**
 * Set the disabled state of the widget.
 *
 * This should probably change the widgets's appearance and prevent it from being used.
 *
 * @method
 * @param {boolean} state Disable button
 */
ve.ui.InputWidget.prototype.setReadOnly = function ( state ) {
	this.readOnly = !!state;
	this.$input.prop( 'readonly', this.readOnly );
};
