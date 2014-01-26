/*!
 * VisualEditor UserInterface MediaSizeWidget class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Widget that lets the user edit dimensions (width and height),
 * optionally with a fixed aspect ratio.
 *
 * The widget is designed to work in one of two ways:
 * 1. Instantiated with size configuration already set up
 * 2. Instantiated empty, and size details added when the
 *    data is available.
 *
 * @class
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {number} [width] Initial width value
 * @cfg {number} [height] Initial heigh value
 * @cfg {Object} [originalDimensions] Original dimensions (width and height)
 * @cfg {Object} [maxDimensions] Maximum dimensions the user is not allowed to exceed
 */
ve.ui.MediaSizeWidget = function VeUiMediaSizeWidget( config ) {
	var heightLabel, widthLabel;

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Configuration
	config = config || {};

	this.width = config.width || '';
	this.height = config.height || '';
	this.originalDimensions = null;
	this.maxDimensions = null;

	// Cache for the aspect ratio, which is set by setOriginalDimensions()
	this.aspectRatio = null;

	// Validation
	this.valid = false;

	// Define dimension input widgets
	this.widthInput = new OO.ui.TextInputWidget( {
		'$': this.$
	} );
	this.heightInput = new OO.ui.TextInputWidget( {
		'$': this.$
	} );

	// Define dimension labels
	widthLabel = new OO.ui.InputLabelWidget( {
		'$': this.$,
		'input': this.widthInput,
		'label': ve.msg( 'visualeditor-mediasizewidget-label-width' )
	} );
	heightLabel = new OO.ui.InputLabelWidget( {
		'$': this.$,
		'input': this.heightInput,
		'label': ve.msg( 'visualeditor-mediasizewidget-label-height' )
	} );
	// Error label
	this.errorLabel = new OO.ui.InputLabelWidget( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-mediasizewidget-label-defaulterror' )
	} );

	// Define buttons
	this.originalDimensionsButton = new OO.ui.ButtonWidget( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-mediasizewidget-button-originaldimensions' )
	} );

	// Build the GUI
	this.$element.append( [
		this.$( '<div>' )
			.addClass( 've-ui-mediaSizeWidget-section-width' )
			.append( [
				widthLabel.$element,
				this.widthInput.$element
			] ),
		this.$( '<div>' )
			.addClass( 've-ui-mediaSizeWidget-section-height' )
			.append( [
				heightLabel.$element,
				this.heightInput.$element
			] ),
		this.$( '<div>' )
			.addClass( 've-ui-mediaSizeWidget-button-originalSize' )
			.append( this.originalDimensionsButton.$element ),
		this.$( '<div>' )
			.addClass( 've-ui-mediaSizeWidget-label-error' )
			.append( this.errorLabel.$element ),
	] );

	this.originalDimensionsButton.setDisabled( true );

	// Events
	this.originalDimensionsButton.connect( this, { 'click': 'onButtonOriginalDimensionsClick' } );

	this.widthInput.connect( this, { 'change': 'onWidthChange' } );
	this.heightInput.connect( this, { 'change': 'onHeightChange' } );

	// Initialization
	this.$element.addClass( 've-ui-mediaSizeWidget' );
	if ( config.originalDimensions ) {
		this.setOriginalDimensions( config.originalDimensions );
	}
	if ( config.maxDimensions ) {
		this.setMaxDimensions( config.maxDimensions );
	}
};

/* Inheritance */

OO.inheritClass( ve.ui.MediaSizeWidget, OO.ui.Widget );

/* Methods */

/**
 * Get the currently set rounded dimensions.
 *
 * @returns {Object} Current dimensions, rounded to integer values
 * @returns {number} return.width Width
 * @returns {number} return.height Height
 */
ve.ui.MediaSizeWidget.prototype.getDimensions = function () {
	return {
		'width': Number( this.widthInput.getValue() ),
		'height': Number( this.heightInput.getValue() )
	};
};

/**
 * Set the current width and height dimensions.
 * This method accepts either both values or a single value.
 *
 * In general, it is expected that the original dimensions will
 * be supplied before the current dimensions, but in case they
 * are not, several fallback options exist.
 *
 * The method will accept and handle either of the following:
 * 1. Both width/height dimensions are supplied:
 *    a. If original dimensions already set the inputs are filled
 *       in without calculation, trusting the verification method
 *       to notify the user in case there are errors.
 *    b. If original dimensions or aspectRatio are not set image
 *       will not be bound to aspect ratio.
 * 2. Only width or only height are supplied:
 *    a. If original dimensions are already set, the corresponding
 *       input value is calculated.
 *    b. If original dimensions and aspectRatio are not set, the
 *       corresponding value will not be updated.
 *
 * All raw values are catched internally for accurate calculations
 * and the values are rounded for display inside the inputs.
 *
 * @param {Object} dimensions Dimensions to set
 * @param {number} [dimensions.width] Width to set
 * @param {number} [dimensions.height] Height to set
 */
ve.ui.MediaSizeWidget.prototype.setDimensions = function ( dimensions ) {

	// Recursion protection
	if ( this.preventChangeRecursion ) {
		return;
	}

	this.preventChangeRecursion = true;

	if ( dimensions.width && dimensions.height ) {
		// If both dimensions are set up, use them directly
		this.width = dimensions.width;
		this.height = dimensions.height;
	} else if ( dimensions.width && !dimensions.height ) {
		// If only width is defined
		this.width = dimensions.width;
		if ( this.aspectRatio !== null ) {
			// If aspect ratio is available, calculate
			this.height = Math.round( this.width / this.getAspectRatio() );
		}
	} else if ( dimensions.height && !dimensions.width ) {
		// If only height is defined
		this.height = dimensions.height;
		if ( this.aspectRatio !== null ) {
			// If aspect ratio is available, calculate
			this.width = Math.round( this.height * this.getAspectRatio() );
		}
	}

	// This will only update if the value has changed
	this.widthInput.setValue( this.width );
	this.heightInput.setValue( this.height );

	// Check if we need to notify the user that the dimensions
	// have a problem
	this.validateDimensions();

	this.preventChangeRecursion = false;
};

