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
		fragment = surface.getLinearFragment( new ve.Range( 0 ) );

	fragment.insertContent( [ { type: 'heading', attributes: { level: 1 } }, 'a', { type: '/heading' } ] );
	assert.deepEqual(
		doc.getData( new ve.Range( 0, 12 ) ),
		[ { type: 'paragraph' } ].concat( '<h1>a</h1>'.split( '' ) ).concat( [ { type: '/paragraph' } ] ),
		'Heading converted to HTML'
	);

	fragment.insertContent( 'foo\nbar' );
	assert.deepEqual(
		doc.getData( new ve.Range( 0, 10 ) ),
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

	fragment.insertDocument( new ve.dm.Document( [
		{ type: 'paragraph' },
		'f', '\n', 'o', '\n', 'o', '\n', 'b', '\n', 'a', '\n', 'r',
		{ type: '/paragraph' }
	] ) );
	assert.deepEqual(
		doc.getData( new ve.Range( 0, 18 ) ),
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
			{ type: '/paragraph' }
		],
		'Newline in string split to paragraphs'
	);

} );
