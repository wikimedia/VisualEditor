es.ToolbarView = function( $container, surfaceView ) {
	// Reference for use in closures
	var	_this = this;
	
	this.$ = $container;
	this.surfaceView = surfaceView;
	this.tools = [
		{
			type: 'text',
			items: [
				{
					type: 'bold',
					execute: function( toolbarView, tool ) {
						var tx;
						if ( tool.$.hasClass( 'es-toolbarTool-down' ) ) {
							tx = toolbarView.surfaceView.model.getDocument().prepareContentAnnotation(
								toolbarView.currentSelection,
								'clear',
								{ 'type': 'textStyle/bold' }
							);
						} else {
							tx = toolbarView.surfaceView.model.getDocument().prepareContentAnnotation(
								toolbarView.currentSelection,
								'set',
								{ 'type': 'textStyle/bold' }
							);
						}
						toolbarView.surfaceView.model.transact( tx );
					},
					active: function( annotations ) {
						for ( var i = 0; i < annotations.length; i++ ) {
							if ( annotations[i].type === 'textStyle/bold' ) {
								return true;
							}
						}
						return false;
					}
				},
				{
					type: 'italic',
					execute: function( toolbarView, tool ) {
						var tx;
						if ( tool.$.hasClass( 'es-toolbarTool-down' ) ) {
							tx = toolbarView.surfaceView.model.getDocument().prepareContentAnnotation(
								toolbarView.currentSelection,
								'clear',
								{ 'type': 'textStyle/italic' }
							);
						} else {
							tx = toolbarView.surfaceView.model.getDocument().prepareContentAnnotation(
								toolbarView.currentSelection,
								'set',
								{ 'type': 'textStyle/italic' }
							);
						}
						toolbarView.surfaceView.model.transact( tx );
					},
					active: function( annotations ) {
						for ( var i = 0; i < annotations.length; i++ ) {
							if ( annotations[i].type === 'textStyle/italic' ) {
								return true;
							}
						}
						return false;
					}
				}
			]
		},
		'/',
		{
			type: 'list',
			items: [
				{
					type: 'bullet',
					execute: function( ) {
					},
					active: function( ) {
					}
				},
				{
					type: 'number',
					execute: function( ) {
					},
					active: function( ) {
					}
				}
			]
		}
	];
	this.render();
	this.currentSelection = new es.Range();
	this.currentAnnotations = [];
	this.surfaceView.model.on( 'select', function( selection ) {
		_this.onSelect( selection );
	} );
};

es.ToolbarView.prototype.render = function() {
	var _this = this;
	for ( var i = this.tools.length - 1; i >= 0; i-- ) {
		if ( !es.isPlainObject( this.tools[i] ) ) {
			if ( this.tools[i] === '/' ) {
				 this.$.prepend( '<div class="es-toolbarDivider">' );
			}
		} else {
			var	$group = $( '<div>' )
				.addClass( 'es-toolbarGroup' )
				.addClass( 'es-toolbarGroup-' + this.tools[i].type )
				.append(
					$( '<div>' ).addClass( 'es-toolbarLabel' ).html( this.tools[i].type )
				);

			for ( var j = 0; j < this.tools[i].items.length; j++ ) {
				this.tools[i].items[j].$ = $('<div>')
					.addClass( 'es-toolbarTool' )
					.append(
						$( '<img>' ).attr( 'src', 'images/' + this.tools[i].items[j].type + '.png')
					)
					.bind(
						'click',
						{
							tool: this.tools[i].items[j]
						},
						function( e ) {
							_this.execute( e.data.tool );
						}
					);
				$group.append( this.tools[i].items[j].$ );
			}

			this.$.prepend( $group );
		}
	}
};

es.ToolbarView.prototype.execute = function( tool ) {
	tool.execute( this, tool );
};

es.ToolbarView.prototype.onSelect = function( selection ) {
	this.currentSelection = selection;
	
	if( this.currentSelection.from === this.currentSelection.to ) {
		this.currentAnnotations = 
			this.surfaceView.documentView.model.getAnnotationsFromOffset( this.currentSelection.to );
	} else {
		this.currentAnnotations = 
			this.surfaceView.documentView.model.getAnnotationsFromRange( this.currentSelection );
	}
	
	for ( var i = 0; i < this.tools.length; i++ ) {
		if ( es.isPlainObject( this.tools[i] ) ) {
			for ( var j = 0; j < this.tools[i].items.length; j++ ) {
				if ( this.tools[i].items[j].active( this.currentAnnotations ) ) {
					this.tools[i].items[j].$.addClass( 'es-toolbarTool-down' );
				} else {
					this.tools[i].items[j].$.removeClass( 'es-toolbarTool-down' );
				}
			}
		}
	} 
};