module( 've.dm.BranchNode' );

/* Stubs */

ve.dm.BranchNodeStub = function( children ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'branch-stub', children );
};

ve.dm.BranchNodeStub.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true
};

ve.extendClass( ve.dm.BranchNodeStub, ve.dm.BranchNode );

ve.dm.factory.register( 'branch-stub', ve.dm.BranchNodeStub );

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

test( 'setDocument', 3, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub( [node1] ),
		node3 = new ve.dm.BranchNodeStub( [node2] ),
		node4 = new ve.dm.BranchNodeStub();
	node3.setDocument( node4 );
	strictEqual( node3.getDocument(), node4 );
	strictEqual( node2.getDocument(), node4 );
	strictEqual( node1.getDocument(), node4 );
} );

test( 'push', 3, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1] );
	node3.on( 'splice', function() {
		// Will be called 1 time
		ok( true, 'splice was emitted' );
	} );
	strictEqual( node3.push( node2 ), 2 );
	deepEqual( node3.getChildren(), [node1, node2] );
} );

test( 'pop', 3, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1, node2] );
	node3.on( 'splice', function() {
		// Will be called 1 time
		ok( true, 'splice was emitted' );
	} );
	strictEqual( node3.pop(), node2 );
	deepEqual( node3.getChildren(), [node1] );
} );

test( 'unshift', 3, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1] );
	node3.on( 'splice', function() {
		// Will be called 1 time
		ok( true, 'splice was emitted' );
	} );
	strictEqual( node3.unshift( node2 ), 2 );
	deepEqual( node3.getChildren(), [node2, node1] );
} );

test( 'shift', 3, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1, node2] );
	node3.on( 'splice', function() {
		// Will be called 1 time
		ok( true, 'splice was emitted' );
	} );
	strictEqual( node3.shift(), node1 );
	deepEqual( node3.getChildren(), [node2] );
} );

test( 'splice', 9, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub(),
		node4 = new ve.dm.BranchNodeStub( [node1, node2] );
	node4.on( 'splice', function() {
		// Will be called 3 times
		ok( true, 'splice was emitted' );
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

test( 'getOffsetFromNode', 4, function() {
	var node1 = new ve.dm.BranchNodeStub(),
		node2 = new ve.dm.BranchNodeStub(),
		node3 = new ve.dm.BranchNodeStub( [node1, node2] ),
		node4 = new ve.dm.BranchNodeStub( [node3] );
	strictEqual( node4.getOffsetFromNode( node1 ), 1 );
	strictEqual( node4.getOffsetFromNode( node2 ), 3 );
	strictEqual( node4.getOffsetFromNode( node3 ), 0 );
	strictEqual( node4.getOffsetFromNode( node4 ), 0 );
} );
