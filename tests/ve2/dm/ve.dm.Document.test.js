module( 've.dm.Document' );

/* Tests */

test( 'getOuterLength', 1, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data );
	strictEqual(
		fragment.getDocumentNode().getOuterLength(),
		ve.dm.example.data.length,
		'document does not have elements around it'
	);
} );

test( 'rebuildNodes', 114, function() {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		documentNode = doc.getDocumentNode();
	doc.rebuildNodes( documentNode, 1, 1, 5, 30 );
	// Test count: ( ( 4 tests x 21 branch nodes ) + ( 3 tests x 10 leaf nodes ) ) = 114
	ve.dm.example.nodeTreeEqual( documentNode, ve.dm.example.tree );
} );
