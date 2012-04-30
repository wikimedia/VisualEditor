module( 've.dm.Document' );

/* Tests */

test( 'rebuildNodes', 88, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		documentNode = doc.getDocumentNode();
	doc.rebuildNodes( documentNode, 1, 1, 5, 30 );
	// Test count: ( ( 4 tests x 16 branch nodes ) + ( 3 tests x 8 leaf nodes ) ) = 88
	ve.dm.example.nodeTreeEqual( documentNode, ve.dm.example.tree );
} );
