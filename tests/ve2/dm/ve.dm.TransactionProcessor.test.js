module( 've.dm.TransactionProcessor' );

/* Tests */

test( 'commit/rollback', function() {
	var cases = {
		'no operations': {
			'calls': [],
			'process': function( data ) {}
		},
		'retaining': {
			'calls': [['pushRetain', 38]],
			'process': function( data ) {}
		},
		'annotating content': {
			'calls': [
				['pushStartAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 2],
				['pushStartAnnotating', 'clear', { 'type': 'textStyle/italic' }],
				['pushRetain', 2],
				['pushStopAnnotating', 'clear', { 'type': 'textStyle/italic' }],
				['pushRetain', 8],
				['pushStopAnnotating', 'set', { 'type': 'textStyle/bold' }],
				['pushRetain', 4],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/underline' }],
				['pushRetain', 4],
				['pushStartAnnotating', 'set', { 'type': 'textStyle/italic' }],
				['pushRetain', 10]
			],
			'process': function( data ) {
				var b = { '{"type":"textStyle/bold"}': { 'type': 'textStyle/bold' } },
					u = { '{"type":"textStyle/underline"}': { 'type': 'textStyle/underline' } },
					i = { '{"type":"textStyle/italic"}': { 'type': 'textStyle/italic' } };
				data[1] = ['a', b];
				data[2] = ['b', b];
				data[3] = ['c', b];
				data[9] = ['d', b];
				data[19] = ['f', u];
				data[28] = ['g', ve.extendObject( {}, u, i ) ];
			}
		},
		'changing, removing and adding attributes': {
			'calls': [
				['pushReplaceElementAttribute', 'level', 1, 2],
				['pushRetain', 11],
				['pushReplaceElementAttribute', 'style', 'bullet', 'number'],
				['pushReplaceElementAttribute', 'test', undefined, 'abcd'],
				['pushRetain', 26],
				['pushReplaceElementAttribute', 'html/src', 'image.png', undefined]
			],
			'process': function( data ) {
				data[0].attributes.level = 2;
				data[11].attributes.style = 'number';
				data[11].attributes.test = 'abcd';
				delete data[37].attributes['html/src'];
			}
		},
		'changing attributes on non-element data throws an exception': {
			'calls': [
				['pushRetain', 1],
				['pushReplaceElementAttribute', 'foo', 23, 42]
			],
			'exception': /^Invalid element error. Can not set attributes on non-element data.$/
		},
		'replacing content': {
			'calls': [
				['pushRetain', 1],
				['pushReplace', ['a'], ['F', 'O', 'O']]
			],
			'process': function( data ) {
				data.splice( 1, 1, 'F', 'O', 'O' );
			}
		}
	};
	// Run tests
	for ( var msg in cases ) {
		var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) ),
			tx = new ve.dm.Transaction();
		for ( var i = 0; i < cases[msg].calls.length; i++ ) {
			tx[cases[msg].calls[i][0]].apply( tx, cases[msg].calls[i].slice( 1 ) );
		}
		if ( 'process' in cases[msg] ) {
			ve.dm.TransactionProcessor.commit( doc, tx );
			var processed = ve.dm.example.data.slice( 0 );
			cases[msg].process( processed );
			deepEqual( doc.getData(), processed, 'commit: ' + msg );
			ve.dm.TransactionProcessor.rollback( doc, tx );
			deepEqual( doc.getData(), ve.dm.example.data.slice( 0 ), 'rollback: ' + msg );
		} else if ( 'exception' in cases[msg] ) {
			/*jshint loopfunc:true */
			raises(
				function() {
					ve.dm.TransactionProcessor.commit( doc, tx );
				},
				cases[msg].exception,
				'commit: ' + msg
			);
			raises(
				function() {
					ve.dm.TransactionProcessor.rollback( doc, tx );
				},
				cases[msg].exception,
				'rollback: ' + msg
			);
		}
	}
	// Calculate expected assertion count
	expect( ve.getObjectKeys( cases ).length * 2 );
} );
