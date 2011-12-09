/**
 * Creates an es.DropdownTool object.
 * 
 * @class
 * @constructor
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 * @param {Object[]} items
 */
es.DropdownTool = function( toolbar, name, items ) {
	// Inheritance
	es.Tool.call( this, toolbar, name );
	if ( !name ) {
		return;
	}

	// Properties
	var _this = this;
	this.menuView = new es.MenuView( items, function( item ) {
		_this.onSelect( item );
		_this.$label.text( item.label );
	}, this.$ );
	this.$label = $( '<div class="es-toolbarDropdownTool-label"></div>' ).appendTo( this.$ );

	// Events
	$( document )
		.add( this.toolbar.surfaceView.$ )
			.mousedown( function( e ) {
				if ( e.which === 1 ) {
					_this.menuView.close();
				}
			} );
	this.$.bind( {
		'mousedown': function( e ) {
			if ( e.which === 1 ) {
				e.preventDefault();
				return false;
			}
		},
		'mouseup': function( e ) {
			// Don't respond to menu clicks
			var $item = $( e.target ).closest( '.es-menuView' );
			if ( e.which === 1 && $item.length === 0 ) {
				_this.menuView.open();
			}
		}
	} );

	// DOM Changes
	this.$.addClass( 'es-toolbarDropdownTool' ).addClass( 'es-toolbarDropdownTool-' + name );
};

/* Methods */

es.DropdownTool.prototype.onSelect = function( item ) {
	throw 'DropdownTool.onSelect not implemented in this subclass:' + this.constructor;
};

/* Inheritance */

es.extendClass( es.DropdownTool, es.Tool );
