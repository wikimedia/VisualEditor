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
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
ve.ui.ButtonTool = function ( toolbar, name, title ) {
	// Inheritance
	ve.ui.Tool.call( this, toolbar, name, title );

	if ( !name ) {
		return;
	}

	// Properties
	this.$.addClass( 'es-toolbarButtonTool es-toolbarButtonTool-' + name );

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

/* Methods */

ve.ui.ButtonTool.prototype.onClick = function () {
	throw 'ButtonTool.onClick not implemented in this subclass:' + this.constructor;
};

ve.ui.ButtonTool.prototype.updateEnabled = function () {
	if ( this.enabled ) {
		this.$.removeClass( 'es-toolbarButtonTool-disabled' );
	} else {
		this.$.addClass( 'es-toolbarButtonTool-disabled' );
	}
};


/* Inheritance */

ve.extendClass( ve.ui.ButtonTool, ve.ui.Tool );
