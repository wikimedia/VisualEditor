es.DropdownTool = function( toolbar, name, items ) {
	// Inheritance
	es.Tool.call( this, toolbar, name );

	// Early exit when extending via es.extendClass
	if ( !name ) {
		return;
	}
	
	// Properties
	var _this = this;
	this.menuView = new es.MenuView( items, function( item ) {
		_this.onSelect( item );
		_this.$.text( item.label );
	} );

	$( document ).add( this.toolbar.surfaceView.$ ).mousedown( function( e ) {
		if ( e.button === 0 ) {
			_this.menuView.hide();
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
