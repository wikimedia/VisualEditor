/*!
 * ObjectOriented UserInterface OptionWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.OptionWidget object.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Mixed} data Option data
 * @param {Object} [config] Configuration options
 * @cfg {jQuery|string} [label] Option label
 * @cfg {string} [icon] Symbolic name of icon
 * @cfg {boolean} [selected=false] Select option
 * @cfg {boolean} [highlighted=false] Highlight option
 * @cfg {string} [rel] Value for `rel` attribute in DOM, allowing per-option styling
 */
OO.ui.OptionWidget = function OoUiOptionWidget( data, config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$$( '<span>' ), config );

	// Properties
	this.data = data;
	this.selected = false;
	this.highlighted = false;

	// Initialization
	this.$
		.data( 'oo-ui-optionWidget', this )
		.attr( 'rel', config.rel )
		.addClass( 'oo-ui-optionWidget' )
		.append( this.$label );
	this.setSelected( config.selected );
	this.setHighlighted( config.highlighted );

	// Options
	if ( config.icon ) {
		this.$icon = this.$$( '<div>' )
			.addClass( 'oo-ui-optionWidget-icon oo-ui-icon-' + config.icon )
			.appendTo( this.$ );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.OptionWidget, OO.ui.Widget );

OO.mixinClass( OO.ui.OptionWidget, OO.ui.LabeledElement );

/* Static Properties */

OO.ui.OptionWidget.static.tagName = 'li';

OO.ui.OptionWidget.static.selectable = true;

OO.ui.OptionWidget.static.highlightable = true;

OO.ui.OptionWidget.static.scrollIntoViewOnSelect = false;

/* Methods */

/**
 * Check if option can be selected.
 *
 * @method
 * @returns {boolean} Item is selectable
 */
OO.ui.OptionWidget.prototype.isSelectable = function () {
	return this.constructor.static.selectable && !this.disabled;
};

/**
 * Check if option can be highlighted.
 *
 * @method
 * @returns {boolean} Item is highlightable
 */
OO.ui.OptionWidget.prototype.isHighlightable = function () {
	return this.constructor.static.highlightable && !this.disabled;
};

/**
 * Check if option is selected.
 *
 * @method
 * @returns {boolean} Item is selected
 */
OO.ui.OptionWidget.prototype.isSelected = function () {
	return this.selected;
};

/**
 * Check if option is highlighted.
 *
 * @method
 * @returns {boolean} Item is highlighted
 */
OO.ui.OptionWidget.prototype.isHighlighted = function () {
	return this.highlighted;
};

/**
 * Set selected state.
 *
 * @method
 * @param {boolean} [state=false] Select option
 * @chainable
 */
OO.ui.OptionWidget.prototype.setSelected = function ( state ) {
	if ( !this.disabled && this.constructor.static.selectable ) {
		this.selected = !!state;
		if ( this.selected ) {
			this.$.addClass( 'oo-ui-optionWidget-selected' );
			if ( this.constructor.static.scrollIntoViewOnSelect ) {
				this.scrollElementIntoView();
			}
		} else {
			this.$.removeClass( 'oo-ui-optionWidget-selected' );
		}
	}
	return this;
};

/**
 * Set highlighted state.
 *
 * @method
 * @param {boolean} [state=false] Highlight option
 * @chainable
 */
OO.ui.OptionWidget.prototype.setHighlighted = function ( state ) {
	if ( !this.disabled && this.constructor.static.highlightable ) {
		this.highlighted = !!state;
		if ( this.highlighted ) {
			this.$.addClass( 'oo-ui-optionWidget-highlighted' );
		} else {
			this.$.removeClass( 'oo-ui-optionWidget-highlighted' );
		}
	}
	return this;
};

/**
 * Make the option's highlight flash.
 *
 * @method
 * @param {Function} [done] Callback to execute when flash effect is complete.
 */
OO.ui.OptionWidget.prototype.flash = function ( done ) {
	var $this = this.$;

	if ( !this.disabled && this.constructor.static.highlightable ) {
		$this.removeClass( 'oo-ui-optionWidget-highlighted' );
		setTimeout( OO.ui.bind( function () {
			$this.addClass( 'oo-ui-optionWidget-highlighted' );
			if ( done ) {
				setTimeout( done, 100 );
			}
		}, this ), 100 );
	}
};

/**
 * Get option data.
 *
 * @method
 * @returns {Mixed} Option data
 */
OO.ui.OptionWidget.prototype.getData = function () {
	return this.data;
};
