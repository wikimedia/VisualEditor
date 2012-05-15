module( 've.ce.Document' );

/* Tests */

test( 'selectNodes', function() {
	var doc = new ve.ce.Document( new ve.dm.Document( ve.dm.example.data ) ),
		cases = ve.example.getSelectNodesCases( doc );
	for ( var i = 0; i < cases.length; i++ ) {
		deepEqual(
			ve.example.getNodeSelectionSummary( cases[i].actual ),
			ve.example.getNodeSelectionSummary( cases[i].expected ),
			cases[i].msg
		);
	}
} );
