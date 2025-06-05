/*!
 * VisualEditor ContentEditable LeafNode tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.LeafNode' );

/* Stubs */

ve.ce.LeafNodeStub = function VeCeLeafNodeStub() {
	// Parent constructor
	ve.ce.LeafNodeStub.super.apply( this, arguments );
};

OO.inheritClass( ve.ce.LeafNodeStub, ve.ce.LeafNode );

ve.ce.LeafNodeStub.static.name = 'leaf-stub';

ve.ce.nodeFactory.register( ve.ce.LeafNodeStub );

/* Tests */

QUnit.test( 'splitOnEnter', ( assert ) => {
	const node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	assert.false( node.splitOnEnter() );
} );

QUnit.test( 'canHaveChildren', ( assert ) => {
	const node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	assert.false( node.canHaveChildren() );
} );

QUnit.test( 'canHaveChildrenNotContent', ( assert ) => {
	const node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	assert.false( node.canHaveChildrenNotContent() );
} );
