/*!
 * VisualEditor UserInterface PopupWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.PopupWidget object.
 *
 * @class
 * @extends ve.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Config options
 */
ve.ui.PopupWidget = function VeUiPopupWidget( config ) {
	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.visible = false;
	this.$callout = $( '<div>' );
	this.$body = $( '<div>' );
	this.transitionTimeout = null;

	// Initialization
	this.$
		.addClass( 've-ui-popupWidget' )
		.append(
			this.$callout.addClass( 've-ui-popupWidget-callout' ),
			this.$body.addClass( 've-ui-popupWidget-body' )
		);
};

/* Inheritance */

ve.inheritClass( ve.ui.PopupWidget, ve.ui.Widget );

/* Methods */

/**
 * Show the context.
 *
 * @method
 * @chainable
 */
ve.ui.PopupWidget.prototype.show = function () {
	this.$.show();
	this.visible = true;

	return this;
};

/**
 * Hide the context.
 *
 * @method
 * @chainable
 */
ve.ui.PopupWidget.prototype.hide = function () {
	this.$.hide();
	this.visible = false;

	return this;
};

/**
 * Updates the position and size.
 *
 * @method
 * @chainable
 */
ve.ui.PopupWidget.prototype.display = function ( x, y, width, height, transition ) {
	var buffer = ( width / 2 ) + 20,
		center = -( width / 2 ),
		overlapRight = this.$$( 'body' ).width() - ( x + buffer ),
		overlapLeft = x - buffer;

	// Prevent viewport clipping
	if ( overlapRight < 0 ) {
		center += overlapRight;
	} else if ( overlapLeft < 0 ) {
		center -= overlapLeft;
	}

	// Prevent transition from being interrupted
	clearTimeout( this.transitionTimeout );
	if ( transition ) {
		// Enable transition
		this.$.addClass( 've-ui-popupWidget-transitioning' );
		// Prevent transitioning after transition is complete
		this.transitionTimeout = setTimeout( ve.bind( function () {
			this.$.removeClass( 've-ui-popupWidget-transitioning' );
		}, this ), 200 );
	} else {
		// Prevent transitioning immediately
		this.$.removeClass( 've-ui-popupWidget-transitioning' );
	}

	// Position body relative to anchor and adjust size
	this.$body.css( {
		'left': center, 'width': width, 'height': height === undefined ? 'auto' : height
	} );

	return this;
};
