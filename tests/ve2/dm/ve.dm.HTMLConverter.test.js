module( 've.dm.HTMLConverter' );


// Tests

test( 'convertHTML', 1, function() {
	var HTML = $('<div><p>abc</p></div>');
	var linearModel = [
		{ 'type': 'paragraph' },
		'a',
		'b',
		'c',
		{ 'type': '/paragraph' },
	];
	var convertedLinearModel = ve.dm.HTMLConverter.getLinearModel(HTML[0]);

	var documentFromLinearModel = new ve.dm.Document ( linearModel );
	var documentFromConvertedLinearModel = new ve.dm.Document ( convertedLinearModel );

	strictEqual( convertedLinearModel.data, linearModel.data );
} );
