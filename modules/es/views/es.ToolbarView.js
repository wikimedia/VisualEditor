// ToolbarView
es.ToolbarView = function( $container, surfaceView ) {
	es.EventEmitter.call( this );

	// References for use in closures
	var	_this = this,
		$window = $( window );	

	this.surfaceView = surfaceView;
	this.$spacer = $('<div></div>');
	this.$ = $container;
	this.$groups = $( '<div class="es-toolbarGroups"></div>' ).prependTo( this.$ );
	this.$.after( this.$spacer );

	/*
	 * This code is responsible for switching toolbar into floating mode when scrolling (with
	 * keyboard or mouse).
	 */
	$window.scroll( function() {
		if ( _this.surfaceView.dimensions.scrollTop >= _this.surfaceView.dimensions.toolbarTop ) {
			if ( ! _this.$.hasClass( 'float' ) ) {
				var	left = _this.$.offset().left,
					right = $window.width() - _this.$.outerWidth() - left;
				_this.$.css( 'right', right );
				_this.$.css( 'left', left );
				_this.$.addClass( 'float' );
				_this.$spacer.height( _this.$.height() );
			}
		} else {
			if ( _this.$.hasClass( 'float' ) ) {
				_this.$.css( 'right', 0 );
				_this.$.css( 'left', 0 );
				_this.$.removeClass( 'float' );
				_this.$spacer.height(0);
			}
		}
	} );

	this.config = [
		{ name: 'text', items : [ 'bold', 'italic', 'formatting', 'clear' ] },
	];

	this.setup()
	
	this.surfaceView.model.on( 'select', function( selection ) {
		_this.emit( 'update' );
	} );
	this.surfaceView.on( 'update', function() {
		_this.emit( 'update' );
	} );
};

es.ToolbarView.tools = {};

es.ToolbarView.prototype.setup = function() {
	for ( var i = 0; i < this.config.length; i++ ) {
		var	$group = $( '<div>' )
			.addClass( 'es-toolbarGroup' )
			.addClass( 'es-toolbarGroup-' + this.config[i].name )
			.append(
				$( '<div>' ).addClass( 'es-toolbarLabel' ).html( this.config[i].name )
			);

		for ( var j = 0; j < this.config[i].items.length; j++ ) {
			var tool = new es.ToolbarView.tools[ this.config[i].items[j] ]( this );
			$group.append( tool.$ );
		}

		this.$groups.append( $group ); 
	}
};

es.extendClass( es.ToolbarView, es.EventEmitter );