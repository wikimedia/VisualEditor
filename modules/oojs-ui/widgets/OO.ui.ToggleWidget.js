/*!
 * ObjectOriented UserInterface ToggleWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.ToggleWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [value=false] Initial value
 * @cfg {string} [onLabel='On'] Label for on state
 * @cfg {string} [offLabel='Off'] Label for off state
 */
OO.ui.ToggleWidget = function OoUiToggleWidget( config ) {
	// Configuration initialization
	config = $.extend( {
		'onLabel': OO.ui.msg( 'ooui-toggle-on' ),
		'offLabel': OO.ui.msg( 'ooui-toggle-on' )
	}, config );

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Properties
	this.value = null;
	this.dragging = false;
	this.dragStart = null;
	this.sliding = false;
	this.$slide = this.$( '<span>' );
	this.$grip = this.$( '<span>' );
	this.$onLabel = this.$( '<span>' );
	this.$offLabel = this.$( '<span>' );
	this.onDocumentMouseMoveHandler = OO.ui.bind( this.onDocumentMouseMove, this );
	this.onDocumentMouseUpHandler = OO.ui.bind( this.onDocumentMouseUp, this );

	// Events
	this.$slide.on( 'mousedown', OO.ui.bind( this.onMouseDown, this ) );

	// Initialization
	this.$grip.addClass( 'oo-ui-toggleWidget-grip' );
	this.$onLabel
		.addClass( 'oo-ui-toggleWidget-label oo-ui-toggleWidget-label-on' )
		.text( config.onLabel || '' );
	this.$offLabel
		.addClass( 'oo-ui-toggleWidget-label oo-ui-toggleWidget-label-off' )
		.text( config.offLabel || '' );
	this.$slide
		.addClass( 'oo-ui-toggleWidget-slide' )
		.append( this.$onLabel, this.$offLabel, this.$grip );
	this.$element
		.addClass( 'oo-ui-toggleWidget' )
		.append( this.$slide );
	this.setValue( !!config.value );
};

/* Inheritance */

OO.inheritClass( OO.ui.ToggleWidget, OO.ui.Widget );

/* Events */

/**
 * @event change
 * @param {boolean} value Changed value
 */

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.ToggleWidget.prototype.onMouseDown = function ( e ) {
	if ( e.which === 1 ) {
		this.dragging = true;
		this.dragStart = e.pageX;
		this.$( this.$.context ).on( {
			'mousemove': this.onDocumentMouseMoveHandler,
			'mouseup': this.onDocumentMouseUpHandler
		} );
		this.$element.addClass( 'oo-ui-toggleWidget-dragging' );
		return false;
	}
};

/**
 * Handles document mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.ToggleWidget.prototype.onDocumentMouseUp = function ( e ) {
	var overlap, dragOffset;

	if ( e.which === 1 ) {
		this.$element.removeClass( 'oo-ui-toggleWidget-dragging' );

		if ( !this.sliding ) {
			this.setValue( !this.value );
		} else {
			this.$slide.css( 'margin-left', 0 );
			dragOffset = e.pageX - this.dragStart;
			overlap = this.$element.outerWidth() - this.$slide.outerWidth();
			if ( this.value ? overlap / 2 > dragOffset : -overlap / 2 < dragOffset ) {
				this.setValue( !this.value );
			}
		}
		this.dragging = false;
		this.sliding = false;
		this.$( this.$.context ).off( {
			'mousemove': this.onDocumentMouseMoveHandler,
			'mouseup': this.onDocumentMouseUpHandler
		} );
	}
};

/**
 * Handles document mouse move events.
 *
 * @method
 * @param {jQuery.Event} e Mouse move event
 */
OO.ui.ToggleWidget.prototype.onDocumentMouseMove = function ( e ) {
	var overlap, dragOffset, left;

	if ( this.dragging ) {
		dragOffset = e.pageX - this.dragStart;
		if ( dragOffset !== 0 || this.sliding ) {
			this.sliding = true;
			overlap = this.$element.outerWidth() - this.$slide.outerWidth();
			left = this.value ?
				Math.min( 0, Math.max( overlap, dragOffset ) ) :
				Math.min( -overlap, Math.max( 0, dragOffset ) );
			this.$slide.css( 'margin-left', left );
		}
	}
};

/**
 * Get the value of the toggle.
 *
 * @method
 * @returns {boolean} Toggle value
 */
OO.ui.ToggleWidget.prototype.getValue = function () {
	return this.value;
};

/**
 * Set the value of the toggle.
 *
 * @method
 * @param {boolean} value New value
 * @fires change
 * @chainable
 */
OO.ui.ToggleWidget.prototype.setValue = function ( value ) {
	if ( this.value !== value ) {
		this.value = value;
		this.$element
			.toggleClass( 'oo-ui-toggleWidget-on', value )
			.toggleClass( 'oo-ui-toggleWidget-off', !value );
		this.emit( 'change', this.value );
	}
	return this;
};
