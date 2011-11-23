es.ToolbarView = function( $container, model ) {
	this.$ = $container;
	this.model = model;
	
	this.config = [
		{
			name: 'Text',
			items: [
				{
					'type' : 'bold',
					'annotation': 'textStyle/bold'
				},
				{
					'type' : 'italic',
					'annotation': 'textStyle/italic'
				},
				{
					'type' : 'link',
					'annotation': 'link/internal'
				},
				'small',
				'big',
				'sub',
				'super',
				'clear'
			]
		},
		'/',
		{
			name: 'Lists',
			items: [ 'bullet', 'number', 'indent', 'outdent' ]
		},
		'/',
		{
			name: 'Preview',
			items: [ 'json', 'wikitext', 'html', 'render' ]
		}
	];
	
	for( var i = this.config.length - 1; i >= 0; i-- ) {
		if ( es.isPlainObject( this.config[i] ) ) {
			var $group = $( '<div class="es-toolbarGroup">' );
			$( '<div class="es-toolbarLabel">' ).html( this.config[i].name ).appendTo( $group );
			for ( var j = 0; j < this.config[i].items.length; j++ ) {
				var toolName = es.isPlainObject( this.config[i].items[j] ) ? this.config[i].items[j].type : this.config[i].items[j];  
				$( '<div class="es-toolbarTool" id="' + toolName + '"><img src="images/' + toolName + '.png" /></div>' ).appendTo( $group );
			}
			this.$.prepend( $group );
		} else {
			if ( this.config[i] === '/' ) {
				 this.$.prepend( '<div class="es-toolbarDivider">' );
			}
		}
		
	}
};