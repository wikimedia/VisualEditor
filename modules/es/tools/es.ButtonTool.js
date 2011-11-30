es.ButtonTool = function( toolbar, name ) {
	es.Tool.call( this, toolbar, name );

	// for es.extendClass
	if ( !name ) {
		return;
	}

	this.$.addClass( 'es-toolbarButtonTool' ).addClass( 'es-toolbarButtonTool-' + name );

	var _this = this;

	this.$.click( function ( e ) {
		_this.onClick( e );
	} );

};

es.ButtonTool.prototype.onClick = function() {
	throw 'ButtonTool.onClick not implemented in this subclass:' + this.constructor;
};

es.extendClass( es.ButtonTool, es.Tool );