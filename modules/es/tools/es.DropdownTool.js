es.DropdownTool = function( toolbar, name ) {
	es.Tool.call( this, toolbar );
	if ( !name ) {
		return;
	}

	this.$.addClass( 'es-toolbarDropdownTool' )
		.addClass( 'es-toolbarDropdownTool-' + name )
		.attr( 'title', name );
};

es.extendClass( es.DropdownTool, es.Tool );