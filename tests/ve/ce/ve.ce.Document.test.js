/**
 * VisualEditor content editable Document tests.
 * 
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

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
