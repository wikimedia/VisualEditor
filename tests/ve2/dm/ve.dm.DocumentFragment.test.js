module( 've.dm.Document' );

/* Tests */

test( 'getData', 1, function() {
	var parentDocument = new ve.dm.Document(),
		fragment = new ve.dm.DocumentFragment( ve.dm.example.data, parentDocument );
	deepEqual( fragment.getData(), ve.dm.example.data );
} );

/*
test( 'getOffsetMap', 1, function() {
	//
} );

test( 'getRootNode', 1, function() {
	//
} );

test( 'getNodeFromOffset', 1, function() {
	//
} );
*/