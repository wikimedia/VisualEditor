/**
 * VisualEditor user interface DropdownTool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.DropdownTool object.
 *
 * @class
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param {Object[]} items
 */
ve.ui.DropdownTool = function ( toolbar, name, title, items ) {
	// Inheritance
	ve.ui.Tool.call( this, toolbar, name, title );
	if ( !name ) {
		return;
	}

	// Properties
	var tool = this;
	this.menuView = new ve.ui.Menu( items, function ( item ) {
		tool.onSelect( item );
		tool.$label.text( item.label );
	}, this.$ );
	this.$icon = $( '<div class="es-toolbarDropdownTool-icon"></div>' ).appendTo( this.$ );
	this.$label = $( '<div class="es-toolbarDropdownTool-label">&nbsp;</div>' ).appendTo( this.$ );

	// Events
	$( document )
		.add( this.toolbar.surfaceView.$ )
			.mousedown( function ( e ) {
				if ( e.which === 1 ) {
					tool.menuView.close();
				}
			} );
	this.$.on( {
		'mousedown': function ( e ) {
			if ( e.which === 1 ) {
				e.preventDefault();
				return false;
			}
		},
		'mouseup': function ( e ) {
			// Don't respond to menu clicks
			var $item = $( e.target ).closest( '.es-menuView' );
			if ( e.which === 1 && $item.length === 0 ) {
				tool.menuView.open();
			} else {
				tool.menuView.close();
			}
		}
	} );

	// DOM Changes
	this.$.addClass( 'es-toolbarDropdownTool es-toolbarDropdownTool-' + name );
};

/* Methods */

ve.ui.DropdownTool.prototype.onSelect = function ( item ) {
	throw new Error( 'DropdownTool.onSelect not implemented in this subclass:' + this.constructor );
};

/* Inheritance */

ve.extendClass( ve.ui.DropdownTool, ve.ui.Tool );
