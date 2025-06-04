/*!
 * VisualEditor UserInterface UrlStringTransferHandler tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.UrlStringTransferHandler' );

/* Tests */

/**
 * @param {QUnit.Assert} assert
 * @param {Object} caseItem
 * @param {string} caseItem.pasteString
 * @param {string} caseItem.pasteHtml
 * @param {string} caseItem.pasteType
 * @param {Function} caseItem.expectedData
 * @param {string} caseItem.base
 * @param {string} caseItem.msg
 */
ve.test.utils.runUrlStringHandlerTest = function ( assert, caseItem ) {
	if ( arguments.length > 2 ) {
		caseItem = {
			pasteString: arguments[ 1 ],
			pasteHtml: arguments[ 2 ],
			pasteType: arguments[ 3 ],
			expectedData: arguments[ 4 ],
			base: arguments[ 5 ],
			msg: arguments[ 6 ]
		};
	}
	const done = assert.async(),
		item = ve.ui.DataTransferItem.static.newFromString( caseItem.pasteString, caseItem.pasteType, caseItem.pasteHtml ),
		doc = ve.dm.example.createExampleDocument( undefined, undefined, caseItem.base ),
		mockSurface = {
			getModel: () => ( {
				getDocument: () => doc
			} )
		},
		linkAction = ve.ui.actionFactory.create( 'link', mockSurface ),
		makeLinkAnnotation = function ( href ) {
			return linkAction.getLinkAnnotation( href ).element;
		};

	// Invoke the handler
	const handler = ve.ui.dataTransferHandlerFactory.create( 'urlString', mockSurface, item );

	handler.getInsertableData().done( ( actualData ) => {
		ve.dm.example.postprocessAnnotations( actualData, doc.getStore() );
		assert.equalLinearData( actualData, caseItem.expectedData( makeLinkAnnotation ), caseItem.msg + ': data match' );
		done();
	} );
};

QUnit.test( 'paste', ( assert ) => {
	const cases = [
		{
			msg: 'Simple external link',
			pasteString: 'http://example.com',
			pasteType: 'text/plain',
			expectedData: ( makeAnnotation ) => ve.dm.example.annotateText( 'http://example.com', makeAnnotation( 'http://example.com' ) )
		},
		{
			msg: 'DnD standard URI list without HTML',
			pasteString: '#comment\nhttp://example.com\n',
			pasteType: 'text/uri-list',
			expectedData: ( makeAnnotation ) => ve.dm.example.annotateText( 'http://example.com', makeAnnotation( 'http://example.com' ) )
		},
		{
			msg: 'DnD standard URI list with HTML',
			pasteString: '#comment\nhttp://example.com\n',
			pasteType: 'text/uri-list',
			pasteHtml: '<a href="http://example.com/foo">Foo</a>',
			expectedData: ( makeAnnotation ) => ve.dm.example.annotateText( 'Foo', makeAnnotation( 'http://example.com/foo' ) )
		},
		{
			msg: 'Mozilla URI list',
			pasteString: 'http://example.com\n[[Foo]]\nhttp://example.org\nBar',
			pasteType: 'text/x-moz-url',
			expectedData: ( makeAnnotation ) => [
				...ve.dm.example.annotateText( '[[Foo]]', makeAnnotation( 'http://example.com' ) ),
				' ',
				...ve.dm.example.annotateText( 'Bar', makeAnnotation( 'http://example.org' ) )
			]
		},
		{
			msg: 'Microsoft Edge, format used when copying from the address bar',
			pasteString: '{"description":"","domain":"example.com","filtered_terms":["exampl","exampl","domain"],"image_url":"","keywords":"","preferred_format":"text/html;content=titled-hyperlink","title":"Example Domain","type":"website","url":"https://example.com/"}',
			pasteType: 'text/link-preview',
			expectedData: ( makeAnnotation ) => ve.dm.example.annotateText( 'Example Domain', makeAnnotation( 'https://example.com/' ) )
		}
	];

	cases.forEach( ( caseItem ) => {
		ve.test.utils.runUrlStringHandlerTest(
			assert,
			{
				base: ve.dm.example.baseUri,
				...caseItem
			}
		);
	} );
} );
