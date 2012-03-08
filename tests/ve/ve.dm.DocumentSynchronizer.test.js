module( 've/dm' );

test( 've.dm.TransactionSynchronizer', function() {
	var model,
		sync,
		node,
		data;

	// Test 1 - node resizing

	model = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	sync = new ve.dm.DocumentSynchronizer( model );
	// Delete bold "b" from first paragraph
	model.data.splice( 2, 1 );
	// Push resize action
	sync.pushAction( 'resize', model.getChildren()[0], 0, -1 );
	// Sync
	sync.synchronize();
	equal( model.getChildren()[0].getContentLength(), 2, 'resize actions adjust node lengths' );

	// Test 2 - node insertion (in the middle)

	model = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	sync = new ve.dm.DocumentSynchronizer( model );
	// Insert element after first paragraph
	data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }];
	node = ve.dm.DocumentNode.createNodesFromData( data )[0];
	ve.insertIntoArray( model.data, 5, data );
	// Push insertion action
	sync.pushAction( 'insert', node, 5 );
	// Sync
	sync.synchronize();
	deepEqual( model.getChildren()[1].getContentData(), ['x'], 'insert actions add new nodes' );

	// Test 3 - node insertion (at the start)

	model = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	sync = new ve.dm.DocumentSynchronizer( model );
	// Insert element after first paragraph
	data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }];
	node = ve.dm.DocumentNode.createNodesFromData( data )[0];
	ve.insertIntoArray( model.data, 0, data );
	// Push insertion action
	sync.pushAction( 'insert', node, 0 );
	// Sync
	sync.synchronize();
	deepEqual( model.getChildren()[0].getContentData(), ['x'], 'insert actions add new nodes' );

	// Test 4 - node insertion (at the end)
	model = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );
	sync = new ve.dm.DocumentSynchronizer( model );
	// Insert element after first paragraph
	data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }];
	node = ve.dm.DocumentNode.createNodesFromData( data )[0];
	ve.insertIntoArray( model.data, 34, data );
	// Push insertion action
	sync.pushAction( 'insert', node, 34 );
	// Sync
	sync.synchronize();
	deepEqual( model.getChildren()[3].getContentData(), ['x'], 'insert actions add new nodes' );
} );

