module( 've.dm.DocumentSynchronizer' );

/* Tests */

test( 'getDocument', 1, function() {
	var doc = new ve.dm.Document( ve.dm.example.data.slice( 0 ) ),
		ds = new ve.dm.DocumentSynchronizer( doc );
	strictEqual( ds.getDocument(), doc );
} );

