/*!
 * ObjectOriented UserInterface FieldsetLayout class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Layout made of a fieldset and optional legend.
 *
 * @class
 * @extends OO.ui.Layout
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [icon] Symbolic icon name
 */
OO.ui.FieldsetLayout = function OoUiFieldsetLayout( config ) {
	// Config initialization
	config = config || {};

	// Parent constructor
	OO.ui.Layout.call( this, config );

	// Mixin constructors
	OO.ui.LabeledElement.call( this, this.$( '<legend>' ), config );

	// Initialization
	if ( config.icon ) {
		this.$element.addClass( 'oo-ui-fieldsetLayout-decorated' );
		this.$label.addClass( 'oo-ui-icon-' + config.icon );
	}
	this.$element.addClass( 'oo-ui-fieldsetLayout' );
	if ( config.icon || config.label ) {
		this.$element
			.addClass( 'oo-ui-fieldsetLayout-labeled' )
			.append( this.$label );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.FieldsetLayout, OO.ui.Layout );

OO.mixinClass( OO.ui.FieldsetLayout, OO.ui.LabeledElement );

/* Static Properties */

OO.ui.FieldsetLayout.static.tagName = 'fieldset';
