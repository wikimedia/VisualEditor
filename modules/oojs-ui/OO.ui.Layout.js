/*!
 * ObjectOriented UserInterface Layout class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Container for elements.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixin OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.Layout = function OoUiLayout( config ) {
	// Initialize config
	config = config || {};

	// Parent constructor
	OO.ui.Element.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Initialization
	this.$element.addClass( 'oo-ui-layout' );
};

/* Inheritance */

OO.inheritClass( OO.ui.Layout, OO.ui.Element );

OO.mixinClass( OO.ui.Layout, OO.EventEmitter );
