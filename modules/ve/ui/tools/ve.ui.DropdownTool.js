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
 * @extends {ve.ui.Tool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 * @param title
 * @param {Object[]} items
 */
ve.ui.DropdownTool = function VeUiDropdownTool( toolbar, name, title, items ) {
	// Parent constructor
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
	this.$icon = $( '<div class="ve-ui-toolbarDropdownTool-icon"></div>' );
	this.$label = $( '<div class="ve-ui-toolbarDropdownTool-label"></div>' );
	this.$labelText = $( '<span>&nbsp;</span>' );

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

/* Inheritance */

ve.inheritClass( ve.ui.DropdownTool, ve.ui.Tool );

/* Methods */

ve.ui.DropdownTool.prototype.onSelect = function () {
	throw new Error( 'DropdownTool.onSelect not implemented in this subclass:' + this.constructor );
};
