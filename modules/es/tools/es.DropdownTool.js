es.DropdownTool = function( toolbar, name ) {
	es.Tool.call( this, toolbar, name );

	// for es.extendClass
	if ( !name ) {
		return;
	}

	this.$.addClass( 'es-toolbarDropdownTool' ).addClass( 'es-toolbarDropdownTool-' + name );
	
	this.$select = $( '<select>' );
	this.$.append( this.$select );

	var _this = this;

	this.$.bind( {
		'change': function( e ) {
			_this.onChange( e );
		}
	} );

};

es.DropdownTool.prototype.onChange = function() {
	throw 'DropdownTool.onChange not implemented in this subclass:' + this.constructor;
};

es.extendClass( es.DropdownTool, es.Tool );