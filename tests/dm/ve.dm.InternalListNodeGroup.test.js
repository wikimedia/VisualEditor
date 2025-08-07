QUnit.module( 've.dm.InternalListNodeGroup' );

QUnit.test( 'empty', ( assert ) => {
	const nodeGroup = new ve.dm.InternalListNodeGroup();
	assert.deepEqual( nodeGroup.keyedNodes, {} );
	assert.deepEqual( nodeGroup.firstNodes, [] );
	assert.deepEqual( nodeGroup.indexOrder, [] );
	assert.strictEqual( nodeGroup.getAllReuses( 'dummy' ), undefined );
	assert.strictEqual( nodeGroup.getFirstNode( 'dummy' ), undefined );
	assert.deepEqual( nodeGroup.getFirstNodesInIndexOrder(), [] );
	assert.deepEqual( nodeGroup.getKeysInIndexOrder(), [] );
} );

QUnit.test( 'appendNode', ( assert ) => {
	const nodeGroup = new ve.dm.InternalListNodeGroup();

	const node1 = new ve.dm.TextNode( 1 );
	nodeGroup.appendNode( 'key', node1 );
	assert.deepEqual( nodeGroup.firstNodes, [ node1 ] );
	assert.deepEqual( nodeGroup.indexOrder, [ 0 ] );
	assert.deepEqual( nodeGroup.getAllReuses( 'key' ), [ node1 ] );
	assert.deepEqual( nodeGroup.getFirstNode( 'key' ), node1 );
	assert.deepEqual( nodeGroup.getFirstNodesInIndexOrder(), [ node1 ] );
	assert.deepEqual( nodeGroup.getKeysInIndexOrder(), [ 'key' ] );

	const node2 = new ve.dm.TextNode( 1 );
	nodeGroup.appendNode( 'key', node2 );
	assert.deepEqual( nodeGroup.firstNodes, [ node1 ] );
	assert.deepEqual( nodeGroup.indexOrder, [ 0 ] );
	assert.deepEqual( nodeGroup.getAllReuses( 'key' ), [ node1, node2 ] );
	assert.deepEqual( nodeGroup.getFirstNode( 'key' ), node1 );
	assert.deepEqual( nodeGroup.getFirstNodesInIndexOrder(), [ node1 ] );
	assert.deepEqual( nodeGroup.getKeysInIndexOrder(), [ 'key' ] );
} );

QUnit.test( 'appendNodeWithKnownIndex & unsetNode', ( assert ) => {
	const nodeGroup = new ve.dm.InternalListNodeGroup();

	const node1 = new ve.dm.TextNode( 1 );
	nodeGroup.appendNodeWithKnownIndex( 'key1', node1, 2 );
	// Note: We need this incomplete array structure to record the index, but shouldn't expose it
	assert.deepEqual( nodeGroup.firstNodes, [ undefined, undefined, node1 ] );
	assert.deepEqual( nodeGroup.indexOrder, [ 2 ] );
	assert.deepEqual( nodeGroup.getAllReuses( 'key1' ), [ node1 ] );
	assert.deepEqual( nodeGroup.getFirstNode( 'key1' ), node1 );
	assert.deepEqual( nodeGroup.getFirstNodesInIndexOrder(), [ node1 ] );
	assert.deepEqual( nodeGroup.getKeysInIndexOrder(), [ 'key1' ] );

	const node2 = new ve.dm.TextNode( 2 );
	nodeGroup.appendNodeWithKnownIndex( 'key2', node2, 1 );
	assert.deepEqual( nodeGroup.firstNodes, [ undefined, node2, node1 ] );
	assert.deepEqual( nodeGroup.indexOrder, [ 2, 1 ] );
	assert.deepEqual( nodeGroup.getAllReuses( 'key2' ), [ node2 ] );
	assert.deepEqual( nodeGroup.getFirstNode( 'key2' ), node2 );
	assert.deepEqual( nodeGroup.getFirstNodesInIndexOrder(), [ node1, node2 ] );
	assert.deepEqual( nodeGroup.getKeysInIndexOrder(), [ 'key1', 'key2' ] );

	nodeGroup.unsetNode( 'key1', node1 );
	assert.deepEqual( nodeGroup.firstNodes, [ undefined, node2, undefined ] );
	assert.deepEqual( nodeGroup.indexOrder, [ 1 ] );
	assert.strictEqual( nodeGroup.getAllReuses( 'key1' ), undefined );
	assert.strictEqual( nodeGroup.getFirstNode( 'key1' ), undefined );
	assert.deepEqual( nodeGroup.getFirstNodesInIndexOrder(), [ node2 ] );
	assert.deepEqual( nodeGroup.getKeysInIndexOrder(), [ 'key2' ] );
} );

QUnit.test( 'insertNodeInDocumentOrder in reverse document order', ( assert ) => {
	const nodeGroup = new ve.dm.InternalListNodeGroup();

	const node2 = new ve.dm.TextNode( 2 );
	// Node 2 is later in the document but added first
	node2.getOffset = () => 100;
	nodeGroup.insertNodeInDocumentOrder( 'key', node2 );

	const node1 = new ve.dm.TextNode( 1 );
	nodeGroup.insertNodeInDocumentOrder( 'key', node1 );

	// Even if added in reverse order, document order was respected
	assert.deepEqual( nodeGroup.getAllReuses( 'key' ), [ node1, node2 ] );
	assert.deepEqual( nodeGroup.getFirstNode( 'key' ), node1 );
} );

QUnit.test( 'insertNodeInDocumentOrder with known index', ( assert ) => {
	const nodeGroup = new ve.dm.InternalListNodeGroup();
	const node1 = new ve.dm.TextNode( 1 );
	const node2 = new ve.dm.TextNode( 2 );

	nodeGroup.insertNodeInDocumentOrder( 'key2', node2, 2 );
	nodeGroup.insertNodeInDocumentOrder( 'key1', node1, 1 );

	// TODO: Can we hide these private properties? We don't need the "known index" above then!
	assert.deepEqual( nodeGroup.firstNodes, [ undefined, node1, node2 ] );
	assert.deepEqual( nodeGroup.indexOrder, [ 2, 1 ] );

	// This will always be the same, no matter what the known indexes above are
	assert.deepEqual( nodeGroup.getKeysInIndexOrder(), [ 'key2', 'key1' ] );
} );
