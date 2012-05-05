module( 've.dm.TransactionProcessor' );

/* Tests */

test( 'retain', 2, function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	
	// Transaction for retaining part of the document (lettting the processor retain the rest)
	var tx = new ve.dm.Transaction();
	tx.pushRetain( 38 );
	
	// Commit and test
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data,
		'commits retain transaction without changing data' );
	
	// Roll back and test
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data,
		'rolls back retain transaction without changing data' );
} );

test( 'annotate', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	
	// Transaction for setting and clearing various annotations
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
	
	// Expected document data after transaction
	var data = ve.dm.example.data.slice( 0 );
	data[1] = [ 'a', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ];
	data[2] = [ 'b', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ];
	data[3] = [ 'c', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ];
	data[9] = [ 'd', { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } } ];
	data[19] = [ 'f', { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } } ];
	data[28] = [ 'g', {
		'{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' },
		'{"type":"textStyle/superscript"}': { 'type': 'textStyle/superscript' }
	} ];
	
	// Commit and test
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), data, 'commits complex annotation transaction' );
	
	// Roll back and test
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data, 'rolls back complex annotation' );
} );

test( 'attribute', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );
	
	// Expected document data after transaction
	var data = doc.getData();
	data[0].attributes.level = 2;
	data[11].attributes.style = 'number';
	data[11].attributes.test = 'abcd';
	delete data[37].attributes['html/src'];
	
	// Transaction for adding, changing and removing attributes
	var tx = new ve.dm.Transaction();
	tx.pushReplaceElementAttribute( 'level', 1, 2 );
	tx.pushRetain( 11 );
	tx.pushReplaceElementAttribute( 'style', 'bullet', 'number' );
	tx.pushReplaceElementAttribute( 'test', undefined, 'abcd' );
	tx.pushRetain( 26 );
	tx.pushReplaceElementAttribute( 'html/src', 'image.png', undefined );
	
	// Commit and test
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), data, 'commits attribute changes' );
	
	// Roll back and test
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data, 'rolls back attribute changes' );
	
	// Transaction for setting attributes on non-element data
	tx = new ve.dm.Transaction();
	tx.pushRetain( 1 );
	tx.pushReplaceElementAttribute( 'foo', 23, 42 );

	// Test exception when committing
	raises(
		function() { ve.dm.TransactionProcessor.commit( doc, tx ); },
		/^Invalid element error. Can not set attributes on non-element data.$/,
		'throws exception when trying to replace attributes on content'
	);
} );

test( 'replace', function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) );

	// Transaction that replaces "a" with "FOO"
	var tx = new ve.dm.Transaction();
	tx.pushRetain( 1 );
	tx.pushReplace( [ 'a' ], [ 'F', 'O', 'O' ] );

	// Expected document data after transaction
	var data = ve.dm.example.data.slice( 0 );
	data.splice( 1, 1, 'F', 'O', 'O' );
	
	// Commit and test
	ve.dm.TransactionProcessor.commit( doc, tx );
	deepEqual( doc.getData(), data, 'commits content replace transaction' );

	// Roll back and test
	ve.dm.TransactionProcessor.rollback( doc, tx );
	deepEqual( doc.getData(), ve.dm.example.data, 'rolls back content replace transaction' );
} );
