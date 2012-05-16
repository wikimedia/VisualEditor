module( 've.dm.HTMLConverter' );

// Tests

test( 'convertHTML', function() {

	var cases = [
		{
			'html': '<p>abc</p>',
			'linearModel': [
				{ 'type': 'paragraph' },
				'a',
				'b',
				'c',
				{ 'type': '/paragraph' }
			],
			'message': 'paragraph and text'
		},
		{
			'html': '<p><b>a</b><i>b</i><u>c</u></p>',
			'linearModel': [
				{ 'type': 'paragraph' }, 
				['a', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } }],
				['b', { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } }],
				['c', { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } }],
				{ 'type': '/paragraph' } 
			],
			'message': 'bold, italic, underline'
		},
		{
			'html': '<img src="http://www.something.com/test.jpg">',
			'linearModel': [
				{ 'type': 'image', 'attributes' : { 'html/src' : 'http://www.something.com/test.jpg' } },
				{ 'type' : '/image' }
			],
			'message': 'image'
		}		
	];
	expect(cases.length);
	

	for ( var i = 0; i < cases.length; i++ ) {
		var c = cases[i];
		var convertedLinearModel = ve.dm.HTMLConverter.getLinearModel($('<div>' + c.html + '</div>')[0]);

		console.log(convertedLinearModel);
		console.log(c.linearModel);

		deepEqual(convertedLinearModel, c.linearModel, c.message);
	}
} );
