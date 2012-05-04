module( 've.dm.TransactionProcessor' );

/* Tests */

test( 'retain', 2, function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	var tx = new ve.dm.Transaction();
	tx.pushRetain( 38 );
	
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data,
		'Transaction with just a retain operation does not change the linear model' );
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data,
		'Rollback also does not change the linear model' );
} );

test( 'annotate', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	var tx = new ve.dm.Transaction();
	tx.pushStartAnnotating( 'set', { 'type': 'textStyle/bold' } );
	tx.pushRetain( 2 );
	tx.pushStartAnnotating( 'clear', { 'type': 'textStyle/italic' } );
	tx.pushRetain( 2 );
	tx.pushStopAnnotating( 'clear', { 'type': 'textStyle/italic' } );
	tx.pushRetain( 8 );
	tx.pushStopAnnotating( 'set', { 'type': 'textStyle/bold' } );
	tx.pushRetain( 4 );
	tx.pushStartAnnotating( 'set', { 'type': 'textStyle/underline' } );
	tx.pushRetain( 4 );
	tx.pushStartAnnotating( 'set', { 'type': 'textStyle/superscript' } );
	tx.pushRetain( 10 );
	
	var	bold = { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } },
		underline = { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } },
		underSuper = $.extend( {}, underline,
			{ '{"type":"textStyle/superscript"}': { 'type': 'textStyle/superscript' } }
		),
		expectedData = ve.dm.example.data.slice( 0 );
	expectedData[1] = [ 'a', bold ];
	expectedData[2] = [ 'b', bold ];
	expectedData[3] = [ 'c', bold ];
	expectedData[9] = [ 'd', bold ];
	expectedData[19] = [ 'f', underline ];
	expectedData[28] = [ 'g', underSuper ];
	
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), expectedData,
		'Complex annotation transaction commits correctly' );
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data,
		'Complex annotation transaction rolls back correctly' );
} );

test( 'attribute', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	var tx = new ve.dm.Transaction();
	var expectedData = ve.dm.example.data.slice( 0 );
	tx.pushReplaceElementAttribute( 'level', 1, 2 );
	tx.pushRetain( 11 );
	tx.pushReplaceElementAttribute( 'styles', ['bullet'], ['number'] );
	expectedData[0].attributes.level = 2;
	expectedData[11].attributes.styles = ['number'];
	
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), expectedData,
		   'Attribute transaction replaces attributes correctly' );
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data,
		   'Attribute transaction rolls back correctly' );
	
	// TODO test attribute addition/removal
	
	doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	tx = new ve.dm.Transaction();
	tx.pushRetain( 1 );
	tx.pushReplaceElementAttribute( 'foo', 23, 42 );
	raises(
		function() { ve.dm.TransactionProcessor.commit( doc, tx ); },
		/^Invalid element error. Can not set attributes on non-element data.$/,
		'Trying to replace attributes on content results in an exception'
	);
} );

test( 'replace', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	var tx = new ve.dm.Transaction();
	var expectedData = ve.dm.example.data.slice( 0 );
	tx.pushRetain( 1 );
	tx.pushReplace( [ 'a' ], [ 'F', 'O', 'O' ] );
	expectedData.splice( 1, 1, 'F', 'O', 'O' );
	
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), expectedData,
		   'Replace transaction replaces content correctly' );
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data,
		   'Replace transaction rolls back correctly' );
} );