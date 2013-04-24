/*!
 * VisualEditor UserInterface PagePanelLayout class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Page panel layout.
 *
 * @class
 * @extends ve.ui.PanelLayout
 * @mixins ve.ui.LabeledElement
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {string} [icon=''] Symbolic icon name
 */
ve.ui.PagePanelLayout = function VeUiPagePanelLayout( config ) {
	// Config initialization
	config = ve.extendObject( config, { 'scroll': true } );

	// Parent constructor
	ve.ui.PanelLayout.call( this, config );

	// Mixin constructors
	ve.ui.LabeledElement.call( this, this.$$( '<div>' ), config );

	// Properties
	this.icon = config.icon;

	// Initialization
	this.$label.addClass( 've-ui-icon-' + config.icon + '-big' );
	this.$.append( this.$label ).addClass( 've-ui-editorPanelLayout' );
};

/* Inheritance */

ve.inheritClass( ve.ui.PagePanelLayout, ve.ui.PanelLayout );

ve.mixinClass( ve.ui.PagePanelLayout, ve.ui.LabeledElement );

/* Methods */

ve.ui.PagePanelLayout.prototype.getIcon = function () {
	return this.icon;
};
