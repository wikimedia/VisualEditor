$(document).ready( function() {
	var wikidoms = {
		'Wikipedia article': {
			'type': 'document',
			'children': [
				{
					'type': 'paragraph',
					'content': {
						'text': 'In computer science, direct manipulation is a human-computer interaction style which involves continuous representation of objects of interest, and rapid, reversible, incremental actions and feedback. The intention is to allow a user to directly manipulate objects presented to them, using actions that correspond at least loosely to the physical world. An example of direct-manipulation is resizing a graphical shape, such as a rectangle, by dragging its corners or edges with a mouse.',
						'annotations': [
							{
								'type': 'link/internal',
								'range': {
									'start': 3,
									'end': 19
								},
								'data': {
									'title': 'Computer_science'
								}
							},
							{
								'type': 'link/internal',
								'range': {
									'start': 46,
									'end': 72
								},
								'data': {
									'title': 'Human-computer interaction'
								}
							},
							{
								'type': 'textStyle/bold',
								'range': {
									'start': 21,
									'end': 40
								}
							},
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 28,
									'end': 40
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
					'type': 'paragraph',
					'content': {
						'text': 'The ViewTouch graphic touchscreen POS (point of sale) GUI developed by Gene Mosher on the Atari ST computer and first installed in restaurants in 1986 is an early example of an application specific GUI that manifests all of the characteristics of direct manipulation.',
						'annotations': [
							{
								'type': 'textStyle/bold',
								'range': {
									'start': 0,
									'end': 13
								}
							},
							{
								'type': 'textStyle/italic',
								'range': {
									'start': 34,
									'end': 37
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
					'attributes': { 'style': 'bullet' },
					'children': [
						{
							'type': 'listItem',
							'attributes': { 'style': 'item' },
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
					'attributes': { 'style': 'bullet' },
					'children': [
						{
							'type': 'listItem',
							'attributes': { 'style': 'item' },
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Bullet' }
								},
								{
									'type': 'list',
									'attributes': { 'style': 'bullet' },
									'children': [
										{
											'type': 'listItem',
											'attributes': { 'style': 'item' },
											'children' : [
												{
													'type': 'paragraph',
													'content': { 'text': 'Bullet bullet' }
												}
											]
										},
										{
											'type': 'list',
											'attributes': { 'style': 'bullet' },
											'children' : [
												{
													'type': 'listItem',
													'attributes': { 'style': 'item' },
													'children' : [
														{
															'type': 'paragraph',
															'content': { 'text': 'Bullet bullet bullet' }
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{
					'type': 'list',
					'attributes': { 'style': 'number' },
					'children': [
						{
							'type': 'listItem',
							'attributes': { 'style': 'item' },
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Number' }
								},
								{
									'type': 'list',
									'attributes': { 'style': 'number' },
									'children': [
										{
											'type': 'listItem',
											'attributes': { 'style': 'item' },
											'children' : [
												{
													'type': 'paragraph',
													'content': { 'text': 'Number number' }
												}
											]
										},
										{
											'type': 'list',
											'attributes': { 'style': 'number' },
											'children' : [
												{
													'type': 'listItem',
													'attributes': { 'style': 'item' },
													'children' : [
														{
															'type': 'paragraph',
															'content': { 'text': 'Number number number' }
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{
					'type': 'list',
					'attributes': { 'style': 'definition' },
					'children': [
						{
							'type': 'listItem',
							'attributes': { 'style': 'term' },
							'children' : [
								{
									'type': 'paragraph',
									'content': { 'text': 'Term' }
								}
							]
						},
						{
							'type': 'listItem',
							'attributes': { 'style': 'definition' },
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

	/* Sandbox integration hack.  Allows both MW integration and demo pages to work */
	if ( $('#content').length === 0 ) {
		$( 'body' ).append(
			$( '<div />' ).attr( 'id', 'content' )
		);
	}

	/* Sandbox config object. */
	var options = {
		toolbars: {
			top: {
				/* What modes this toolbar will have */
				modes: ['wikitext', 'json', 'html', 'render', 'history', 'help']
			}
		}
	};

	/*
		Create Sandbox instance of VE
		Attach to #content element
	*/
	var sandboxEditor = new ve.Surface( '#content', wikidoms['Wikipedia article'], options ),
		surfaceModel = sandboxEditor.getSurfaceModel(),
		documentModel = sandboxEditor.getDocumentModel(),
		parent = sandboxEditor.getParent();

	/* Sandbox links above the editor */
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
							// FIXME: this should be using ve.batchedSplice(), otherwise things
							// could explode if newDocumentModel.getChildren() is very long
							documentModel.splice.apply(
								documentModel,
								[0, documentModel.getChildren().length]
									.concat( newDocumentModel.getChildren() )
							);
							surfaceModel.purgeHistory();
							
							if ( sandboxEditor.currentMode ) {
								sandboxEditor.currentMode.update.call( sandboxEditor.currentMode );
							}
							return false;
						} )
				)
		);
	} );

	/* Sandbox Warning Message */
	$( '#es-docs' ).css( { 'visibility': 'visible' } );
	// Show the warning that this software is experimental
	// TODO: Use a cookie to remember the warning has been dismissed
	$( '#es-warning' ).show();
	$( '#es-warning-dismiss' ).click( function() {
		$(this).parent().slideUp();
		return false;
	} );
	$( '.es-mode-wikitext' ).click();
} );
