/*!
 * VisualEditor DataModel LeafNode tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.LeafNode' );

/* Stubs */

ve.dm.LeafNodeStub = function VeDmLeafNodeStub() {
	// Parent constructor
	ve.dm.LeafNodeStub.super.apply( this, arguments );
};

OO.inheritClass( ve.dm.LeafNodeStub, ve.dm.LeafNode );

ve.dm.LeafNodeStub.static.name = 'leaf-stub';

ve.dm.LeafNodeStub.static.matchTagNames = [];

ve.dm.nodeFactory.register( ve.dm.LeafNodeStub );

/* Tests */

QUnit.test( 'canHaveChildren', ( assert ) => {
	const node = new ve.dm.LeafNodeStub();
	assert.false( node.canHaveChildren() );
} );

QUnit.test( 'canHaveChildrenNotContent', ( assert ) => {
	const node = new ve.dm.LeafNodeStub();
	assert.false( node.canHaveChildrenNotContent() );
} );

QUnit.test( 'getAnnotations', ( assert ) => {
	const element = { type: 'leaf-stub' },
		node = new ve.dm.LeafNodeStub( element );
	assert.deepEqual( node.getAnnotations(), [], 'undefined .annotations returns empty set' );
	assert.strictEqual( element.annotations, undefined, 'no .annotations property added' );
	element.annotations = [ 0 ];
	assert.deepEqual( node.getAnnotations(), [ 0 ], 'annotations retrieve indexes when set' );
} );
