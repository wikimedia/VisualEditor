module( 've.dm.DocumentFragment' );

/* Tests */

test( 'getData', 1, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data );
	deepEqual( fragment.getData(), ve.dm.example.data );
} );


test( 'getOffsetMap', 43, function() {
	var fragment = new ve.dm.DocumentFragment( ve.dm.example.data ),
		actual = fragment.getOffsetMap(),
		expected = ve.dm.example.getOffsetMap( fragment.getRootNode() );
	ok( actual.length === expected.length, 'offset map lengths match' );
	for ( var i = 0; i < actual.length; i++ ) {
		ok( actual[i] === expected[i], 'reference at offset ' + i );
	}
} );

/*
test( 'getRootNode', 1, function() {
	//
} );

test( 'getNodeFromOffset', 1, function() {
	//
} );
*/