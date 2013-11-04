/*!
 * ObjectOriented UserInterface PopupTool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface popup tool.
 *
 * @abstract
 * @class
 * @extends OO.ui.Tool
 * @mixins OO.ui.PopuppableElement
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.PopupTool = function OoUiPopupTool( toolbar, config ) {
	// Parent constructor
	OO.ui.Tool.call( this, toolbar, config );

	// Mixin constructors
	OO.ui.PopuppableElement.call( this, config );

	// Initialization
	this.$element
		.addClass( 'oo-ui-popupTool' )
		.append( this.popup.$element );
};

/* Inheritance */

OO.inheritClass( OO.ui.PopupTool, OO.ui.Tool );

OO.mixinClass( OO.ui.PopupTool, OO.ui.PopuppableElement );

/* Methods */

/**
 * Handle the tool being selected.
 *
 * @inheritdoc
 */
OO.ui.PopupTool.prototype.onSelect = function () {
	if ( !this.disabled ) {
		if ( this.popup.isVisible() ) {
			this.hidePopup();
		} else {
			this.showPopup();
		}
	}
	this.setActive( false );
	return false;
};

/**
 * Handle the toolbar state being updated.
 *
 * @inheritdoc
 */
OO.ui.PopupTool.prototype.onUpdateState = function () {
	this.setActive( false );
};
