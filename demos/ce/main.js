$(document).ready( function() {
	var wikidoms = {
		'Wikipedia article': {
			'type': 'document',
			'children': [
				{
					"type": "paragraph",
					"content": {
						"text": "In computer science, direct manipulation is a human-computer interaction style which involves continuous representation of objects of interest, and rapid, reversible, incremental actions and feedback. The intention is to allow a user to directly manipulate objects presented to them, using actions that correspond at least loosely to the physical world. An example of direct-manipulation is resizing a graphical shape, such as a rectangle, by dragging its corners or edges with a mouse.",
						"annotations": [
							{
								"type": "link/internal",
								"range": {
									"start": 3,
									"end": 19
								},
								"data": {
									"title": "Computer_science"
								}
							},
							{
								"type": "link/internal",
								"range": {
									"start": 46,
									"end": 72
								},
								"data": {
									"title": "Human-computer interaction"
								}
							},
							{
								"type": "textStyle/bold",
								"range": {
									"start": 21,
									"end": 40
								}
							},
							{
								"type": "textStyle/italic",
								"range": {
									"start": 28,
									"end": 40
								}
							}
						]
					}
				},
				{
					'type': 'table',
					'attributes': { 'html/style': 'width: 300px; float: left; margin: 0 1em 1em 0; border: solid 1px;' },
					'children': [
						{
							'type': 'tableRow',
							'children': [
								{
									'type': 'tableCell',
									'attributes': { 'html/style': 'border: solid 1px;' },
									'children': [
										{
											'type': 'paragraph',
											'content': { 'text': 'row 1 & cell 1' }
										}
									]
								},
								{
									'type': 'tableCell',
									'attributes': { 'html/style': 'border: solid 1px;' },
									'children': [
										{
											'type': 'paragraph',
											'content': { 'text': 'row 1 & cell 2' }
										}
									]
								}
							]
						},
						{
							'type': 'tableRow',
							'children': [
								{
									'type': 'tableCell',
									'attributes': { 'html/style': 'border: solid 1px;' },
									'children': [
										{
											'type': 'paragraph',
											'content': { 'text': 'row 2 & cell 1' }
										}
									]
								},
								{
									'type': 'tableCell',
									'attributes': { 'html/style': 'border: solid 1px;' },
									'children': [
										{
											'type': 'paragraph',
											'content': { 'text': 'row 2 & cell 2' }
										}
									]
								}
							]
						}
					]
				},				
				{
					'type': 'paragraph',
					'content': { 'text': 'Test 1' }
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Test 2' }
				},
				{
					"type": "paragraph",
					"content": {
						"text": "The ViewTouch graphic touchscreen POS (point of sale) GUI developed by Gene Mosher on the Atari ST computer and first installed in restaurants in 1986 is an early example of an application specific GUI that manifests all of the characteristics of direct manipulation.",
						"annotations": [
							{
								"type": "textStyle/bold",
								"range": {
									"start": 0,
									"end": 13
								}
							},
							{
								"type": "textStyle/italic",
								"range": {
									"start": 34,
									"end": 37
								}
							}
						]
					}
				}
			]
		},
		'Formatting': {
			'type': 'document',
			'children': [
				{
					'type': 'heading',
					'attributes': { 'level': 1 },
					'content': {
						'text': 'This is a heading (level 1)',
						'annotations': [
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 10,
									'end': 17
								}
							}
						]	
					}
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Paragraph' }
				},
				{
					'type': 'heading',
					'attributes': { 'level': 2 },
					'content': {
						'text': 'This is a heading (level 2)',
						'annotations': [
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 10,
									'end': 17
								}
							}
						]	
					}
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Paragraph' }
				},
				{
					'type': 'heading',
					'attributes': { 'level': 3 },
					'content': {
						'text': 'This is a heading (level 3)',
						'annotations': [
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 10,
									'end': 17
								}
							}
						]	
					}
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Paragraph' }
				},
				{
					'type': 'heading',
					'attributes': { 'level': 4 },
					'content': {
						'text': 'This is a heading (level 4)',
						'annotations': [
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 10,
									'end': 17
								}
							}
						]	
					}
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Paragraph' }
				},
				{
					'type': 'heading',
					'attributes': { 'level': 5 },
					'content': {
						'text': 'This is a heading (level 5)',
						'annotations': [
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 10,
									'end': 17
								}
							}
						]	
					}
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Paragraph' }
				},
				{
					'type': 'heading',
					'attributes': { 'level': 6 },
					'content': {
						'text': 'This is a heading (level 6)',
						'annotations': [
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 10,
									'end': 17
								}
							}
						]	
					}
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Paragraph' }
				},
				{
				'type': 'pre',
				'content': { 'text': 'A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps..' }
				},
				{
					'type': 'heading',
					'attributes': { 'level': 1 },
					'content': { 'text': 'Lists' }
				},
				{
					'type': 'list',
					'children': [
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['bullet']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Bullet' }
								}
							]
						}
					]
				},
				{
					'type': 'paragraph',
					'content': { 'text': 'Paragraph' }
				},
				{
					'type': 'list',
					'children': [
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['bullet']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Bullet' }
								}
							]
						},
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['bullet', 'bullet']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Bullet bullet' }
								}
							]
						},
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['bullet', 'bullet', 'bullet']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Bullet bullet bullet' }
								}
							]
						},
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['number']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Number' }
								}
							]
						},
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['number', 'number']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Number number' }
								}
							]
						},
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['term']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Term' }
								}
							]
						},
						{
							'type': 'listItem',
							'attributes': {
								'styles': ['definition']
							},
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Definition' }
								}
							]
						}
					]
				}
			]
		},
		/*
		'Tables': {
			'type': 'document',
			'children': [
				{
					'type': 'heading',
					'attributes': { 'level': 1 },
					'content': { 'text': 'Tables' }
				},
				{
					'type': 'table',
					'attributes': { 'html/style': 'width: 600px; border: solid 1px;' },
					'children': [
						{
							'type': 'tableRow',
							'children': [
								{
									'type': 'tableCell',
									'attributes': { 'html/style': 'border: solid 1px;' },
									'children': [
										{
											'type': 'paragraph',
											'content': { 'text': 'row 1 & cell 1' }
										},
										{
											'type': 'list',
											'children': [
												{
													'type': 'listItem',
													'attributes': {
														'styles': ['bullet']
													},
													'children' : [
														{
															'type': 'paragraph',
															'content': { 'text': 'Test 4444' }
														}
													]												
												},
												{
													'type': 'listItem',
													'attributes': {
														'styles': ['bullet', 'bullet']
													},
													'children' : [
														{
															'type': 'paragraph',
															'content': { 'text': 'Test 55555' }
														}
													]												
												},
												{
													'type': 'listItem',
													'attributes': {
														'styles': ['number']
													},
													'children' : [
														{
															'type': 'paragraph',
															'content': { 'text': 'Test 666666' }
														}
													]												
												}
											]
										}
									]
								},
								{
									'type': 'tableCell',
									'attributes': { 'html/style': 'border: solid 1px;' },
									'children': [
										{
											'type': 'paragraph',
											'content': { 'text': 'row 1 & cell 2' }
										}
									]
								}
							]
						}
					]
				}
			]
		},*/
		'New document': {
			'type': 'document',
			'children': [
				{
					'type': 'paragraph',
					'content': { 'text': '' }
				}
			]
		}
	};
	window.documentModel = ve.dm.DocumentNode.newFromPlainObject( wikidoms['Wikipedia article'] );
	window.surfaceModel = new ve.dm.Surface( window.documentModel );
	window.surfaceView = new ve.es.Surface( $( '#es-editor' ), window.surfaceModel );
	window.toolbarView = new ve.ui.Toolbar( $( '#es-toolbar' ), window.surfaceView, [] );
	window.contextView = new ve.ui.Context( window.surfaceView );
	window.surfaceModel.select( new ve.Range( 1, 1 ) );

	/*
	 * This code is responsible for switching toolbar into floating mode when scrolling (with
	 * keyboard or mouse).
	 */
	var $toolbarWrapper = $( '#es-toolbar-wrapper' ),
		$toolbar = $( '#es-toolbar' ),
		$window = $( window );
	$window.scroll( function() {
		var toolbarWrapperOffset = $toolbarWrapper.offset();
		if ( $window.scrollTop() > toolbarWrapperOffset.top ) {
			if ( !$toolbarWrapper.hasClass( 'float' ) ) {
				var	left = toolbarWrapperOffset.left,
					right = $window.width() - $toolbarWrapper.outerWidth() - left;
				$toolbarWrapper.css( 'height', $toolbarWrapper.height() ).addClass( 'float' );
				$toolbar.css( { 'left': left, 'right': right } );
			}
		} else {
			if ( $toolbarWrapper.hasClass( 'float' ) ) {
				$toolbarWrapper.css( 'height', 'auto' ).removeClass( 'float' );
				$toolbar.css( { 'left': 0, 'right': 0 } );
			}
		}
	} );

	var $modeButtons = $( '.es-modes-button' ),
		$panels = $( '.es-panel' ),
		$base = $( '#es-base' ),
		currentMode = null,
		modes = {
			'wikitext': {
				'$': $( '#es-mode-wikitext' ),
				'$panel': $( '#es-panel-wikitext' ),
				'update': function() {
					this.$panel.text(
						ve.dm.WikitextSerializer.stringify( documentModel.getPlainObject() )
					);
				}
			},
			'json': {
				'$': $( '#es-mode-json' ),
				'$panel': $( '#es-panel-json' ),
				'update': function() {
					this.$panel.text( ve.dm.JsonSerializer.stringify( documentModel.getPlainObject(), {
						'indentWith': '  '
					} ) );
				}
			},
			'html': {
				'$': $( '#es-mode-html' ),
				'$panel': $( '#es-panel-html' ),
				'update': function() {
					this.$panel.text(
						ve.dm.HtmlSerializer.stringify( documentModel.getPlainObject() )
					);
				}
			},
			'render': {
				'$': $( '#es-mode-render' ),
				'$panel': $( '#es-panel-render' ),
				'update': function() {
					this.$panel.html(
						ve.dm.HtmlSerializer.stringify( documentModel.getPlainObject() )
					);
				}
			},
			'history': {
				'$': $( '#es-mode-history' ),
				'$panel': $( '#es-panel-history' ),
				'update': function() {
					var	history = surfaceModel.getHistory(),
						i = history.length,
						end = Math.max( 0, i - 25 ),
						j,
						k,
						ops,
						events = '',
						z = 0,
						operations;
						
					while ( --i >= end ) {
						z++;
						operations = [];
						for ( j = 0; j < history[i].stack.length; j++) {
							ops = history[i].stack[j].getOperations().slice(0);
							for ( k = 0; k < ops.length; k++ ) {
								data = ops[k].data || ops[k].length;
								if ( ve.isArray( data ) ) {
									data = data[0];
									if ( ve.isArray( data ) ) {
										data = data[0];
									}
								}
								if ( typeof data !== 'string' && typeof data !== 'number' ) {
									data = '-';
								}
								ops[k] = ops[k].type.substr( 0, 3 ) + '(' + data + ')';
							}
							operations.push('[' + ops.join( ', ' ) + ']');
						}
						events += '<div' + (z === surfaceModel.undoIndex ? ' class="es-panel-history-active"' : '') + '>' + operations.join(', ') + '</div>';
					}
					
					this.$panel.html( events );
				}
			},
			'help': {
				'$': $( '#es-mode-help' ),
				'$panel': $( '#es-panel-help' ),
				'update': function() {}
			}
		};
	$.each( modes, function( name, mode ) {
		mode.$.click( function() {
			var disable = $(this).hasClass( 'es-modes-button-down' );
			var visible = $base.hasClass( 'es-showData' );
			$modeButtons.removeClass( 'es-modes-button-down' );
			$panels.hide();
			if ( disable ) {
				if ( visible ) {
					$base.removeClass( 'es-showData' );
					$window.resize();
				}
				currentMode = null;
			} else {
				$(this).addClass( 'es-modes-button-down' );
				mode.$panel.show();
				if ( !visible ) {
					$base.addClass( 'es-showData' );
					$window.resize();
				}
				mode.update.call( mode );
				currentMode = mode;
			}
		} );
	} );

	var $docsList = $( '#es-docs-list' );
	$.each( wikidoms, function( title, wikidom ) {
		$docsList.append(
			$( '<li class="es-docs-listItem"></li>' )
				.append(
					$( '<a href="#"></a>' )
						.text( title )
						.click( function() {
							var newDocumentModel = ve.dm.DocumentNode.newFromPlainObject( wikidom );
							documentModel.data.splice( 0, documentModel.data.length );
							ve.insertIntoArray( documentModel.data, 0, newDocumentModel.data );
							surfaceModel.select( new ve.Range( 1, 1 ) );
							documentModel.splice.apply(
								documentModel,
								[0, documentModel.getChildren().length]
									.concat( newDocumentModel.getChildren() )
							);
							surfaceModel.purgeHistory();
							
							if ( currentMode ) {
								currentMode.update.call( currentMode );
							}
							return false;
						} )
				)
		);
	} );

	surfaceModel.on( 'transact', function() {
		if ( currentMode ) {
			currentMode.update.call( currentMode );
		}
	} );
	surfaceModel.on( 'select', function() {
		if ( currentMode === modes.history ) {
			currentMode.update.call( currentMode );
		}
	} );

	$( '#es-docs' ).css( { 'visibility': 'visible' } );
	$( '#es-base' ).css( { 'visibility': 'visible' } );
	$( '#es-mode-wikitext' ).click();
} );
