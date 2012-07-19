/**
 * VisualEditor data model TextNode tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

module( 've.dm.TextNode' );

/* Tests */

test( 'getOuterLength', 2, function() {
	var node1 = new ve.dm.TextNode(),
		node2 = new ve.dm.TextNode( 1234 );
	strictEqual( node1.getOuterLength(), 0 );
	strictEqual( node2.getOuterLength(), 1234 );
} );
