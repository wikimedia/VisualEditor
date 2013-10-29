/*!
 * ObjectOriented UserInterface TextInputMenuWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.TextInputMenuWidget object.
 *
 * @class
 * @extends OO.ui.MenuWidget
 *
 * @constructor
 * @param {OO.ui.TextInputWidget} input Text input widget to provide menu for
 * @param {Object} [config] Configuration options
 * @cfg {jQuery} [$container=input.$] Element to render menu under
 */
OO.ui.TextInputMenuWidget = function OoUiTextInputMenuWidget( input, config ) {
	// Parent constructor
	OO.ui.MenuWidget.call( this, config );

	// Properties
	this.input = input;
	this.$container = config.$container || this.input.$;
	this.onWindowResizeHandler = OO.ui.bind( this.onWindowResize, this );

	// Initialization
	this.$.addClass( 'oo-ui-textInputMenuWidget' );
};

/* Inheritance */

OO.inheritClass( OO.ui.TextInputMenuWidget, OO.ui.MenuWidget );

/* Methods */

/**
 * Handle window resize event.
 *
 * @method
 * @param {jQuery.Event} e Window resize event
 */
OO.ui.TextInputMenuWidget.prototype.onWindowResize = function () {
	this.position();
};

/**
 * Shows the menu.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputMenuWidget.prototype.show = function () {
	// Parent method
	OO.ui.MenuWidget.prototype.show.call( this );

	this.position();
	$( this.getElementWindow() ).on( 'resize', this.onWindowResizeHandler );
	return this;
};

/**
 * Hides the menu.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputMenuWidget.prototype.hide = function () {
	// Parent method
	OO.ui.MenuWidget.prototype.hide.call( this );

	$( this.getElementWindow() ).off( 'resize', this.onWindowResizeHandler );
	return this;
};

/**
 * Positions the menu.
 *
 * @method
 * @chainable
 */
OO.ui.TextInputMenuWidget.prototype.position = function () {
	var frameOffset,
		$container = this.$container,
		dimensions = $container.offset();

	// Position under input
	dimensions.top += $container.height();
	dimensions.width = $container.width();

	// Compensate for frame position if in a differnt frame
	if ( this.input.$$.frame && this.input.$$.context !== this.$[0].ownerDocument ) {
		frameOffset = OO.ui.Element.getRelativePosition(
			this.input.$$.frame.$, this.$.offsetParent()
		);
		dimensions.left += frameOffset.left;
		dimensions.top += frameOffset.top;
	} else {
		// Fix for RTL (for some reason, no need to fix if the frameoffset is set)
		if ( this.$.css( 'direction' ) === 'rtl' ) {
			dimensions.right = this.$.parent().position().left - dimensions.width - dimensions.left;
			// Erase the value for 'left':
			delete dimensions.left;
		}
	}

	this.$.css( dimensions );
	return this;
};
