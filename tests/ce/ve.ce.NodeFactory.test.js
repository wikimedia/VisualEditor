/*!
 * VisualEditor ContentEditable NodeFactory tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.NodeFactory' );

/* Stubs */

ve.ce.NodeFactoryNodeStub = function VeCeNodeFactoryNodeStub() {};

OO.inheritClass( ve.ce.NodeFactoryNodeStub, ve.ce.LeafNode );

ve.ce.NodeFactoryNodeStub.static.splitOnEnter = true;

ve.ce.NodeFactoryNodeStub.static.name = 'node-factory-node-stub';

ve.ce.NodeFactoryNodeStub.static.getDescription = function () {
	return 'description';
};

/* Tests */

QUnit.test( 'splitNodeOnEnter/getDescription', ( assert ) => {
	const factory = new ve.ce.NodeFactory();

	assert.throws(
		() => {
			factory.splitNodeOnEnter( 'node-factory-node-stub' );
		},
		Error,
		'throws an exception when calling splitNodeOnEnter on an unregistered type'
	);

	assert.throws(
		() => {
			factory.getDescription( new ve.dm.NodeFactoryNodeStub() );
		},
		Error,
		'throws an exception when calling getDescription on an unregistered type'
	);

	factory.register( ve.ce.NodeFactoryNodeStub );

	assert.strictEqual(
		factory.splitNodeOnEnter( 'node-factory-node-stub' ),
		true,
		'splitNodeOnEnter'
	);

	assert.strictEqual(
		factory.getDescription( new ve.dm.NodeFactoryNodeStub() ),
		'description',
		'getDescription'
	);
} );

QUnit.test( 'initialization', ( assert ) => {
	assert.true( ve.ce.nodeFactory instanceof ve.ce.NodeFactory, 'factory is initialized at ve.ce.nodeFactory' );
} );
