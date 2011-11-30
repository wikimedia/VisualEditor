es.ButtonTool = function( toolbar, name ) {
	es.Tool.call( this, toolbar );
	if ( !name ) {
		return;
	}
	this.$.addClass( 'es-toolbarTool-' + name );
};

es.extendClass( es.ButtonTool, es.Tool );