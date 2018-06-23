/*!
 * VisualEditor DataModel SourceSurfaceFragment tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.SourceSurfaceFragment' );

/* Tests */

QUnit.test( 'insertContent/insertDocument', function ( assert ) {
	var doc = ve.dm.example.createExampleDocumentFromData( [ { type: 'paragraph' }, { type: '/paragraph' }, { type: 'internalList' }, { type: '/internalList' } ] ),
		surface = new ve.dm.Surface( doc, { sourceMode: true } ),
		fragment = surface.getLinearFragment( new ve.Range( 1 ) );

	fragment.insertContent( [ { type: 'heading', attributes: { level: 1 } }, 'a', { type: '/heading' } ] );
	assert.deepEqual(
		doc.getData( doc.getDocumentRange() ),
		[ { type: 'paragraph' } ].concat( '<h1>a</h1>'.split( '' ) ).concat( [ { type: '/paragraph' } ] ),
		'Heading converted to HTML'
	);

	surface.undo();

	fragment.insertContent( 'foo\nbar' );
	assert.deepEqual(
		doc.getData( doc.getDocumentRange() ),
		[
			{ type: 'paragraph' },
			'f', 'o', 'o',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'b', 'a', 'r',
			{ type: '/paragraph' }
		],
		'Newline in string split to paragraphs'
	);

	fragment = surface.getLinearFragment( new ve.Range( 3, 7 ) );

	fragment.insertContent( 'foo\nbar' );
	assert.deepEqual(
		doc.getData( doc.getDocumentRange() ),
		[
			{ type: 'paragraph' },
			'f', 'o', 'f', 'o', 'o',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'b', 'a', 'r', 'a', 'r',
			{ type: '/paragraph' }
		],
		'Multiline into string'
	);

	surface.undo();
	surface.undo();

	fragment.insertDocument( new ve.dm.Document( [
		{ type: 'paragraph' },
		'f', '\n', 'o', '\n', 'o', '\n', 'b', '\n', 'a', '\n', 'r',
		{ type: '/paragraph' }
	] ) );
	assert.deepEqual(
		doc.getData( doc.getDocumentRange() ),
		[
			{ type: 'paragraph' },
			'f',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'o',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'o',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'b',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'a',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			'r',
			{ type: '/paragraph' },
			{ type: 'paragraph' },
			{ type: '/paragraph' }
		],
		'Newline in string split to paragraphs'
	);

} );
