/*!
 * VisualEditor DataModel SourceConverter tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.SourceConverter' );

/* Tests */

QUnit.test( 'conversion', ( assert ) => {
	const cases = [
		{
			msg: 'Simple text with language options',
			text: 'foo',
			textFromDataRange: 'foo\n',
			data: [
				{ type: 'paragraph' },
				...'foo',
				{ type: '/paragraph' }
			],
			options: {
				lang: 'he',
				dir: 'rtl'
			}
		},
		{
			msg: 'Multiple lines and whitespace',
			text: 'foo \n\n\tbar\n',
			textFromDataRange: 'foo \n\n\tbar\n\n',
			data: [
				{ type: 'paragraph' },
				...'foo ',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'\tbar',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				{ type: '/paragraph' }
			]
		},
		{
			msg: 'Different newlines are all converted to paragraphs (CR/LF/CRLF)',
			text: 'asd\nasd\rasd\r\nasd',
			textFromDataRange: 'asd\nasd\nasd\nasd\n',
			data: [
				{ type: 'paragraph' },
				...'asd',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'asd',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'asd',
				{ type: '/paragraph' },
				{ type: 'paragraph' },
				...'asd',
				{ type: '/paragraph' }
			],
			textRoundtrip: 'asd\nasd\nasd\nasd'
		}
	];

	cases.forEach( ( caseItem ) => {
		const doc = ve.dm.sourceConverter.getModelFromSourceText( caseItem.text, caseItem.options );
		assert.deepEqual(
			doc.data.data,
			[ ...caseItem.data, { type: 'internalList' }, { type: '/internalList' } ],
			caseItem.msg + ': getModelFromSourceText (data)'
		);
		if ( caseItem.options ) {
			assert.deepEqual(
				{ lang: doc.getLang(), dir: doc.getDir() },
				caseItem.options,
				caseItem.msg + ': getModelFromSourceText (language options)'
			);
		}
		assert.deepEqual(
			ve.dm.sourceConverter.getSourceTextFromModel( doc ),
			caseItem.textRoundtrip || caseItem.text,
			caseItem.msg + ': getSourceTextFromModel'
		);
		assert.deepEqual(
			ve.dm.sourceConverter.getDataFromSourceText( caseItem.text ),
			caseItem.data,
			caseItem.msg + ': getDataFromSourceText'
		);
		assert.deepEqual(
			ve.dm.sourceConverter.getDataFromSourceText( caseItem.text, true ),
			caseItem.data.slice( 1, -1 ),
			caseItem.msg + ': getDataFromSourceText (inline)'
		);
		assert.strictEqual(
			ve.dm.sourceConverter.getSourceTextFromDataRange( caseItem.data ),
			caseItem.textFromDataRange || caseItem.textRoundtrip || caseItem.text,
			caseItem.msg + ': getSourceTextFromDataRange'
		);
		// getSourceTextFromDataRange with a range argument is currently tested by LinearData#getSourceText tests
	} );
} );
