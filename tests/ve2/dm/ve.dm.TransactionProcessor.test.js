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
