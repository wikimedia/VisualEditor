module( 've/dm' );

test( 've.dm.DocumentSynchronizer', 11, function() {
	var tests = {
		// Test 1
		'resize actions adjust node lengths': {
			'actual': function( sync ) {
				var model = sync.getModel();
				// Delete bold "b" from first paragraph
				model.data.splice( 2, 1 );
				// Push resize action
				sync.pushResize( model.getChildren()[0], -1 );
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
				sync.pushInsert( node, 5 );
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
				sync.pushInsert( node, 0 );
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
				sync.pushInsert( node, 34 );
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
				sync.pushDelete( node );
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
				sync.pushDelete( node );
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
				sync.pushDelete( node );
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
				sync.pushRebuild( new ve.Range( 0, 5 ), new ve.Range( 0, 5 ) );
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
				sync.pushRebuild( new ve.Range( 0, 5 ), new ve.Range( 0, 8 ) );
				// Sync
				sync.synchronize();
				return model.getChildren()[1].getContentData();
			},
			'expected': ['x']
		},
		// Test 10
		'rebuild actions can unwrap and rewrap multiple nodes': {
			'actual': function( sync ) {
				var	model = sync.getModel(), retval = {}, i,
					node = model.getChildren()[1].getChildren()[0].getChildren()[0],
					unwrappedData = [
						{ 'type': 'paragraph' },
						'd',
						{ 'type': '/paragraph' },
						{ 'type': 'paragraph' },
						'e',
						{ 'type': '/paragraph' },
						{ 'type': 'paragraph' },
						'f',
						{ 'type': '/paragraph' },
						{ 'type': 'paragraph' },
						'g',
						{ 'type': '/paragraph' }
					],
					wrappedData = [
						{ 'type': 'paragraph' },
						'd',
						{ 'type': '/paragraph' },
						{ 'type': 'list' },
						{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
						{ 'type': 'paragraph' },
						'e',
						{ 'type': '/paragraph' },
						{ 'type': '/listItem' },
						{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
						{ 'type': 'paragraph' },
						'f',
						{ 'type': '/paragraph' },
						{ 'type': '/listItem' },
						{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
						{ 'type': 'paragraph' },
						'g',
						{ 'type': '/paragraph' },
						{ 'type': '/listItem' },
						{ 'type': '/list' }
					];
				
				// Unwrap the list in the linear model
				ve.batchedSplice( model.data, 8, wrappedData.length, unwrappedData );
				// Rebuild it
				sync.pushRebuild( new ve.Range( 8, 8 + wrappedData.length ), new ve.Range( 8, 8 + unwrappedData.length ) );
				sync.synchronize();
				retval.afterUnwrap = {
					'numChildren': node.getChildren().length,
					'childContents': []
				};
				for ( i = 0; i < node.getChildren().length; i++ ) {
					retval.afterUnwrap.childContents[i] = node.getChildren()[i].getContentData();
				}
				
				// Rewrap the list in the linear model
				ve.batchedSplice( model.data, 8, unwrappedData.length, wrappedData );
				// Rebuild it
				sync.pushRebuild( new ve.Range( 8, 8 + unwrappedData.length ), new ve.Range( 8, 8 + wrappedData.length ) );
				sync.synchronize();
				retval.afterRewrap = {
					'numChildren': node.getChildren().length,
					'childContents': []
				};
				for ( i = 0; i < node.getChildren().length; i++ ) {
					retval.afterRewrap.childContents[i] = node.getChildren()[i].getContentData();
				}
				
				return retval;
			},
			'expected': {
				'afterUnwrap': {
					'numChildren': 4,
					'childContents': [ ['d'], ['e'], ['f'], ['g'] ]
				},
				'afterRewrap': {
					'numChildren': 2,
					'childContents': [
						['d'],
						[
							{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
							{ 'type': 'paragraph' },
							'e',
							{ 'type': '/paragraph' },
							{ 'type': '/listItem' },
							{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
							{ 'type': 'paragraph' },
							'f',
							{ 'type': '/paragraph' },
							{ 'type': '/listItem' },
							{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
							{ 'type': 'paragraph' },
							'g',
							{ 'type': '/paragraph' },
							{ 'type': '/listItem' }
						]
					]
				}
			}
		},
		// Test 11
		'multiple actions can be synchronized together': {
			'actual': function( sync ) {
				var model = sync.getModel(),
					data = [{ 'type': 'paragraph' }, 'x', { 'type': '/paragraph' }],
					node = ve.dm.DocumentNode.createNodesFromData( data )[0];
				// Delete bold "b" from first paragraph
				model.data.splice( 2, 1 );
				// Push resize action
				sync.pushResize( model.getChildren()[0], -1 );
				// Delete the first paragraph (offset adjusted for previous action)
				model.data.splice( 30, 3 );
				// Push deletion action
				sync.pushDelete( model.getChildren()[2] );
				// Insert element after last paragraph
				ve.insertIntoArray( model.data, 30, data );
				// Push insertion action (note: using original offset)
				sync.pushInsert( node, 34 );
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
