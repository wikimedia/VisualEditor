module( 've/dm' );

test( 've.dm.DocumentSynchronizer', 10, function() {
	var tests = {
		// Test 1
		'resize actions adjust node lengths': {
			'actual': function( sync ) {
				var model = sync.getModel();
				// Delete bold "b" from first paragraph
				model.data.splice( 2, 1 );
				// Push resize action
				sync.pushAction( 'resize', model.getChildren()[0], 0, -1 );
				// Sync
				sync.synchronize();
				return model.getChildren()[0].getContentLength();
			},
			'expected': 2
		},
		// Test 2
		'insert actions can add new nodes in the middle': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }],
					node = ve.dm.DocumentNode.createNodesFromData( data )[0];
				// Insert element after first paragraph
				ve.insertIntoArray( model.data, 5, data );
				// Push insertion action
				sync.pushAction( 'insert', node, 5 );
				// Sync
				sync.synchronize();
				return model.getChildren()[1].getContentData();
			},
			'expected': ['x']
		},
		// Test 3
		'insert actions can add new nodes at the beginning': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }],
					node = ve.dm.DocumentNode.createNodesFromData( data )[0];
				// Insert element after first paragraph
				ve.insertIntoArray( model.data, 0, data );
				// Push insertion action
				sync.pushAction( 'insert', node, 0 );
				// Sync
				sync.synchronize();
				return model.getChildren()[0].getContentData();
			},
			'expected': ['x']
		},
		// Test 4
		'insert actions can add new nodes at the end': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }],
					node = ve.dm.DocumentNode.createNodesFromData( data )[0];
				// Insert element after first paragraph
				ve.insertIntoArray( model.data, 34, data );
				// Push insertion action
				sync.pushAction( 'insert', node, 34 );
				// Sync
				sync.synchronize();
				return model.getChildren()[3].getContentData();
			},
			'expected': ['x']
		},
		// Test 5
		'delete actions can remove nodes from the middle': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					node = model.getChildren()[1];
				// Delete the table
				model.data.splice( 5, 26 );
				// Push deletion action
				sync.pushAction( 'delete', node, 5 );
				// Sync
				sync.synchronize();
				return model.getChildren().length;
			},
			'expected': 2
		},
		// Test 6
		'delete actions can remove nodes from the beginning': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					node = model.getChildren()[0];
				// Delete the first paragraph
				model.data.splice( 0, 5 );
				// Push deletion action
				sync.pushAction( 'delete', node, 0 );
				// Sync
				sync.synchronize();
				return model.getChildren().length;
			},
			'expected': 2
		},
		// Test 7
		'delete actions can remove nodes from the end': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					node = model.getChildren()[2];
				// Delete the first paragraph
				model.data.splice( 31, 3 );
				// Push deletion action
				sync.pushAction( 'delete', node, 31 );
				// Sync
				sync.synchronize();
				return model.getChildren().length;
			},
			'expected': 2
		},
		// Test 8
		'rebuild actions can convert element types': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					node = model.getChildren()[0];
				// Convert the first paragraph to a level 1 heading
				model.data[0].type = 'heading';
				model.data[0].attributes = { 'level': 1 };
				model.data[4].type = '/heading';
				// Push rebuild action
				sync.pushAction( 'rebuild', node, 0 );
				// Sync
				sync.synchronize();
				return model.getChildren()[0].getElementType();
			},
			'expected': 'heading'
		},
		// Test 9
		'rebuild actions can replace one node with more than one node': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					node = model.getChildren()[0],
					data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }];
				// Insert element after first paragraph
				ve.insertIntoArray( model.data, 5, data );
				// Push rebuild action with a length adustment of 3 to account for the new element
				sync.pushAction( 'rebuild', node, 0, 3 );
				// Sync
				sync.synchronize();
				return model.getChildren()[1].getContentData();
			},
			'expected': ['x']
		},
		// Test 10
		'multiple actions can be synchronized together': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }],
					node = ve.dm.DocumentNode.createNodesFromData( data )[0];
				// Delete bold "b" from first paragraph
				model.data.splice( 2, 1 );
				// Push resize action
				sync.pushAction( 'resize', model.getChildren()[0], 0, -1 );
				// Delete the first paragraph (offset adjusted for previous action)
				model.data.splice( 30, 3 );
				// Push deletion action (note: using original offset)
				sync.pushAction( 'delete', model.getChildren()[2], 31 );
				// Insert element after last paragraph
				ve.insertIntoArray( model.data, 30, data );
				// Push insertion action (note: using original offset)
				sync.pushAction( 'insert', node, 34 );
				// Sync
				sync.synchronize();
				return [
					model.getChildren()[0].getContentLength(),
					model.getChildren().length,
					model.getChildren()[2].getContentData()
				];
			},
			'expected': [2, 3, ['x']]
		}
	};

	// Run tests
	for ( var test in tests ) {
		deepEqual(
			tests[test].actual(
				new ve.dm.DocumentSynchronizer(
					ve.dm.DocumentNode.newFromPlainObject( veTest.obj )
				)
			),
			tests[test].expected,
			test
		);
	}
} );
