es.ToolbarView = function( $container, model ) {
	this.$ = $container;
	this.model = model;
	
	this.config = [
		{
			name: 'text',
			items: [
				{ 'name': 'bold', 'annotation': 'textStyle/bold' },
				{ 'name': 'italic', 'annotation': 'textStyle/italic' },
				{ 'name': 'link', 'annotation': 'link/internal' },
				{ 'name': 'small' },
				{ 'name': 'big' },
				{ 'name': 'sub' },
				{ 'name': 'super' },
				{ 'name': 'clear' }
			]
		},
		'/',
		{
			name: 'list',
			items: [
				{ 'name': 'bullet' },
				{ 'name': 'number' },
				{ 'name': 'indent' },
				{ 'name': 'outdent' }
			]
		},
		{
			name: 'preview',
			items: [
				{ 'name': 'json' },
				{ 'name': 'wikitext' },
				{ 'name': 'html' },
				{ 'name': 'render' }
			]
		}
	];
	
	for ( var i = this.config.length - 1; i >= 0; i-- ) {
		if ( !es.isPlainObject( this.config[i] ) ) {
			if ( this.config[i] === '/' ) {
				 this.$.prepend( '<div class="es-toolbarDivider">' );
			}
		} else {
			var $group = $( '<div>' )
				.addClass( 'es-toolbarGroup' )
				.addClass( 'es-toolbarGroup-' + this.config[i].name );

			$( '<div>' )
				.addClass( 'es-toolbarLabel' )
				.html( this.config[i].name )
				.appendTo( $group );

			for ( var j = 0; j < this.config[i].items.length; j++ ) {
				var $tool = $('<div>')
					.addClass( 'es-toolbarTool' )
					.attr( 'id', 'es-toolbar-' + this.config[i].items[j].name );
				
				$( '<img>' )
					.attr( 'src', 'images/' + this.config[i].items[j].name + '.png')
					.appendTo( $tool );

				$group.append( $tool );
			}

			this.$.prepend( $group );
		}
	}

};