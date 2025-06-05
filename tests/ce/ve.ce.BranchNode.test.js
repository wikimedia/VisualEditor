/*!
 * VisualEditor ContentEditable BranchNode tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.BranchNode' );

/* Stubs */

ve.ce.BranchNodeStub = function VeCeBranchNodeStub() {
	// Parent constructor
	ve.ce.BranchNodeStub.super.apply( this, arguments );
};

OO.inheritClass( ve.ce.BranchNodeStub, ve.ce.BranchNode );

ve.ce.BranchNodeStub.static.name = 'branch-stub';

ve.ce.BranchNodeStub.static.splitOnEnter = true;

ve.ce.BranchNodeStub.prototype.getTagName = function () {
	const style = this.model.getAttribute( 'style' ),
		types = { a: 'a', b: 'b' };

	return types[ style ];
};

ve.ce.nodeFactory.register( ve.ce.BranchNodeStub );

/* Tests */

QUnit.test( 'splitOnEnter', ( assert ) => {
	const node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub() );

	assert.true( node.splitOnEnter() );
} );

QUnit.test( 'canHaveChildren', ( assert ) => {
	const node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub() );

	assert.true( node.canHaveChildren() );
} );

QUnit.test( 'canHaveChildrenNotContent', ( assert ) => {
	const node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub() );

	assert.true( node.canHaveChildrenNotContent() );
} );

QUnit.test( 'updateTagName', ( assert ) => {
	const attributes = { style: 'a' },
		node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub( {
			type: 'branch-stub',
			attributes: attributes
		} ) );

	// Add content to the node
	node.$element.text( 'hello' );

	// Modify attribute
	attributes.style = 'b';
	node.updateTagName();

	assert.strictEqual( node.$element.get( 0 ).nodeName.toLowerCase(), 'b', 'DOM element type gets converted' );
	assert.true( node.$element.hasClass( 've-ce-branchNode' ), 'old classes are added to new wrapper' );
	assert.true( !!node.$element.data( 'view' ), 'data added to new wrapper' );
	assert.strictEqual( node.$element.text(), 'hello', 'contents are added to new wrapper' );
} );

QUnit.test( 'getDomPosition', ( assert ) => {
	const ceParent = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub() );

	// Create prior state by attaching manually, to avoid circular dependence on onSplice
	ceParent.$element = $( '<p>' );
	ceParent.children.push(
		// Node with two DOM nodes
		// TODO: The use of BranchNodeStub below is dissonant
		new ve.ce.LeafNode( new ve.dm.BranchNodeStub() ),
		// Node with no DOM nodes
		new ve.ce.LeafNode( new ve.dm.BranchNodeStub() ),
		new ve.ce.LeafNode( new ve.dm.BranchNodeStub() ),
		// TextNode with no annotation
		new ve.ce.TextNode( new ve.dm.BranchNodeStub() ),
		// Node with one DOM node
		new ve.ce.LeafNode( new ve.dm.BranchNodeStub() ),
		// TextNode with some annotation
		new ve.ce.TextNode( new ve.dm.BranchNodeStub() )
	);
	const expectedOffsets = [ 0, 2, 2, 2, 3, 4, 7 ];
	ceParent.children[ 0 ].$element = $( '<img><img>' );
	ceParent.children[ 1 ].$element = $();
	ceParent.children[ 2 ].$element = $();
	ceParent.children[ 3 ].$element = undefined;
	ceParent.children[ 4 ].$element = $( '<img>' );
	ceParent.children[ 5 ].$element = undefined;
	ceParent.$element.empty()
		.append( ceParent.children[ 0 ].$element )
		.append( 'foo' )
		.append( ceParent.children[ 4 ].$element )
		.append( 'bar<b>baz</b>qux' );

	for ( let i = 0, len = ceParent.children.length + 1; i < len; i++ ) {
		const position = ceParent.getDomPosition( i );
		assert.strictEqual( position.node, ceParent.$element.last()[ 0 ], 'i=' + i + ' node' );
		assert.strictEqual( position.offset, expectedOffsets[ i ], 'i=' + i + ' position' );
	}
} );

QUnit.test( 'onSplice', ( assert ) => {
	const modelA = new ve.dm.BranchNodeStub(),
		modelB = new ve.dm.BranchNodeStub(),
		modelC = new ve.dm.BranchNodeStub();

	const viewA = new ve.ce.BranchNodeStub( modelA );

	// Insertion tests
	modelA.splice( 0, 0, modelB, modelC );

	assert.strictEqual( viewA.getChildren().length, 2 );
	const viewB = viewA.getChildren()[ 0 ];
	const viewC = viewA.getChildren()[ 1 ];
	assert.deepEqual( viewB.getModel(), modelB, 'First view child matches model tree' );
	assert.deepEqual( viewC.getModel(), modelC, 'Second view child matches model tree' );

	// Removal tests
	modelA.splice( 0, 1 );
	assert.strictEqual( viewA.getChildren().length, 1 );
	assert.deepEqual( viewA.getChildren()[ 0 ].getModel(), modelC, 'Only view child matches model tree' );
	assert.true( !viewB.getModel(), 'Removed view node was destroyed' );

	// Removal and insertion tests
	modelA.splice( 0, 1, modelB );

	assert.strictEqual( viewA.getChildren().length, 1 );
	assert.deepEqual( viewA.getChildren()[ 0 ].getModel(), modelB, 'Replaced view child matches model tree' );
	assert.true( !viewC.getModel(), 'Replaced view node was destroyed' );
} );
