$(document).ready( function() {
/*	var wikidoms = {
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
		}, */
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
	/*	'New document': {
			'type': 'document',
			'children': [
				{
					'type': 'paragraph',
					'content': { 'text': '' }
				}
			]
		}
	}; */

	/* Sandbox integration hack.  Allows both MW integration and demo pages to work */
	if ( $('#content').length === 0 ) {
		$( 'body' ).append(
			$( '<div />' ).attr( 'id', 'content' )
		);
	}

	// Overwrite input data with example data
	/*
	data = [
		{ 'type': 'heading', 'attributes': { 'level': 1 } },
		'a',
		'b',
		'c',
		{ 'type': '/heading' },
		{ 'type': 'paragraph' },
		'a',
		['b', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
		['c', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
		{ 'type': '/paragraph' },
		{ 'type': 'paragraph' },
		{ 'type': 'image', 'attributes': { 'html/src': 'http://placekitten.com/g/120/120' } },
		{ 'type': '/image' },
		'L',
		'o',
		'r',
		'e',
		'm',
		' ',
		'i',
		'p',
		's',
		'u',
		'm',
		' ',
		{ 'type': 'image', 'attributes': { 'html/src': 'http://placekitten.com/g/100/100' } },
		{ 'type': '/image' },
		' ',
		'a',
		'n',
		'd',
		{ 'type': '/paragraph' },
		{ 'type': 'table' },
		{ 'type': 'tableRow' },
		{ 'type': 'tableCell' },
		{ 'type': 'paragraph' },
		['a', {
			'{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' },
			'{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' }
		}],
		{ 'type': '/paragraph' },
		{ 'type': '/tableCell' },
		{ 'type': '/tableRow' },
		{ 'type': '/table' },
		{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
		{ 'type': 'listItem', 'attributes': { 'style': 'item' } },
		{ 'type': 'paragraph' },
		'a',
		{ 'type': '/paragraph' },
		{ 'type': '/listItem' },
		{ 'type': '/list' },
		{ 'type': 'image', 'attributes': { 'html/src': 'http://dl.dropbox.com/u/1026938/wikia.jpeg' } },
		{ 'type': '/image' },
	];
	*/
	// Define HTML5 DOM
	var HTML = $(
		'<div>' +
			'<div><table><tr><td>123</td></tr></table></div>' +
			'<p><b>Lorem <img src="http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png"> Ipsum</b> is simply dummy text of the printing <img src="http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png"> and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>' +
			'<h2><b>What</b> is <i>Lorem Ipsum?</i></h2>' +
			'<p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>' +
			'<table><tbody>' +
			'<tr>' +
				'<td><p>Lorem Ipsum is simply dummy text...</p></td>' +
				'<td><div>Template 2</div><div>Template 3</div><p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.</p></td>' +
				'<td><p>Nullam aliquam ligula nec metus pretium in lobortis urna pellentesque.</p></td>' +
			'</tr>' +
			'<tr>' +
				'<td><p>Nullam nulla neque, luctus et cursus eu, sollicitudin sollicitudin massa.</p></td>' +
				'<td><p>Sed consectetur nunc blandit urna pulvinar eu porttitor lorem rutrum. Maecenas vel justo id felis consectetur euismod.</p></td>' +
				'<td><p>Suspendisse vulputate sagittis iaculis. Suspendisse potenti.</p></td>' +
			'</tr>' +
			'</tbody></table>' +
			'<div>Template 4</div>' +
			'<p>Lorem ipsum <alien>Template 5</alien> is simply dummy text of the printing and typesetting industry.</p>' +
			'<h2><b>Where</b> can <i>I get some?</i></h2>' +
			'<ul>' +
				'<li><p><b>here</b></p></li>' +
				'<li><p>or <i>here</i></p></li>' +
				'<li><p>or <u>there</u></p></li>' +
			'</ul>' +
			'<h2>Why do we use it?</h2>' +
			'<table><tbody>' +
			'<tr>' +
				'<td>' +
				'<p>Tabel level 1</p>' +
				'<p>And image: <img src="http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png"></p>' +
				'<table><tbody>' +
				'<tr>' +
					'<td>' +
					'<p>Tabel level 2</p>' +
					'<p>And list:</p>' +
					'<ul>' +
						'<li><p><b>here</b></p></li>' +
						'<li><p>or <i>here</i></p></li>' +
						'<li><p>or <u>there</u></p></li>' +
					'</ul>' +
					'<table><tbody>' +
					'<tr>' +
						'<td>' +
						'<p>Tabel level 3</p>' +
						'<p>And templates: <alien>Template 6</alien></p>' +
						'<div>Template 7</div>' +
						'</td>' +
					'</tr>' +
					'</tbody></table>' +
					'</td>' +
				'</tr>' +
				'</tbody></table>' +
				'</td>' +
			'</tr>' +
			'</tbody></table>' +
			'<div>Template 8</div>' +
		'</div>' );

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
	var sandboxEditor = new ve.Surface( '#content', HTML[0], options ),
		surfaceModel = sandboxEditor.getSurfaceModel(),
		documentModel = sandboxEditor.getDocumentModel(),
		parent = sandboxEditor.getParent(),
		view = sandboxEditor.view;
	
	window.sandboxEditor = sandboxEditor;

		/* Rob's test selection stuff */
		//surfaceModel.setSelection( new ve.Range(0, documentModel.getData().length ) );
		//view.showSelection ( surfaceModel.getSelection() );

	/* Sandbox Warning Message */
	$( '#es-docs' ).css( { 'visibility': 'visible' } );
	// Show the warning that this software is experimental
	// TODO: Use a cookie to remember the warning has been dismissed
	$( '#es-warning' ).show();
	$( '#es-warning-dismiss' ).click( function() {
		$(this).parent().slideUp();
		return false;
	} );
	//$( '.es-mode-wikitext' ).click();
} );
