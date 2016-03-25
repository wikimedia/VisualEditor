/*!
 * VisualEditor ContentEditable Document tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.Document' );

/* Tests */

QUnit.test( 'Converter tests', function ( assert ) {
	var msg, model, view, caseItem, $documentElement,
		expected = 0,
		cases = ve.dm.example.domToDataCases;

	for ( msg in cases ) {
		if ( cases[ msg ].ceHtml ) {
			expected++;
		}
	}

	QUnit.expect( expected );

	for ( msg in cases ) {
		if ( cases[ msg ].ceHtml ) {
			caseItem = ve.copy( cases[ msg ] );
			model = ve.test.utils.getModelFromTestCase( caseItem );
			view = new ve.ce.Document( model );
			$documentElement = view.getDocumentNode().$element;
			// Simplify slugs
			$documentElement.find( '.ve-ce-branchNode-slug' ).contents().remove();
			assert.equalDomElement(
				// Wrap both in plain DIVs as we are only comparing the child nodes
				$( '<div>' ).append( $documentElement.contents() )[ 0 ],
				$( '<div>' ).append( ve.createDocumentFromHtml( caseItem.ceHtml ).body.childNodes )[ 0 ],
				msg
			);
		}
	}
} );

// TODO: getNodeFromOffset
// TODO: getSlugAtOffset
// TODO: getDirectionFromRange

