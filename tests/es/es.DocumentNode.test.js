module( 'es/bases' );

test( 'es.DocumentNode.getCommonAncestorPaths', 14, function() {
	var documentModel = es.DocumentModel.newFromPlainObject( esTest.obj ), result;
	
	var list = documentModel.children[1].children[0].children[0].children[1];
	result = es.DocumentNode.getCommonAncestorPaths( list, list );
	// Test 1
	ok( result.commonAncestor == list, 'same nodes (commonAncestor)' );
	// Test 2
	ok( es.compareArrays( result.node1Path, [] ), 'adjacent list items (node1Path)' );
	// Test 3
	ok( es.compareArrays( result.node2Path, [] ), 'adjacent list items (node2Path)' );
	
	result = es.DocumentNode.getCommonAncestorPaths( list.children[0], list.children[1] );
	// Test 4
	ok( result.commonAncestor == list, 'adjacent list items (commonAncestor)' );
	// Test 5
	ok( es.compareArrays( result.node1Path, [ list.children[0] ] ), 'adjacent list items (node1Path)' );
	// Test 6
	ok( es.compareArrays( result.node2Path, [ list.children[1] ] ), 'adjacent list items (node2Path)' );
	
	result = es.DocumentNode.getCommonAncestorPaths( list.children[0], list.children[2] );
	// Test 7
	ok( result.commonAncestor == list, 'non-adjacent sibling list items (commonAncestor)' );
	// Test 8
	ok( es.compareArrays( result.node1Path, [ list.children[0] ] ), 'non-adjacent sibling list items (node1Path)' );
	// Test 9
	ok( es.compareArrays( result.node2Path, [ list.children[2] ] ), 'non-adjacent sibling list items (node2Path)' );
	
	result = es.DocumentNode.getCommonAncestorPaths( list.children[0].children[0], list.children[2].children[0] );
	// Test 10
	ok( result.commonAncestor == list, 'paragraphs inside list items (commonAncestor)' );
	// Test 11
	ok( es.compareArrays( result.node1Path, [ list.children[0].children[0], list.children[0] ] ), 'paragraphs inside list items (node1Path)' );
	// Test 12
	ok( es.compareArrays( result.node2Path, [ list.children[2].children[0], list.children[2] ] ), 'paragraphs inside list items (node2Path)' );
	
	result = es.DocumentNode.getCommonAncestorPaths( list.children[0].children[0], list.children[2] );
	// Test 13
	equal( result, false, 'nodes of unequal depth' );
	
	result = es.DocumentNode.getCommonAncestorPaths( list, es.DocumentModel.newFromPlainObject( esTest.obj ).children[1] );
	// Test 14
	equal( result, false, 'nodes in different trees' );
} );