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
		tool.$labelText.text( item.label );
	}, this.$ );
	this.$icon = $( '<div>' ).addClass( 've-ui-toolbarDropdownTool-icon' );
	this.$label = $( '<div>' ).addClass( 've-ui-toolbarDropdownTool-label' );
	this.$labelText = $( '<span>' ).html( '&nbsp;' );

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
			var $item = $( e.target ).closest( '.ve-ui-menu' );
			if ( e.which === 1 && $item.length === 0 ) {
				tool.menuView.open();
			} else {
				tool.menuView.close();
			}
		}
	} );

	// DOM Changes
	this.$
		.append( this.$icon, this.$label )
		.addClass( 've-ui-toolbarDropdownTool ve-ui-toolbarDropdownTool-' + name );
	this.$label.append( this.$labelText );
};

/* Methods */

ve.ui.DropdownTool.prototype.onSelect = function ( item ) {
	throw new Error( 'DropdownTool.onSelect not implemented in this subclass:' + this.constructor );
};

/* Inheritance */

ve.extendClass( ve.ui.DropdownTool, ve.ui.Tool );
