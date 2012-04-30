module( 've.dm.BranchNode' );

/* Stubs */

ve.dm.BranchNodeStub = function( children ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'stub', children );
};

ve.extendClass( ve.dm.BranchNodeStub, ve.dm.BranchNode );

/* Tests */

test( 'setRoot', 3, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub( [node1] ),
		node3 = new ve.dm.BranchNodeStub( [node2] ),
		node4 = new ve.dm.BranchNodeStub();
	node3.setRoot( node4 );
	strictEqual( node3.getRoot(), node4 );
	strictEqual( node2.getRoot(), node4 );
	strictEqual( node1.getRoot(), node4 );
} );

test( 'push', 4, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1] );
	node3.on( 'beforeSplice', function() {
		// Will be called 1 time
		ok( true, 'beforeSplice was emitted' );
	} );
	node3.on( 'afterSplice', function() {
		// Will be called 1 time
		ok( true, 'afterSplice was emitted' );
	} );
	strictEqual( node3.push( node2 ), 2 );
	deepEqual( node3.getChildren(), [node1, node2] );
} );

test( 'pop', 4, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1, node2] );
	node3.on( 'beforeSplice', function() {
		// Will be called 1 time
		ok( true, 'beforeSplice was emitted' );
	} );
	node3.on( 'afterSplice', function() {
		// Will be called 1 time
		ok( true, 'afterSplice was emitted' );
	} );
	strictEqual( node3.pop(), node2 );
	deepEqual( node3.getChildren(), [node1] );
} );

test( 'unshift', 4, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1] );
	node3.on( 'beforeSplice', function() {
		// Will be called 1 time
		ok( true, 'beforeSplice was emitted' );
	} );
	node3.on( 'afterSplice', function() {
		// Will be called 1 time
		ok( true, 'afterSplice was emitted' );
	} );
	strictEqual( node3.unshift( node2 ), 2 );
	deepEqual( node3.getChildren(), [node2, node1] );
} );

test( 'shift', 4, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1, node2] );
	node3.on( 'beforeSplice', function() {
		// Will be called 1 time
		ok( true, 'beforeSplice was emitted' );
	} );
	node3.on( 'afterSplice', function() {
		// Will be called 1 time
		ok( true, 'afterSplice was emitted' );
	} );
	strictEqual( node3.shift(), node1 );
	deepEqual( node3.getChildren(), [node2] );
} );

test( 'splice', 12, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub(),
		node4 = new ve.dm.BranchNodeStub( [node1, node2] );
	node4.on( 'beforeSplice', function() {
		// Will be called 3 times
		ok( true, 'beforeSplice was emitted' );
	} );
	node4.on( 'afterSplice', function() {
		// Will be called 3 times
		ok( true, 'afterSplice was emitted' );
	} );
	// Insert branch
	deepEqual( node4.splice( 1, 0, node3 ), [] );
	deepEqual( node4.getChildren(), [node1, node3, node2] );
	// Remove branch
	deepEqual( node4.splice( 1, 1 ), [node3] );
	deepEqual( node4.getChildren(), [node1, node2] );
	// Remove branch and insert branch
	deepEqual( node4.splice( 1, 1, node3 ), [node2] );
	deepEqual( node4.getChildren(), [node1, node3] );
} );
