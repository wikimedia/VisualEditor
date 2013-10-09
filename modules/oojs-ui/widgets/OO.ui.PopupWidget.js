/*!
 * ObjectOriented UserInterface PopupWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.PopupWidget object.
 *
 * @class
 * @extends OO.ui.Widget
 * @mixins OO.ui.LabeledElement
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
OO.ui.PopupWidget = function OoUiPopupWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$$( '<div>' ), config );

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
	this.closeButton = new OO.ui.IconButtonWidget( { '$$': this.$$, 'icon': 'close' } );
	this.onMouseDownHandler = OO.ui.bind( this.onMouseDown, this );

	// Events
	this.closeButton.connect( this, { 'click': 'onCloseButtonClick' } );

	// Initialization
	this.useTail( config.tail !== undefined ? !!config.tail : true );
	this.$body.addClass( 'oo-ui-popupWidget-body' );
	this.$tail.addClass( 'oo-ui-popupWidget-tail' );
	this.$head
		.addClass( 'oo-ui-popupWidget-head' )
		.append( this.$label, this.closeButton.$ );
	if ( !config.head ) {
		this.$head.hide();
	}
	this.$popup
		.addClass( 'oo-ui-popupWidget-popup' )
		.append( this.$head, this.$body );
	this.$.hide()
		.addClass( 'oo-ui-popupWidget' )
		.append( this.$popup, this.$tail );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.PopupWidget, OO.ui.LabeledElement );

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
OO.ui.PopupWidget.prototype.onMouseDown = function ( e ) {
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
OO.ui.PopupWidget.prototype.bindMouseDownListener = function () {
	// Capture clicks outside popup
	this.getElementWindow().addEventListener( 'mousedown', this.onMouseDownHandler, true );
};

/**
 * Handles close button click events.
 *
 * @method
 */
OO.ui.PopupWidget.prototype.onCloseButtonClick = function () {
	if ( this.visible ) {
		this.hide();
	}
};

/**
 * Unbind mouse down listener
 *
 * @method
 */
OO.ui.PopupWidget.prototype.unbindMouseDownListener = function () {
	this.getElementWindow().removeEventListener( 'mousedown', this.onMouseDownHandler, true );
};

/**
 * Check if the popup is visible.
 *
 * @method
 * @returns {boolean} Popup is visible
 */
OO.ui.PopupWidget.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Set whether to show a tail.
 *
 * @method
 * @returns {boolean} Make tail visible
 */
OO.ui.PopupWidget.prototype.useTail = function ( value ) {
	value = !!value;
	if ( this.tail !== value ) {
		this.tail = value;
		if ( value ) {
			this.$.addClass( 'oo-ui-popupWidget-tailed' );
		} else {
			this.$.removeClass( 'oo-ui-popupWidget-tailed' );
		}
	}
};

/**
 * Check if showing a tail.
 *
 * @method
 * @returns {boolean} tail is visible
 */
OO.ui.PopupWidget.prototype.hasTail = function () {
	return this.tail;
};

/**
 * Show the context.
 *
 * @method
 * @fires show
 * @chainable
 */
OO.ui.PopupWidget.prototype.show = function () {
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
 * @fires hide
 * @chainable
 */
OO.ui.PopupWidget.prototype.hide = function () {
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
OO.ui.PopupWidget.prototype.display = function ( width, height, transition ) {
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
		this.$.addClass( 'oo-ui-popupWidget-transitioning' );
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
		this.transitionTimeout = setTimeout( OO.ui.bind( function () {
			this.$.removeClass( 'oo-ui-popupWidget-transitioning' );
		}, this ), 200 );
	} else {
		// Prevent transitioning immediately
		this.$.removeClass( 'oo-ui-popupWidget-transitioning' );
	}

	return this;
};
