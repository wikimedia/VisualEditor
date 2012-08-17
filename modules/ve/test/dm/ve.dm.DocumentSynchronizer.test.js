/**
 * VisualEditor data model DocumentSynchronizer tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.DocumentSynchronizer' );

/* Tests */

QUnit.test( 'getDocument', 1, function ( assert ) {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		ds = new ve.dm.DocumentSynchronizer( doc );
	assert.strictEqual( ds.getDocument(), doc );
} );

QUnit.test( 'synchronize', 2, function ( assert ) {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		ds = new ve.dm.DocumentSynchronizer( doc );

	// Annotate "a" with bold formatting
	doc.data[1] = ['a', { '{"type":"bold"}': { 'type': 'bold' } }];
	ds.pushAnnotation( new ve.Range( 1, 2 ) );
	doc.getDocumentNode().getChildren()[0].getChildren()[0].on( 'update', function () {
		assert.ok( true, 'annotations trigger update events' );
	} );
	doc.getDocumentNode().getChildren()[0].getChildren()[0].on( 'annotation', function () {
		assert.ok( true, 'annotations trigger annotation events' );
	} );
	ds.synchronize();
} );
