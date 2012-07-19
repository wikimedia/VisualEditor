/**
 * VisualEditor Document tests.
 * 
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

module( 've.Document' );

/* Stubs */

ve.DocumentStub = function( documentNode ) {
	// Inheritance
	ve.Document.call( this, documentNode );
};

ve.extendClass( ve.DocumentStub, ve.Document );

/* Tests */

test( 'getDocumentNode', 1, function() {
	var node = new ve.NodeStub(),
		doc = new ve.DocumentStub( node );
	strictEqual( doc.getDocumentNode( node ), node );
} );
