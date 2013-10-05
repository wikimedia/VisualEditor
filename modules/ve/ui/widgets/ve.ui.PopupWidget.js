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
 * @mixins ve.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [tail=true] Show tail pointing to origin of popup
 * @cfg {string} [align='center'] Alignment of popup to origin
 * @cfg {jQuery} [$container] Container to prevent popup from rendering outside of
 * @cfg {boolean} [autoClose=false] Popup auto-closes when it loses focus
 * @cfg {jQuery} [$autoCloseIgnore] Elements to not auto close when clicked
 * @cfg {boolean} [head] Show label and close button at the top
 */
ve.ui.PopupWidget = function VeUiPopupWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Mixin constructors
	ve.ui.LabeledElement.call( this, this.$$( '<div>' ), config );

	// Properties
	this.visible = false;
	this.$popup = this.$$( '<div>' );
	this.$head = this.$$( '<div>' );
	this.$body = this.$$( '<div>' );
	this.$tail = this.$$( '<div>' );
	this.$container = config.$container || this.$$( 'body' );
	this.autoClose = !!config.autoClose;
	this.$autoCloseIgnore = config.$autoCloseIgnore;
	this.transitionTimeout = null;
	this.tail = false;
	this.align = config.align || 'center';
	this.closeButton = new ve.ui.IconButtonWidget( { '$$': this.$$, 'icon': 'close' } );
	this.onMouseDownHandler = ve.bind( this.onMouseDown, this );

	// Events
	this.closeButton.connect( this, { 'click': 'onCloseButtonClick' } );

	// Initialization
	this.useTail( config.tail !== undefined ? !!config.tail : true );
	this.$body.addClass( 've-ui-popupWidget-body' );
	this.$tail.addClass( 've-ui-popupWidget-tail' );
	this.$head
		.addClass( 've-ui-popupWidget-head' )
		.append( this.$label, this.closeButton.$ );
	if ( !config.head ) {
		this.$head.hide();
	}
	this.$popup
		.addClass( 've-ui-popupWidget-popup' )
		.append( this.$head, this.$body );
	this.$.hide()
		.addClass( 've-ui-popupWidget' )
		.append( this.$popup, this.$tail );
};

/* Inheritance */

ve.inheritClass( ve.ui.PopupWidget, ve.ui.Widget );

ve.mixinClass( ve.ui.PopupWidget, ve.ui.LabeledElement );

/* Events */

/**
 * @event hide
 */

/**
 * @event show
 */

/* Methods */

/**
 * Handles mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
ve.ui.PopupWidget.prototype.onMouseDown = function ( e ) {
	if (
		this.visible &&
		!$.contains( this.$[0], e.target ) &&
		( !this.$autoCloseIgnore || !this.$autoCloseIgnore.has( e.target ).length )
	) {
		this.hide();
	}
};

/**
 * Bind mouse down listener
 *
 * @method
 */
ve.ui.PopupWidget.prototype.bindMouseDownListener = function () {
	// Capture clicks outside popup
	this.getElementWindow().addEventListener( 'mousedown', this.onMouseDownHandler, true );
};

/**
 * Handles close button click events.
 *
 * @method
 */
ve.ui.PopupWidget.prototype.onCloseButtonClick = function () {
	if ( this.visible ) {
		this.hide();
	}
};

/**
 * Unbind mouse down listener
 *
 * @method
 */
ve.ui.PopupWidget.prototype.unbindMouseDownListener = function () {
	this.getElementWindow().removeEventListener( 'mousedown', this.onMouseDownHandler, true );
};

/**
 * Check if the popup is visible.
 *
 * @method
 * @returns {boolean} Popup is visible
 */
ve.ui.PopupWidget.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Set whether to show a tail.
 *
 * @method
 * @returns {boolean} Make tail visible
 */
ve.ui.PopupWidget.prototype.useTail = function ( value ) {
	value = !!value;
	if ( this.tail !== value ) {
		this.tail = value;
		if ( value ) {
			this.$.addClass( 've-ui-popupWidget-tailed' );
		} else {
			this.$.removeClass( 've-ui-popupWidget-tailed' );
		}
	}
};

/**
 * Check if showing a tail.
 *
 * @method
 * @returns {boolean} tail is visible
 */
ve.ui.PopupWidget.prototype.hasTail = function () {
	return this.tail;
};

/**
 * Show the context.
 *
 * @method
 * @emits show
 * @chainable
 */
ve.ui.PopupWidget.prototype.show = function () {
	if ( !this.visible ) {
		this.$.show();
		this.visible = true;
		this.emit( 'show' );
		if ( this.autoClose ) {
			this.bindMouseDownListener();
		}
	}
	return this;
};

/**
 * Hide the context.
 *
 * @method
 * @emits hide
 * @chainable
 */
ve.ui.PopupWidget.prototype.hide = function () {
	if ( this.visible ) {
		this.$.hide();
		this.visible = false;
		this.emit( 'hide' );
		if ( this.autoClose ) {
			this.unbindMouseDownListener();
		}
	}
	return this;
};

/**
 * Updates the position and size.
 *
 * @method
 * @param {number} width Width
 * @param {number} height Height
 * @param {boolean} [transition=false] Use a smooth transition
 * @chainable
 */
ve.ui.PopupWidget.prototype.display = function ( width, height, transition ) {
	var padding = 10,
		originOffset = Math.round( this.$.offset().left ),
		containerLeft = Math.round( this.$container.offset().left ),
		containerWidth = this.$container.innerWidth(),
		containerRight = containerLeft + containerWidth,
		popupOffset = width * ( { 'left': 0, 'center': -0.5, 'right': -1 } )[this.align],
		popupLeft = popupOffset - padding,
		popupRight = popupOffset + padding + width + padding,
		overlapLeft = ( originOffset + popupLeft ) - containerLeft,
		overlapRight = containerRight - ( originOffset + popupRight );

	// Prevent transition from being interrupted
	clearTimeout( this.transitionTimeout );
	if ( transition ) {
		// Enable transition
		this.$.addClass( 've-ui-popupWidget-transitioning' );
	}

	if ( overlapRight < 0 ) {
		popupOffset += overlapRight;
	} else if ( overlapLeft < 0 ) {
		popupOffset -= overlapLeft;
	}

	// Position body relative to anchor and resize
	this.$popup.css( {
		'left': popupOffset,
		'width': width,
		'height': height === undefined ? 'auto' : height
	} );

	if ( transition ) {
		// Prevent transitioning after transition is complete
		this.transitionTimeout = setTimeout( ve.bind( function () {
			this.$.removeClass( 've-ui-popupWidget-transitioning' );
		}, this ), 200 );
	} else {
		// Prevent transitioning immediately
		this.$.removeClass( 've-ui-popupWidget-transitioning' );
	}

	return this;
};
