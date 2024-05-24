/*!
 * VisualEditor DataModel SourceSurfaceFragment tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.SourceSurfaceFragment' );

/* Tests */

QUnit.test( 'insertContent/insertDocument', ( assert ) => {
	const cases = [
		{
			msg: 'Heading converted to HTML',
			insert: [
				{ type: 'heading', attributes: { level: 1 } },
				'a',
				{ type: '/heading' }
			],
			expected: [
				{ type: 'paragraph' },
				...'<h1>a</h1>',
				{ type: '/paragraph' }
			]
		},
		{
			msg: 'Simple text insert',
			insert: 'foo',
			expected: [
				{ type: 'paragraph' },
				...'foo',
				{ type: '/paragraph' }
			]
		},
		{
			msg: 'Newline in string split to paragraphs',
			insert: 'foo\nbar',
			expected: [
				{ type: 'paragraph' },
				...'foo',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'bar',
				{ type: '/paragraph' }
			]
		},
		{
			msg: 'Multiline into string',
			data: [
				{ type: 'paragraph' },
				...'foo',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'bar',
				{ type: '/paragraph' },
				{ type: 'internalList' },
				{ type: '/internalList' }
			],
			range: new ve.Range( 3, 7 ),
			insert: 'foo\nbar',
			expected: [
				{ type: 'paragraph' },
				...'fofoo',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'barar',
				{ type: '/paragraph' }
			]
		},
		{
			msg: 'Newline in string split to paragraphs',
			insert: new ve.dm.Document( [
				{ type: 'paragraph' },
				'f', '\n', 'o', '\n', 'o', '\n', 'b', '\n', 'a', '\n', 'r',
				{ type: '/paragraph' }
			] ),
			expected: [
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
			]
		}
	];

	cases.forEach( ( caseItem ) => {
		const doc = ve.dm.example.createExampleDocumentFromData( caseItem.data || [ { type: 'paragraph' }, { type: '/paragraph' }, { type: 'internalList' }, { type: '/internalList' } ] ),
			surface = new ve.dm.Surface( doc, { sourceMode: true } ),
			fragment = surface.getLinearFragment( caseItem.range || new ve.Range( 1 ) ),
			done = assert.async();

		if ( caseItem.insert instanceof ve.dm.Document ) {
			fragment.insertDocument( caseItem.insert );
		} else {
			fragment.insertContent( caseItem.insert );
		}
		fragment.getPending().then( () => {
			assert.deepEqual(
				doc.getData( doc.getDocumentRange() ),
				caseItem.expected,
				caseItem.msg
			);
			done();
		} );
	} );
} );
