/*!
 * VisualEditor UserInterface FieldsetLayout class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Fieldset layout.
 *
 * @class
 * @extends ve.ui.Layout
 * @mixins ve.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {string} [icon=''] Symbolic icon name
 */
ve.ui.FieldsetLayout = function VeUiFieldsetLayout( config ) {
	// Config initialization
	config = ve.extendObject( { 'icon': 'window' }, config );

	// Parent constructor
	ve.ui.Layout.call( this, config );

	// Mixin constructors
	ve.ui.LabeledElement.call( this, this.$$( '<legend>' ), config );

	// Initialization
	this.$label.addClass( 've-ui-icon-' + config.icon );
	this.$.append( this.$label ).addClass( 've-ui-fieldsetLayout' );
};

/* Inheritance */

ve.inheritClass( ve.ui.FieldsetLayout, ve.ui.Layout );

ve.mixinClass( ve.ui.FieldsetLayout, ve.ui.LabeledElement );

/* Static Properties */

ve.ui.FieldsetLayout.static.tagName = 'fieldset';
