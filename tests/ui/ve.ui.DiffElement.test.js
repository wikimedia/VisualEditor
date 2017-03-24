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
		comment = function ( text ) {
			return '<span rel="ve:Comment" data-ve-comment="' + text + '">&nbsp;</span>';
		},
		cases = [
			{
				msg: 'Simple text change',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo ' +
							'<del data-diff-action="remove">bar</del><ins data-diff-action="insert">car</ins>' +
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
							'<del data-diff-action="remove">bar</del><ins data-diff-action="insert">bXr</ins>' +
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
							'粵文' +
							'<ins data-diff-action="insert">唔</ins>' +
							'係粵語嘅書面語' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Consecutive word partial changes',
				oldDoc: '<p>foo bar baz hello world quux whee</p>',
				newDoc: '<p>foo bar baz hellish work quux whee</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar baz ' +
							'<del data-diff-action="remove">hello world</del>' +
							'<ins data-diff-action="insert">hellish work</ins>' +
							' quux whee' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Only change-adjacent paragraphs are shown',
				oldDoc: '<p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<p>boo</p><p>bar</p><p>baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="remove">foo</p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert">boo</p>' +
					'</div>' +
					'<p data-diff-action="none">bar</p>' +
					spacer
			},
			{
				msg: 'Wrapper paragraphs are made concrete',
				oldDoc: 'foo',
				newDoc: 'boo',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="remove">foo</p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert">boo</p>' +
					'</div>'
			},
			{
				msg: 'Attributes added to ClassAttributeNodes',
				oldDoc: '<figure><img src="foo.jpg"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure><img src="boo.jpg"><figcaption>bar</figcaption></figure>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<figure data-diff-action="structural-change" data-diff-id="0"><img src="boo.jpg" width="0" height="0" alt="null"><figcaption>bar</figcaption></figure>' +
					'</div>'
			},
			{
				msg: 'Attributes added to ClassAttributeNodes with classes',
				oldDoc: '<figure class="ve-align-right"><img src="foo.jpg"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure class="ve-align-right"><img src="boo.jpg"><figcaption>bar</figcaption></figure>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<figure class="ve-align-right" data-diff-action="structural-change" data-diff-id="0"><img src="boo.jpg" width="0" height="0" alt="null"><figcaption>bar</figcaption></figure>' +
					'</div>'
			},
			{
				msg: 'Node inserted',
				oldDoc: '<p>foo</p>',
				newDoc: '<p>foo</p><div rel="ve:Alien">Alien</div>',
				expected:
					'<p data-diff-action="none">foo</p>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div rel="ve:Alien" data-diff-action="insert">Alien</div>' +
					'</div>'
			},
			{
				msg: 'Node removed',
				oldDoc: '<p>foo</p><div rel="ve:Alien">Alien</div>',
				newDoc: '<p>foo</p>',
				expected:
					'<p data-diff-action="none">foo</p>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div rel="ve:Alien" data-diff-action="remove">Alien</div>' +
					'</div>'
			},
			{
				msg: 'Node replaced',
				oldDoc: '<div rel="ve:Alien">Alien</div>',
				newDoc: '<p>Foo</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div rel="ve:Alien" data-diff-action="remove">Alien</div>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert">Foo</p>' +
					'</div>'
			},
			{
				msg: 'Inline node inserted',
				oldDoc: '<p>foo bar baz quux</p>',
				newDoc: '<p>foo bar <!-- whee --> baz quux</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar ' +
							'<ins data-diff-action="insert">' + comment( ' whee ' ) + '</ins>' +
							' baz quux' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Inline node removed',
				oldDoc: '<p>foo bar <!-- whee --> baz quux</p>',
				newDoc: '<p>foo bar baz quux</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar ' +
							'<del data-diff-action="remove">' + comment( ' whee ' ) + '</del>' +
							' baz quux' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Inline node modified',
				oldDoc: '<p>foo bar <!-- whee --> baz quux</p>',
				newDoc: '<p>foo bar <!-- wibble --> baz quux</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar ' +
							'<del data-diff-action="remove">' + comment( ' whee ' ) + '</del>' +
							'<ins data-diff-action="insert">' + comment( ' wibble ' ) + '</ins>' +
							' baz quux' +
						'</p>' +
					'</div>'

			},
			{
				msg: 'Paragraphs moved',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '<p>bar</p><p>foo</p>',
				expected:
					'<p data-diff-action="none" data-diff-move="up">bar</p>' +
					'<p data-diff-action="none" data-diff-move="down">foo</p>'
			},
			{
				msg: 'Paragraphs moved and modified',
				oldDoc: '<p>foo bar baz</p><p>quux whee</p>',
				newDoc: '<p>quux whee!</p><p>foo bar baz!</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change" data-diff-move="up">' +
						'<p>quux whee<ins data-diff-action="insert">!</ins></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change" data-diff-move="down">' +
						'<p>foo bar baz<ins data-diff-action="insert">!</ins></p>' +
					'</div>'
			},
			{
				msg: 'Insert table column',
				oldDoc: '<table><tr><td>A</td></tr><tr><td>C</td></tr></table>',
				newDoc: '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<table><tbody>' +
							'<tr><td>A</td>' +
							'<td data-diff-action="structural-insert"><p data-diff-action=\"insert\">B</p></td></tr>' +
							'<tr><td>C</td>' +
							'<td data-diff-action="structural-insert"><p data-diff-action=\"insert\">D</p></td></tr>' +
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
							'<tr><td>A</td><td data-diff-action="structural-remove"><p data-diff-action=\"remove\">B</p></td></tr>' +
							'<tr><td>C</td><td data-diff-action="structural-remove"><p data-diff-action=\"remove\">D</p></td></tr>' +
						'</tbody></table>' +
					'</div>'
			},
			{
				msg: 'Table row removed and cells edited',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td><td>E</td><td>F</td></tr>' +
						'<tr><td>G</td><td>H</td><td>I</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>X</td></tr>' +
						'<tr><td>G</td><td>H</td><td>Y</td></tr>' +
					'</table>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<table><tbody>' +
							'<tr><td>A</td><td>B</td><td><del data-diff-action="remove">C</del><ins data-diff-action="insert">X</ins></td></tr>' +
							'<tr data-diff-action="structural-remove">' +
								'<td data-diff-action="structural-remove"><p data-diff-action=\"remove\">D</p></td>' +
								'<td data-diff-action="structural-remove"><p data-diff-action=\"remove\">E</p></td>' +
								'<td data-diff-action="structural-remove"><p data-diff-action=\"remove\">F</p></td>' +
							'</tr>' +
							'<tr><td>G</td><td>H</td><td><del data-diff-action="remove">I</del><ins data-diff-action="insert">Y</ins></td></tr>' +
						'</tbody></table>' +
					'</div>'
			},
			{
				msg: 'Annotation insertion',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo <b>bar</b> baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <del data-diff-action="remove">bar</del><ins data-diff-action="insert"><b>bar</b></ins> baz</p>' +
					'</div>'
			},
			{
				msg: 'Annotation removal',
				oldDoc: '<p>foo <b>bar</b> baz</p>',
				newDoc: '<p>foo bar baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <del data-diff-action="remove"><b>bar</b></del><ins data-diff-action="insert">bar</ins> baz</p>' +
					'</div>'
			},
			{
				msg: 'Annotation attribute change',
				oldDoc: '<p>foo <a href="quuz">bar</a> baz</p>',
				newDoc: '<p>foo <a href="whee">bar</a> baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <span data-diff-action="change-remove"><a href="quuz" target="_blank">bar</a></span><span data-diff-action="change-insert" data-diff-id="0"><a href="whee" target="_blank">bar</a></span> baz</p>' +
					'</div>'
			},
			{
				msg: 'Nested annotation change',
				oldDoc: '<p><a href="#">foo bar baz</a></p>',
				newDoc: '<p><a href="#">foo <b>bar</b> baz</a></p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p><a href="#" target="_blank">foo <del data-diff-action="remove">bar</del><ins data-diff-action="insert"><b>bar</b></ins> baz</a></p>' +
					'</div>'
			},
			{
				msg: 'Annotation insertion with text change',
				oldDoc: '<p>foo car baz</p>',
				newDoc: '<p>foo <b>bar</b> baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <del data-diff-action="remove">car</del><ins data-diff-action="insert"><b>bar</b></ins> baz</p>' +
					'</div>'
			},
			{
				msg: 'Annotation removal with text change',
				oldDoc: '<p>foo <b>bar</b> baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <del data-diff-action="remove"><b>bar</b></del><ins data-diff-action="insert">car</ins> baz</p>' +
					'</div>'
			},
			{
				msg: 'Comment insertion',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo bar<!--comment--> baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar' +
							'<ins data-diff-action="insert"><span rel="ve:Comment" data-ve-comment="comment">&nbsp;</span></ins>' +
							' baz' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Comment removal',
				oldDoc: '<p>foo bar<!--comment--> baz</p>',
				newDoc: '<p>foo bar baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar' +
							'<del data-diff-action="remove"><span rel="ve:Comment" data-ve-comment="comment">&nbsp;</span></del>' +
							' baz' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'List item insertion',
				oldDoc: '<ul><li><p>foo</p></li><li><p>baz</p></li></ul>',
				newDoc: '<ul><li><p>foo</p></li><li><p>bar</p></li><li><p>baz</p></li></ul>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<ul>' +
							'<li><p>foo</p></li>' +
							'<li data-diff-action=\"structural-insert\"><p data-diff-action=\"insert\">bar</p></li>' +
							'<li><p>baz</p></li>' +
						'</ul>' +
					'</div>'
			},
			{
				msg: 'List item removal',
				oldDoc: '<ul><li><p>foo</p></li><li><p>bar</p></li><li><p>baz</p></li></ul>',
				newDoc: '<ul><li><p>foo</p></li><li><p>baz</p></li></ul>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<ul>' +
							'<li><p>foo</p></li>' +
							'<li data-diff-action=\"structural-remove\"><p data-diff-action=\"remove\">bar</p></li>' +
							'<li><p>baz</p></li>' +
						'</ul>' +
					'</div>'
			},
			{
				msg: 'List item indentation',
				oldDoc: '<ul><li><p>foo</p></li></ul>',
				newDoc: '<ul><li><ul><li><p>foo</p></li></ul></li></ul>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<ul data-diff-action=\"structural-insert\">' +
							'<li data-diff-action=\"structural-insert\"><ul><li><p>foo</p></li></ul></li>' +
						'</ul>' +
					'</div>'
			},
			{
				msg: 'List item deindentation',
				oldDoc: '<ul><li><ul><li><p>foo</p></li></ul></li></ul>',
				newDoc: '<ul><li><p>foo</p></li></ul>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<ul>' +
							// TODO: Add remove classes here
							'<li><p>foo</p></li>' +
						'</ul>' +
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
		assert.strictEqual( diffElement.$document.html(), cases[ i ].expected, cases[ i ].msg );
	}
} );
