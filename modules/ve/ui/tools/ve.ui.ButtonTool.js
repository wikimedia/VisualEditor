/**
 * VisualEditor user interface ButtonTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.ButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.Tool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param title
 */
ve.ui.ButtonTool = function VeUiButtonTool( toolbar, name, title ) {
	// Parent constructor
	ve.ui.Tool.call( this, toolbar, name, title );

	if ( !name ) {
		return;
	}

	// Properties
	this.$.addClass( 've-ui-toolbarButtonTool ve-ui-toolbarButtonTool-' + name );

	// Events
	var tool = this;
	tool.$.on( {
		'mousedown': function ( e ) {
			if ( e.which === 1 ) {
				e.preventDefault();
				return false;
			}
		},
		'mouseup': function ( e ) {
			if ( e.which === 1 ) {
				tool.onClick( e );
			}
		}
	} );
};

/* Inheritance */

ve.inheritClass( ve.ui.ButtonTool, ve.ui.Tool );

/* Methods */

ve.ui.ButtonTool.prototype.onClick = function () {
	throw new Error( 'ButtonTool.onClick not implemented in this subclass:' + this.constructor );
};

ve.ui.ButtonTool.prototype.updateEnabled = function () {
	if ( this.enabled ) {
		this.$.removeClass( 've-ui-toolbarButtonTool-disabled' );
	} else {
		this.$.addClass( 've-ui-toolbarButtonTool-disabled' );
	}
};
