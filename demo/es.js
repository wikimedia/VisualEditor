$(document).ready( function() {
	window.wikiDom = {
		'type': 'document',
		'children': [
			{
				'type': 'pre',
				'content': { 'text': 'A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps.. A lot of text goes here... and at some point it wraps..' }
			},
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
				'content': {
					'text': 'In text display, line wrap is the feature of continuing on a new line when a line is full, such that each line fits in the viewable window, allowing text to be read from top to bottom without any horizontal scrolling.\nWord wrap is the additional feature of most text editors, word processors, and web browsers, of breaking lines between and not within words, except when a single word is longer than a line.',
					'annotations': [
						// 'In text display' should be bold
						{ 'type': 'textStyle/bold', 'range': { 'start': 0, 'end': 15 } },
						// 'line wrap' should be italic
						{ 'type': 'textStyle/italic', 'range': { 'start': 17, 'end': 26 } },
						// 'wrap is' should be a link to '#'
						{
							'type': 'link/external',
							'data': { 'href': '#' },
							'range': { 'start': 22, 'end': 29 }
						}
					]
				}
			},
			{
				'type': 'paragraph',
				'content': { 'text': 'Test 22' }
			},
			{
				'type': 'paragraph',
				'content': { 'text': 'Test 333' }
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
							'styles': ['bullet', 'bullet', 'bullet']
						},
						'children' : [
							{
								'type': 'paragraph',
								'content': { 'text': 'Test 666666' }
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
								'content': { 'text': 'Test 7777777' }
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
								'content': { 'text': 'Test 88888888' }
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
								'content': { 'text': 'Test 999999999' }
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
								'content': { 'text': 'Test 0000000000' }
							}
						]
					}
				]
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
	};
	window.doc = es.DocumentModel.newFromPlainObject( window.wikiDom );
	window.surfaceModel = new es.SurfaceModel( window.doc );
	window.surfaceView = new es.SurfaceView( $( '#es-editor' ), window.surfaceModel );
} );
