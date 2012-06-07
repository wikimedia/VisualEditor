module( 've.dm.Converter' );

/* Tests */

test( 'getDataElementFromDomElement', function() {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		deepEqual(
			ve.dm.converter.getDataElementFromDomElement( conversion.domElement ),
			conversion.dataElement,
			msg
		);
	}
} );

test( 'getDomElementFromDataElement', function() {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		deepEqual(
			ve.example.getDomElementSummary(
				ve.dm.converter.getDomElementFromDataElement( conversion.dataElement )
			),
			ve.example.getDomElementSummary( conversion.domElement ),
			msg
		);
	}
} );

test( 'getDataFromDom', function() {
	var cases = {
		'paragraph and text': {
			'html': '<p>abc</p>',
			'data': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				{ 'type': '/paragraph' }
			]
		},
		'bold, italic, underline': {
			'html': '<p><b>a</b><i>b</i><u>c</u></p>',
			'data': [
				{ 'type': 'paragraph' },
				['a', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
				['b', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
				['c', { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } }],
				{ 'type': '/paragraph' }
			]
		},
		'image': {
			'html': '<img src="image.png">',
			'data': [
				{ 'type': 'image', 'attributes' : { 'html/src' : 'image.png' } },
				{ 'type' : '/image' }
			]
		},
		'paragraph with inline alien': {
			'html': '<p>a<a href="b.html" data-mw-gc="">b</a>c</p>',
			'data': [
				{ 'type': 'paragraph' },
				'a',
				{
					'type': 'alienInline',
					'attributes': { 'html': '<a href="b.html" data-mw-gc="">b</a>' }
				},
				'c',
				{ 'type': '/paragraph' }
			]
		}
	};

	for ( var msg in cases ) {
		deepEqual(
			ve.dm.converter.getDataFromDom( $( '<div></div>' ).html( cases[msg].html )[0] ),
			cases[msg].data,
			msg
		);
	}
} );
