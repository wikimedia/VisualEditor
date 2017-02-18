/*!
 * VisualEditor DiffElement Trigger tests.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.DiffElement' );

/* Tests */

QUnit.test( 'Diffing', function ( assert ) {
	var i, len, visualDiff, diffElement,
		oldDoc, newDoc,
		spacer = '<div class="ve-ui-diffElement-spacer">⋮</div>',
		cases = [
			{
				msg: 'Simple text change',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo ' +
							'<del class="ve-ui-diffElement-remove">bar</del> <ins class="ve-ui-diffElement-insert">car</ins>' +
							' baz' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Non semantic whitespace change (no diff)',
				oldDoc: '<p>foo</p>',
				newDoc: '<p>  foo  </p>',
				expected: '<div class="ve-ui-diffElement-no-changes">' + ve.msg( 'visualeditor-diff-no-changes' ) + '</div>'
			},
			{
				msg: 'Simple text change with non-whitespace word break boundaires',
				oldDoc: '<p>foo"bar"baz</p>',
				newDoc: '<p>foo"bXr"baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo"' +
							'<del class="ve-ui-diffElement-remove">bar</del><ins class="ve-ui-diffElement-insert">bXr</ins>' +
							'"baz' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Text change in script with no whitespace',
				oldDoc: '<p>粵文係粵語嘅書面語</p>',
				newDoc: '<p>粵文唔係粵語嘅書面語</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'粵' +
							'<del class="ve-ui-diffElement-remove">文係</del><ins class="ve-ui-diffElement-insert">文唔係</ins>' +
							'粵語嘅書面語' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Only change-adjacent paragraphs are shown',
				oldDoc: '<p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<p>boo</p><p>bar</p><p>baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p class="ve-ui-diffElement-remove">foo</p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p class="ve-ui-diffElement-insert">boo</p>' +
					'</div>' +
					'<p class="ve-ui-diffElement-none">bar</p>' +
					spacer
			},
			{
				msg: 'Wrapper paragraphs are made concrete',
				oldDoc: 'foo',
				newDoc: 'boo',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p class="ve-ui-diffElement-remove">foo</p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p class="ve-ui-diffElement-insert">boo</p>' +
					'</div>'
			},
			{
				msg: 'Classes added to ClassAttributeNodes',
				oldDoc: '<figure><img src="foo.jpg"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure><img src="boo.jpg"><figcaption>bar</figcaption></figure>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<figure class="ve-ui-diffElement-change"><img src="boo.jpg" width="0" height="0" alt="null"><figcaption>bar</figcaption></figure>' +
					'</div>'
			},
			{
				msg: 'Classes added to ClassAttributeNodes with classes',
				oldDoc: '<figure class="ve-align-right"><img src="foo.jpg"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure class="ve-align-right"><img src="boo.jpg"><figcaption>bar</figcaption></figure>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<figure class="ve-align-right ve-ui-diffElement-change"><img src="boo.jpg" width="0" height="0" alt="null"><figcaption>bar</figcaption></figure>' +
					'</div>'
			},
			{
				msg: 'Node inserted',
				oldDoc: '<p>foo</p>',
				newDoc: '<p>foo</p><div rel="ve:Alien">Alien</div>',
				expected:
					'<p class="ve-ui-diffElement-none">foo</p>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div rel="ve:Alien" class="ve-ui-diffElement-insert">Alien</div>' +
					'</div>'
			},
			{
				msg: 'Node removed',
				oldDoc: '<p>foo</p><div rel="ve:Alien">Alien</div>',
				newDoc: '<p>foo</p>',
				expected:
					'<p class="ve-ui-diffElement-none">foo</p>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div rel="ve:Alien" class="ve-ui-diffElement-remove">Alien</div>' +
					'</div>'
			},
			{
				msg: 'Node replaced',
				oldDoc: '<div rel="ve:Alien">Alien</div>',
				newDoc: '<p>Foo</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div rel="ve:Alien" class="ve-ui-diffElement-remove">Alien</div>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p class="ve-ui-diffElement-insert">Foo</p>' +
					'</div>'
			},
			{
				msg: 'Paragraphs moved',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '<p>bar</p><p>foo</p>',
				expected:
					'<p class="ve-ui-diffElement-none ve-ui-diffElement-up">bar</p>' +
					'<p class="ve-ui-diffElement-none ve-ui-diffElement-down">foo</p>'
			},
			{
				msg: 'Paragraphs moved and modified',
				oldDoc: '<p>foo bar baz</p><p>quux whee</p>',
				newDoc: '<p>quux whee!</p><p>foo bar baz!</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change ve-ui-diffElement-up">' +
						'<p>quux <del class="ve-ui-diffElement-remove">whee</del><ins class="ve-ui-diffElement-insert">whee!</ins></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change ve-ui-diffElement-down">' +
						'<p>foo bar <del class="ve-ui-diffElement-remove">baz</del><ins class="ve-ui-diffElement-insert">baz!</ins></p>' +
					'</div>'
			},
			{
				msg: 'Insert table column',
				oldDoc: '<table><tr><td>A</td></tr><tr><td>C</td></tr></table>',
				newDoc: '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<table><tbody>' +
							'<tr><td>A</td><td class="ve-ui-diffElement-insert">B</td></tr>' +
							'<tr><td>C</td><td class="ve-ui-diffElement-insert">D</td></tr>' +
						'</tbody></table>' +
					'</div>'
			},
			{
				msg: 'Remove table column',
				oldDoc: '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>',
				newDoc: '<table><tr><td>A</td></tr><tr><td>C</td></tr></table>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<table><tbody>' +
							'<tr><td>A</td><td class="ve-ui-diffElement-remove">B</td></tr>' +
							'<tr><td>C</td><td class="ve-ui-diffElement-remove">D</td></tr>' +
						'</tbody></table>' +
					'</div>'
			},
			{
				msg: 'Annotation insertion',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo <b>bar</b> baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <span class="ve-ui-diffElement-change-remove">bar</span>  <span class="ve-ui-diffElement-change-insert"><b>bar</b></span> baz</p>' +
					'</div>'
			},
			{
				msg: 'Annotation removal',
				oldDoc: '<p>foo <b>bar</b> baz</p>',
				newDoc: '<p>foo bar baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <span class="ve-ui-diffElement-change-remove"><b>bar</b></span>  <span class="ve-ui-diffElement-change-insert">bar</span> baz</p>' +
					'</div>'
			},
			{
				msg: 'Annotation insertion with text change',
				oldDoc: '<p>foo car baz</p>',
				newDoc: '<p>foo <b>bar</b> baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <del class="ve-ui-diffElement-remove">car</del>  <ins class="ve-ui-diffElement-insert"><b>bar</b></ins> baz</p>' +
					'</div>'
			},
			{
				msg: 'Annotation removal with text change',
				oldDoc: '<p>foo <b>bar</b> baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <del class="ve-ui-diffElement-remove"><b>bar</b></del>  <ins class="ve-ui-diffElement-insert">car</ins> baz</p>' +
					'</div>'
			}
		];

	for ( i = 0, len = cases.length; i < len; i++ ) {
		oldDoc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( cases[ i ].oldDoc ) );
		newDoc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( cases[ i ].newDoc ) );
		// TODO: Differ expects newDoc to be derived from oldDoc and contain all its store data.
		// We may want to remove that assumption from the differ?
		newDoc.getStore().merge( oldDoc.getStore() );
		visualDiff = new ve.dm.VisualDiff( oldDoc, newDoc );
		diffElement = new ve.ui.DiffElement( visualDiff );
		assert.strictEqual( diffElement.$element.html(), cases[ i ].expected, cases[ i ].msg );
	}
} );
