es.ButtonTool = function( toolbar, name ) {
	es.Tool.call( this, toolbar );
	if ( !name ) {
		return;
	}
	var _this = this;
	
	this.$.addClass( 'es-toolbarTool-' + name );
	
	this.$.click( function ( e ) {
		_this.onClick( e );
	} );
};

es.ButtonTool.prototype.onClick = function( e ) {
	console.log( this.$ );
};


es.extendClass( es.ButtonTool, es.Tool );