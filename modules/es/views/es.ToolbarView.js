var i18nDictionary = {
	'text': 'Text',
	'list': 'Lists'
};

var i18n = function( key ) {
	if ( i18nDictionary[key] ) {
		return i18nDictionary[key];
	} else {
		return key;
	}
	
};

es.ToolbarView = function( $container, surfaceView ) {
	// Reference for use in closures
	var	_this = this;
	
	this.$ = $container;
	this.surfaceView = surfaceView;

	this.tools = [
		{
			name: 'text',
			items: [
				{
					type: 'select',
					name: 'formatting',
					items: [
						'',
						'paragraph',
						'preformatted',
						'heading1',
						'heading2',
						'heading3',
						'heading4',
						'heading5',
						'heading6'
					],
					state: function() {
						return 'paragraph';
						return '';
					}
				},
				{
					type: 'button',
					name: 'bold'
				},
				{
					type: 'button',
					name: 'italic'
				}
			]
		},
		'/',
		{
			name: 'list',
			items: [
				{
					type: 'button',
					name: 'bullet'
				},
				{
					type: 'button',
					name: 'number'
				}
			]
		}
	];
	
	this.setup();

	this.surfaceView.model.on( 'select', function( selection ) {
		_this.selection = selection;
		_this.updateToolbar();
	} );
	this.surfaceView.on( 'update', function(a) {
		_this.selection = _this.surfaceView.currentSelection;
		_this.updateToolbar();
	} );
};

es.ToolbarView.prototype.updateToolbar = function() {
	if ( this.selection.from != this.selection.to ) {
//		var nodes = this.surfaceView.documentView.selectNodes( this.selection, true);
//		var nodes = nodes[0].node.selectNodes ( nodes[0].range, true );
	}
};

es.ToolbarView.prototype.setup = function() {
	for ( var i = this.tools.length - 1; i >= 0; i-- ) {
		if ( !es.isPlainObject( this.tools[i] ) ) {
			// divider
			if ( this.tools[i] === '/' ) {
				 this.$.prepend( '<div class="es-toolbarDivider">' );
			}
		} else {
			var	$group = $( '<div>' )
				.addClass( 'es-toolbarGroup' )
				.addClass( 'es-toolbarGroup-' + this.tools[i].name )
				.append(
					$( '<div>' ).addClass( 'es-toolbarLabel' ).html( i18n( this.tools[i].name ) )
				);
			for ( var j = 0; j < this.tools[i].items.length; j++ ) {
				var $tool = $('<div>').addClass( 'es-toolbarTool' );
				if ( this.tools[i].items[j].type === 'button' ) {
					// button
					$tool.append(
						$( '<img>' ).attr( 'src', 'images/' + this.tools[i].items[j].name + '.png')
					);
				} else if ( this.tools[i].items[j].type === 'select' ) {
					// select
					$select = $( '<select>' );
					for ( var h = 0; h < this.tools[i].items[j].items.length; h++ ) {
						$select.append(
							$( '<option>' )
								.html( i18n ( this.tools[i].items[j].items[h] ) )
								.val( this.tools[i].items[j].items[h] )
						);
					}
					$tool.append( $select );
				}
				$group.append( $tool );
				this.tools[i].items[j].$ = $tool;
			}
			this.$.prepend( $group ); 
		}
	}
};