/**
 * Get the height and width values of the maximum allowed dimensions, if set.
 *
 * @returns {Object} Maximum dimensions
 * @returns {number} [return.width] Maximum width, if set
 * @returns {number} [return.height] Maximum height, if set
 */
ve.ui.MediaSizeWidget.prototype.getMaxDimensions = function () {
	return this.originalDimensions;
};

/**
 * Set maximum width and/or height.
 * @param {Object} dimensions Maximum dimensions
 * @param {number} [dimensions.width] Maximum width
 * @param {number} [dimensions.height] Maximum height
 */
ve.ui.MediaSizeWidget.prototype.setMaxDimensions = function ( dimensions ) {
	this.maxDimensions = ve.copy( dimensions );
};

/**
 * Get the original dimensions of the image, if set.
 * @returns {Object} Original dimensions
 * @returns {number} [return.width] Original width, if set
 * @returns {number} [return.height] Original height, if set
 */
ve.ui.MediaSizeWidget.prototype.getOriginalDimensions = function () {
	return this.originalDimensions;
};

/**
 * Set the original dimensions and cache the aspect ratio.
 * @param {Object} dimensions Original dimensions
 * @param {number} dimensions.width Original width
 * @param {number} dimensions.height Original height
 */
ve.ui.MediaSizeWidget.prototype.setOriginalDimensions = function ( dimensions ) {
	this.originalDimensions = ve.copy( dimensions );
	// Cache the aspect ratio
	this.aspectRatio = this.originalDimensions.width / this.originalDimensions.height;
	// Enable the 'original dimensions' button
	this.originalDimensionsButton.setDisabled( false );
};

/**
 * Explicitly set the aspect ratio, overriding what setOriginalDimensions() computed.
 * @param {number} ratio Aspect ratio (width/height)
 */
ve.ui.MediaSizeWidget.prototype.setAspectRatio = function ( ratio ) {
	this.aspectRatio = ratio;
};

/**
 * Retrieve the aspect ratio. This is only known if set through setAspectRatio() or
 * computed by setOriginalDimensions().
 *
 * @returns {number|null} Aspect ratio (width/height)
 */
ve.ui.MediaSizeWidget.prototype.getAspectRatio = function () {
	return this.aspectRatio;
};

/**
 * Checks whether the input values are valid. If the inputs are
 * not valid, an error class will be added to the inputs.
 */
ve.ui.MediaSizeWidget.prototype.validateDimensions = function () {

	// Check for an error in the values
	if (
		!$.isNumeric( this.width ) ||
		!$.isNumeric( this.height ) ||
		Number( this.width ) <= 0 ||
		Number( this.height ) <= 0 ||
		// Check if the size exceeds max dimensions,
		// but only if the maxDimensions are set
		// TODO use a separate error message for this case,
		// and put the max dimensions in the error message
		(
			this.maxDimensions &&
			$.isNumeric( this.maxDimensions.width ) &&
			Number( this.width ) > this.maxDimensions.width
		) || (
			this.maxDimensions &&
			$.isNumeric( this.maxDimensions.height ) &&
			Number( this.height ) > this.maxDimensions.height
		)
	) {
		this.valid = false;
		// Show error message
		this.errorLabel.$element.show();
	} else {
		this.valid = true;
		// Hide the error message
		this.errorLabel.$element.hide();
	}

	// Add or remove the error class
	this.$element.toggleClass( 've-ui-mediaSizeWidget-input-hasError', !this.valid );
};

/**
 * Respond to a change in the width input.
 */
ve.ui.MediaSizeWidget.prototype.onWidthChange = function () {
	var val = this.widthInput.getValue();
	if ( $.isNumeric( val ) ) {
		// Calculate and update the corresponding value
		this.setDimensions( { 'width': val } );
	} else {
		this.width = val;
		// We didn't perform an actual change, but we should still validate
		// the input values
		this.validateDimensions();
	}
};

/**
 * Respond to a change in the height input.
 */
ve.ui.MediaSizeWidget.prototype.onHeightChange = function () {
	var val = this.heightInput.getValue();
	if ( $.isNumeric( val ) ) {
		// Calculate and update the corresponding value
		this.setDimensions( { 'height': val } );
	} else {
		this.height = val;
		// We didn't perform an actual change, but we should still validate
		// the input values
		this.validateDimensions();
	}
};

/**
 * Set the width/height values to the original media dimensions
 *
 * @param {jQuery.Event} e Click event
 */
ve.ui.MediaSizeWidget.prototype.onButtonOriginalDimensionsClick = function () {
	this.setDimensions( this.originalDimensions );
};

/**
 * Checks whether there is an error with the widget
 * @returns {boolean} Values are valid
 */
ve.ui.MediaSizeWidget.prototype.isValid = function () {
	return this.valid;
};

/**
 * Clear all values.
 * This is useful to update the widget values between different
 * images that have other dimensions or restrictions while the
 * widget is already instantiated.
 */
ve.ui.MediaSizeWidget.prototype.clear = function () {
	this.aspectRatio = null;
	this.originalDimensions = {};
	this.maxDimensions = {};
	this.width = '';
	this.height = '';
};
