/*!
 * VisualEditor DataModel Node tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.Node' );

/* Stubs */

ve.dm.NodeStub = function VeDmNodeStub( length, element ) {
	// Parent constructor
	ve.dm.Node.call( this, length, element );
};

ve.inheritClass( ve.dm.NodeStub, ve.dm.LeafNode );

ve.dm.NodeStub.static.name = 'stub';

ve.dm.NodeStub.static.matchTagNames = [];

ve.dm.nodeFactory.register( ve.dm.NodeStub );

/* Tests */

QUnit.test( 'canHaveChildren', 1, function ( assert ) {
	var node = new ve.dm.NodeStub();
	assert.equal( node.canHaveChildren(), false );
} );

QUnit.test( 'canHaveChildrenNotContent', 1, function ( assert ) {
	var node = new ve.dm.NodeStub();
	assert.equal( node.canHaveChildrenNotContent(), false );
} );

QUnit.test( 'getLength', 2, function ( assert ) {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub( 1234 );
	assert.strictEqual( node1.getLength(), 0 );
	assert.strictEqual( node2.getLength(), 1234 );
} );

QUnit.test( 'getOuterLength', 2, function ( assert ) {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub( 1234 );
	assert.strictEqual( node1.getOuterLength(), 2 );
	assert.strictEqual( node2.getOuterLength(), 1236 );
} );

QUnit.test( 'setLength', 2, function ( assert ) {
	var node = new ve.dm.NodeStub();
	node.setLength( 1234 );
	assert.strictEqual( node.getLength(), 1234 );
	assert.throws(
		function () {
			// Length cannot be negative
			node.setLength( -1 );
		},
		Error,
		'throws exception if length is negative'
	);
} );

QUnit.test( 'adjustLength', 1, function ( assert ) {
	var node = new ve.dm.NodeStub( 1234 );
	node.adjustLength( 5678 );
	assert.strictEqual( node.getLength(), 6912 );
} );

QUnit.test( 'getAttribute', 2, function ( assert ) {
	var node = new ve.dm.NodeStub( 0, { 'type': 'stub', 'attributes': { 'a': 1, 'b': 2 } } );
	assert.strictEqual( node.getAttribute( 'a' ), 1 );
	assert.strictEqual( node.getAttribute( 'b' ), 2 );
} );

QUnit.test( 'setRoot', 1, function ( assert ) {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub();
	node1.setRoot( node2 );
	assert.strictEqual( node1.getRoot(), node2 );
} );

QUnit.test( 'attach', 2, function ( assert ) {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub();
	node1.attach( node2 );
	assert.strictEqual( node1.getParent(), node2 );
	assert.strictEqual( node1.getRoot(), node2 );
} );

QUnit.test( 'detach', 2, function ( assert ) {
	var node1 = new ve.dm.NodeStub(),
		node2 = new ve.dm.NodeStub();
	node1.attach( node2 );
	node1.detach();
	assert.strictEqual( node1.getParent(), null );
	assert.strictEqual( node1.getRoot(), node1 );
} );

QUnit.test( 'canBeMergedWith', 4, function ( assert ) {
	var node1 = new ve.dm.LeafNodeStub(),
		node2 = new ve.dm.BranchNodeStub( [node1] ),
		node3 = new ve.dm.BranchNodeStub( [node2] ),
		node4 = new ve.dm.LeafNodeStub(),
		node5 = new ve.dm.BranchNodeStub( [node4] );

	assert.strictEqual( node3.canBeMergedWith( node5 ), true, 'same level, same type' );
	assert.strictEqual( node2.canBeMergedWith( node5 ), false, 'different level, same type' );
	assert.strictEqual( node2.canBeMergedWith( node1 ), false, 'different level, different type' );
	assert.strictEqual( node2.canBeMergedWith( node4 ), false, 'same level, different type' );
} );

QUnit.test( 'getClonedElement', function ( assert ) {
	var i, node,
		cases = [
			{
				'original': {
					'type': 'foo'
				},
				'clone': {
					'type': 'foo'
				},
				'msg': 'Simple element is cloned verbatim'
			},
			{
				'original': {
					'type': 'foo',
					'attributes': {
						'bar': 'baz'
					}
				},
				'clone': {
					'type': 'foo',
					'attributes': {
						'bar': 'baz'
					}
				},
				'msg': 'Element with simple attributes is cloned verbatim'
			},
			{
				'original': {
					'type': 'foo',
					'attributes': {
						'bar': 'baz',
						'html/0/typeof': 'Foo',
						'html/0/href': 'Bar'
					}
				},
				'clone': {
					'type': 'foo',
					'attributes': {
						'bar': 'baz'
					}
				},
				'msg': 'html/* attributes are removed from clone'
			},
			{
				'original': {
					'type': 'foo',
					'attributes': {
						'html/0/typeof': 'Foo'
					}
				},
				'clone': {
					'type': 'foo'
				},
				'msg': 'attributes object containing only html/* attributes is removed from clone'
			},
			{
				'original': {
					'type': 'foo',
					'attributes': {
						'html': '<foo></foo>'
					}
				},
				'clone': {
					'type': 'foo',
					'attributes': {
						'html': '<foo></foo>'
					}
				},
				'msg': 'html attribute (without slash) is not removed'
			},
			{
				'original': {
					'type': 'foo',
					'internal': {
						'generated': 'wrapper',
						'whitespace': [ undefined, ' ' ]
					}
				},
				'clone': {
					'type': 'foo',
					'internal': {
						'whitespace': [ undefined, ' ' ]
					}
				},
				'msg': 'internal.generated property is removed from clone'
			},
			{
				'original': {
					'type': 'foo',
					'internal': {
						'generated': 'wrapper'
					}
				},
				'clone': {
					'type': 'foo'
				},
				'msg': 'internal property is removed if it only contained .generated'
			},
			{
				'original': {
					'type': 'foo',
					'internal': {
						'generated': 'wrapper'
					},
					'attributes': {
						'html/0/typeof': 'Foo',
						'html/1/href': 'Bar'
					}
				},
				'clone': {
					'type': 'foo'
				},
				'msg': 'internal and attribute properties are both removed'
			},
			{
				'original': {
					'type': 'foo',
					'internal': {
						'generated': 'wrapper',
						'whitespace': [ undefined, ' ' ],
					},
					'attributes': {
						'html/0/typeof': 'Foo',
						'bar': 'baz'
					}
				},
				'clone': {
					'type': 'foo',
					'internal': {
						'whitespace': [ undefined, ' ' ],
					},
					'attributes': {
						'bar': 'baz'
					}
				},
				'msg': 'internal.generated and attributes.html/* are both removed'
			}
		];
	QUnit.expect( cases.length );

	for ( i = 0; i < cases.length; i++ ) {
		node = new ve.dm.NodeStub( 0, cases[i].original );
		assert.deepEqual( node.getClonedElement(), cases[i].clone, cases[i].msg );
	}
} );
