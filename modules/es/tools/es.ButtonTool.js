es.ButtonTool = function( toolbar, name ) {
	es.Tool.call( this, toolbar, name );

	// for es.extendClass
	if ( !name ) {
		return;
	}

	this.$.addClass( 'es-toolbarButtonTool' ).addClass( 'es-toolbarButtonTool-' + name );

	var _this = this;

	this.$.bind( {
		'mousedown': function( e ) {
			if ( e.button === 0 ) {
				e.preventDefault();
				return false;
			}
		},
		'mouseup': function ( e ) {
			if ( e.button === 0 ) {
				_this.onClick( e );
			}
		}
	} );

};

es.ButtonTool.prototype.onClick = function() {
	throw 'ButtonTool.onClick not implemented in this subclass:' + this.constructor;
};

es.extendClass( es.ButtonTool, es.Tool );