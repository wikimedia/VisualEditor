/**
 * Creates an es.ButtonTool object.
 * 
 * @class
 * @constructor
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 */
es.ButtonTool = function( toolbar, name ) {
	// Inheritance
	es.Tool.call( this, toolbar, name );
	if ( !name ) {
		return;
	}

	// Properties
	this.$.addClass( 'es-toolbarButtonTool' ).addClass( 'es-toolbarButtonTool-' + name );

	// Events
	var _this = this;
	this.$.bind( {
		'mousedown': function( e ) {
			if ( e.which === 1 ) {
				e.preventDefault();
				return false;
			}
		},
		'mouseup': function ( e ) {
			if ( e.which === 1 ) {
				_this.onClick( e );
			}
		}
	} );
};

/* Methods */

es.ButtonTool.prototype.onClick = function() {
	throw 'ButtonTool.onClick not implemented in this subclass:' + this.constructor;
};

/* Inheritance */

es.extendClass( es.ButtonTool, es.Tool );