/*!
 * VisualEditor ContentEditable Node tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.Node' );

/* Stubs */

ve.ce.NodeStub = function VeCeNodeStub() {
	// Parent constructor
	ve.ce.NodeStub.super.apply( this, arguments );
};

OO.inheritClass( ve.ce.NodeStub, ve.ce.Node );

ve.ce.NodeStub.static.name = 'stub';

ve.ce.nodeFactory.register( ve.ce.NodeStub );

/* Tests */

QUnit.test( 'getModel', ( assert ) => {
	const model = new ve.dm.NodeStub(),
		view = new ve.ce.NodeStub( model );
	assert.strictEqual( view.getModel(), model, 'returns reference to model given to constructor' );
} );

QUnit.test( 'getParent', ( assert ) => {
	const a = new ve.ce.NodeStub( new ve.dm.NodeStub() );
	assert.strictEqual( a.getParent(), null, 'returns null if not attached' );
} );

QUnit.test( 'attach', ( assert ) => {
	const a = new ve.ce.NodeStub( new ve.dm.NodeStub() ),
		b = new ve.ce.NodeStub( new ve.dm.NodeStub() );
	a.on( 'attach', ( parent ) => {
		assert.strictEqual( parent, b, 'attach event is called with parent as first argument' );
	} );
	a.attach( b );
	assert.strictEqual( a.getParent(), b, 'parent is set to given object after attach' );
} );

QUnit.test( 'detach', ( assert ) => {
	const a = new ve.ce.NodeStub( new ve.dm.NodeStub() ),
		b = new ve.ce.NodeStub( new ve.dm.NodeStub() );
	a.attach( b );
	a.on( 'detach', ( parent ) => {
		assert.strictEqual( parent, b, 'detach event is called with parent as first argument' );
	} );
	a.detach();
	assert.strictEqual( a.getParent(), null, 'parent is set null after detach' );
} );
