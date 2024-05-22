/*!
 * VisualEditor Node tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.Node' );

/* Stubs */

ve.NodeStub = function VeNodeStub() {
	// Parent constructor
	ve.Node.call( this );
};

OO.inheritClass( ve.NodeStub, ve.Node );

ve.NodeStub.static.name = 'stub';

/* Tests */

QUnit.test( 'getType', ( assert ) => {
	const node = new ve.NodeStub();
	assert.strictEqual( node.getType(), 'stub' );
} );

QUnit.test( 'getParent', ( assert ) => {
	const node = new ve.NodeStub();
	assert.strictEqual( node.getParent(), null );
} );

QUnit.test( 'getRoot', ( assert ) => {
	const node = new ve.NodeStub();
	assert.strictEqual( node.getRoot(), null );
} );
