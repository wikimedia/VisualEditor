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
