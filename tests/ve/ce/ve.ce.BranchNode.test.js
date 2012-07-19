/**
 * VisualEditor content editable BranchNode tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

module( 've.ce.BranchNode' );

/* Stubs */

ve.ce.BranchNodeStub = function( model, $element ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'branch-stub', model, $element );
};

ve.ce.BranchNodeStub.rules = {
	'canBeSplit': true
};

ve.ce.BranchNodeStub.domWrapperElementTypes = {
	'a': 'a',
	'b': 'b'
};

ve.extendClass( ve.ce.BranchNodeStub, ve.ce.BranchNode );

ve.ce.nodeFactory.register( 'branch-stub', ve.ce.BranchNodeStub );

/* Tests */

test( 'canBeSplit', 1, function() {
	var node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub() );
	equal( node.canBeSplit(), true );
} );

test( 'canHaveChildren', 1, function() {
	var node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub() );
	equal( node.canHaveChildren(), true );
} );

test( 'canHaveGrandchildren', 1, function() {
	var node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub() );
	equal( node.canHaveGrandchildren(), true );
} );

test( 'updateDomWrapper', 3, function() {
	var node = new ve.ce.BranchNodeStub( new ve.dm.BranchNodeStub( [], { 'type': 'a' } ) );
	// Add classes and content to the node
	node.$.attr( 'class', 'test' ).text( 'hello' );
	// Modify attribute
	node.getModel().attributes.type = 'b';
	node.updateDomWrapper( 'type' );
	equal( node.$.get( 0 ).nodeName.toLowerCase(), 'b', 'DOM element type gets converted' );
	equal( node.$.hasClass( 'test' ), true, 'old classes are added to new wrapper' );
	equal( node.$.text(), 'hello', 'contents are added to new wrapper' );
} );

test( 'onSplice', 7, function() {
	var modelA = new ve.dm.BranchNodeStub(),
		modelB = new ve.dm.BranchNodeStub(),
		modelC = new ve.dm.BranchNodeStub(),
		viewA = new ve.ce.BranchNodeStub( modelA );
	// Insertion tests
	modelA.splice( 0, 0, modelB, modelC );
	equal( viewA.getChildren().length, 2 );
	deepEqual( viewA.getChildren()[0].getModel(), modelB );
	deepEqual( viewA.getChildren()[1].getModel(), modelC );
	// Removal tests
	modelA.splice( 0, 1 );
	equal( viewA.getChildren().length, 1 );
	deepEqual( viewA.getChildren()[0].getModel(), modelC );
	// Removal and insertion tests
	modelA.splice( 0, 1, modelB );
	equal( viewA.getChildren().length, 1 );
	deepEqual( viewA.getChildren()[0].getModel(), modelB );
} );
