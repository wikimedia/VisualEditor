// ToolbarView
es.ToolbarView = function( $container, surfaceView, config ) {
	// Inheritance TODO: Do we still need it?
	es.EventEmitter.call( this );
	if ( !surfaceView ) {
		return;
	}

	// References for use in closures
	var	_this = this,
		$window = $( window );	

	// Properties
	this.surfaceView = surfaceView;
	this.$ = $container;
	this.$groups = $( '<div class="es-toolbarGroups"></div>' ).prependTo( this.$ );
	this.$spacer = $('<div></div>');
	this.$.after( this.$spacer );
	this.tools = [];

	// Events
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

	this.surfaceView.on( 'cursor', function( annotations, nodes ) {
		for( var i = 0; i < _this.tools.length; i++ ) {
			_this.tools[i].updateState( annotations, nodes );
		}
	} );

	this.config = config || [
		{ 'name': 'history', 'items' : ['undo', 'redo'] },
		{ 'name': 'textStyle', 'items' : ['format'] },
		{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
		{ 'name': 'list', 'items' : ['number', 'bullet', 'indent', 'outdent' ] }
	];
	this.setup();
};

/* Methods */

es.ToolbarView.prototype.getSurfaceView = function() {
	return this.surfaceView;
};

es.ToolbarView.prototype.setup = function() {
	for ( var i = 0; i < this.config.length; i++ ) {
		var	$group = $( '<div>' )
			.addClass( 'es-toolbarGroup' )
			.addClass( 'es-toolbarGroup-' + this.config[i].name );
		if ( this.config[i].label ) {
			$group.append(
				$( '<div>' ).addClass( 'es-toolbarLabel' ).html( this.config[i].label )
			);
		}

		for ( var j = 0; j < this.config[i].items.length; j++ ) {
			var toolDefintion = es.Tool.tools[ this.config[i].items[j] ];
			if ( toolDefintion ) {
				var tool = new toolDefintion.constructor(
					this, toolDefintion.name, toolDefintion.title, toolDefintion.data
				);
				this.tools.push( tool );
				$group.append( tool.$ );
			}
		}

		this.$groups.append( $group ); 
	}
};

es.extendClass( es.ToolbarView, es.EventEmitter );