QUnit.test( 'getNodeAndOffset', function ( assert ) {
	var tests, i, iLen, test, parts, view, data, ceDoc, rootNode, offsetCount, offset, position,
		j, jLen, node;

	// Each test below has the following:
	// html: an input document
	// data: the expected DM content
	// positions: the node+offset corresponding to each DM offset, shown by marking pipe
	// characters on a modified HTML representation in which text nodes are wrapped in
	// <#text>...</#text> tags (and most attributes are omitted)
	// dies (optional): a list of DM offsets where getNodeAndOffset is expected to die
	/*jscs:disable validateQuoteMarks */
	tests = [
		{
			title: 'Simple para',
			html: '<p>x</p>',
			data: [ '<paragraph>', 'x', '</paragraph>' ],
			positions: "<div class='ve-ce-branchNode ve-ce-documentNode'>|<p class='ve-ce-branchNode ve-ce-contentBranchNode ve-ce-paragraphNode'><#text>|x|</#text></p></div>"
		},
		{
			title: 'Bold',
			html: '<p>x<b>y</b>z</p>',
			data: [ '<paragraph>', 'x', 'y', 'z', '</paragraph>' ],
			positions: "<div class='ve-ce-branchNode ve-ce-documentNode'>|<p class='ve-ce-branchNode ve-ce-contentBranchNode ve-ce-paragraphNode'><#text>|x|</#text><b class='ve-ce-textStyleAnnotation ve-ce-boldAnnotation'><#text>y|</#text></b><#text>z|</#text></p></div>"
		},
		{
			title: 'Nested block nodes',
			html: '<div><p>x</p></div>',
			data: [ '<div>', '<paragraph>', 'x', '</paragraph>', '</div>' ],
			positions: "<div class='ve-ce-branchNode ve-ce-documentNode'>|<div class='ve-ce-branchNode-slug ve-ce-branchNode-blockSlug'></div><div class='ve-ce-branchNode'>|<p class='ve-ce-branchNode ve-ce-contentBranchNode ve-ce-paragraphNode'><#text>|x|</#text></p>|</div><div class='ve-ce-branchNode-slug ve-ce-branchNode-blockSlug'></div></div>"
		},
		{
			title: 'Slugless emptied paragraph',
			html: '<p></p>',
			replacement: { path: [ 0 ], innerHtml: '' },
			data: [ '<paragraph>', '</paragraph>' ],
			positions: "<div class='ve-ce-branchNode ve-ce-documentNode'>|<p class='ve-ce-branchNode ve-ce-contentBranchNode ve-ce-paragraphNode'>|</p></div>"
		},
		{
			title: 'Slugless emptied paragraph with raw <br> in DOM only',
			html: '<p></p>',
			replacement: { path: [ 0 ], innerHtml: '<br>' },
			data: [ '<paragraph>', '</paragraph>' ],
			positions: "<div class='ve-ce-branchNode ve-ce-documentNode'>|<p class='ve-ce-branchNode ve-ce-contentBranchNode ve-ce-paragraphNode'>|<br></br></p></div>"
		},
		{
			title: 'Paragraph with links',
			html: '<p><a href="A">A</a><a href="B">B</a></p>',
			data: [ '<paragraph>', 'A', 'B', '</paragraph>' ],
			positions: "<div class='ve-ce-branchNode ve-ce-documentNode'>|<p class='ve-ce-branchNode ve-ce-contentBranchNode ve-ce-paragraphNode'>|<img class='ve-ce-nail ve-ce-nail-pre-open'></img><a class='ve-ce-linkAnnotation'><img class='ve-ce-nail ve-ce-nail-post-open'></img><#text>A</#text><img class='ve-ce-nail ve-ce-nail-pre-close'></img></a><img class='ve-ce-nail ve-ce-nail-post-close'></img>|<img class='ve-ce-nail ve-ce-nail-pre-open'></img><a class='ve-ce-linkAnnotation'><img class='ve-ce-nail ve-ce-nail-post-open'></img><#text>B</#text><img class='ve-ce-nail ve-ce-nail-pre-close'></img></a><img class='ve-ce-nail ve-ce-nail-post-close'></img>|</p></div>"
		},
		{
			title: 'Paragraph with links, non-text nodes',
			html: '<p><a href="A"><b>A<img></b></a></p>',
			data: [ '<paragraph>', 'A', '<inlineImage>', '</inlineImage>', '</paragraph>' ],
			positions: "<div class='ve-ce-branchNode ve-ce-documentNode'>|<p class='ve-ce-branchNode ve-ce-contentBranchNode ve-ce-paragraphNode'>|<img class='ve-ce-nail ve-ce-nail-pre-open'></img><a class='ve-ce-linkAnnotation'><img class='ve-ce-nail ve-ce-nail-post-open'></img><b class='ve-ce-textStyleAnnotation ve-ce-boldAnnotation'><#text>A|</#text><img class='ve-ce-leafNode ve-ce-focusableNode ve-ce-imageNode ve-ce-inlineImageNode'></img></b><img class='ve-ce-nail ve-ce-nail-pre-close'></img></a><img class='ve-ce-nail ve-ce-nail-post-close'></img>||<span class='ve-ce-branchNode-slug ve-ce-branchNode-inlineSlug'></span></p></div>"
		}
	];

	/*jscs:enable validateQuoteMarks */

	QUnit.expect( tests.reduce( function ( total, test ) {
		return total + test.positions.replace( /[^|]/g, '' ).length + 2;
	}, 0 ) );

	function showModelItem( item ) {
		if ( item.type ) {
			return '<' + item.type + '>';
		} else if ( Array.isArray( item ) ) {
			return item[ 0 ];
		} else if ( typeof item === 'string' ) {
			return item;
		} else {
			return '(unexpected: ' + item + ')';
		}
	}

	for ( i = 0, iLen = tests.length; i < iLen; i++ ) {
		test = tests[ i ];
		parts = test.positions.split( /[|]/ );
		view = ve.test.utils.createSurfaceViewFromHtml( test.html );
		data = view.getModel().getDocument().data.data
			.slice( 0, -2 )
			.map( showModelItem );
		ceDoc = view.documentView;
		rootNode = ceDoc.getDocumentNode().$element.get( 0 );
		assert.deepEqual( data, test.data, test.title + ' (data)' );

		offsetCount = data.length;
		assert.strictEqual(
			offsetCount,
			test.positions.replace( /[^|]/g, '' ).length,
			test.title + ' (offset count)'
		);

		if ( test.replacement ) {
			node = rootNode;
			for ( j = 0, jLen = test.replacement.path.length; j < jLen; j++ ) {
				node = node.childNodes[ test.replacement.path[ j ] ];
			}
			$( node ).closest(
				'.ve-ce-branchNode,.ve-ce-leafNode'
			).data( 'view' ).removeSlugs();
			node.innerHTML = test.replacement.innerHtml;
		}

		for ( offset = 0; offset < offsetCount; offset++ ) {
			try {
				position = ceDoc.getNodeAndOffset( offset, test.outsideNails );
				if ( test.dies && test.dies.indexOf( offset ) !== -1 ) {
					assert.ok( false, test.title + ' (' + offset + ') does not die' );
					continue;
				}
			} catch ( ex ) {
				assert.ok(
					test.dies && test.dies.indexOf( offset ) !== -1,
					test.title + ' (' + offset + ') dies'
				);
				continue;
			}

			position = ceDoc.getNodeAndOffset( offset, test.outsideNails );
			assert.strictEqual(
				ve.test.utils.serializePosition(
					rootNode,
					ceDoc.getNodeAndOffset( offset, test.outsideNails ),
					{ ignore: '.ve-ce-branchNode-slug>*' }
				),
				[].concat(
					parts.slice( 0, offset + 1 ),
					[ '|' ],
					parts.slice( offset + 1 )
				).join( '' ),
				test.title + ' (' + offset + ')'
			);
		}
		view.destroy();
	}
} );
