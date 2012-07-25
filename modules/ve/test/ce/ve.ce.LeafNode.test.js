/**
 * VisualEditor content editable LeafNode tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

module( 've.ce.LeafNode' );

/* Stubs */

ve.ce.LeafNodeStub = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'leaf-stub', model );
};

ve.ce.LeafNodeStub.rules = {
	'canBeSplit': false
};

ve.extendClass( ve.ce.LeafNodeStub, ve.ce.LeafNode );

ve.ce.nodeFactory.register( 'leaf-stub', ve.ce.LeafNodeStub );

/* Tests */

test( 'canBeSplit', 1, function( assert ) {
	var node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	assert.equal( node.canBeSplit(), false );
} );

test( 'canHaveChildren', 1, function( assert ) {
	var node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	assert.equal( node.canHaveChildren(), false );
} );

test( 'canHaveGrandchildren', 1, function( assert ) {
	var node = new ve.ce.LeafNodeStub( new ve.dm.LeafNodeStub() );
	assert.equal( node.canHaveGrandchildren(), false );
} );
