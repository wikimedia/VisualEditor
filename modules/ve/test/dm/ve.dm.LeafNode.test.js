/*!
 * VisualEditor DataModel LeafNode tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.LeafNode' );

/* Stubs */

ve.dm.LeafNodeStub = function VeDmLeafNodeStub( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 'leaf-stub', length, element );
};

ve.inheritClass( ve.dm.LeafNodeStub, ve.dm.LeafNode );

ve.dm.LeafNodeStub.rules = {
	'isWrapped': true,
	'isContent': true,
	'canContainContent': false,
	'childNodeTypes': []
};

ve.dm.LeafNodeStub.static.name = 'leaf-stub';

ve.dm.LeafNodeStub.static.matchTagNames = [];

ve.dm.nodeFactory.register( 'leaf-stub', ve.dm.LeafNodeStub );

/* Tests */

QUnit.test( 'canHaveChildren', 1, function ( assert ) {
	var node = new ve.dm.LeafNodeStub();
	assert.equal( node.canHaveChildren(), false );
} );

QUnit.test( 'canHaveGrandchildren', 1, function ( assert ) {
	var node = new ve.dm.LeafNodeStub();
	assert.equal( node.canHaveGrandchildren(), false );
} );

QUnit.test( 'getAnnotations', 3, function ( assert ) {
	var element = { 'type': 'leaf-stub' },
		node = new ve.dm.LeafNodeStub( 0, element ),
		annotationSet = new ve.AnnotationSet( [ new ve.dm.TextStyleBoldAnnotation() ] );
	assert.deepEqual( node.getAnnotations(), new ve.AnnotationSet(),
		'undefined .annotations returns empty set' );
	assert.equal( element.annotations, undefined, 'no .annotations property added' );
	element.annotations = annotationSet;
	assert.ok( node.getAnnotations() === annotationSet, 'annotation set is reference equal' );
} );
