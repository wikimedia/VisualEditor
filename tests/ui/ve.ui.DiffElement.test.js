/*!
 * VisualEditor DiffElement tests.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.DiffElement' );

/* Tests */

QUnit.test( 'Diffing', function ( assert ) {
	var spacer = '<div class="ve-ui-diffElement-spacer">⋮</div>',
		noChanges = '<div class="ve-ui-diffElement-no-changes">' + ve.msg( 'visualeditor-diff-no-changes' ) + '</div>',
		comment = ve.dm.example.commentNodePreview,
		cases = [
			{
				msg: 'Simple text change',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<p>' +
						'foo ' +
						'<del data-diff-action="remove">bar</del><ins data-diff-action="insert">car</ins>' +
						' baz' +
					'</p>'
			},
			{
				msg: 'Complex text change',
				oldDoc: '<p>foo quux at bar</p>',
				newDoc: '<p>foo, quux at the bar</p>',
				expected:
					'<p>' +
						'foo' +
						'<ins data-diff-action="insert">,</ins>' +
						' quux at' +
						'<ins data-diff-action="insert"> the</ins>' +
						' bar' +
					'</p>'
			},
			{
				msg: 'Forced time out',
				forceTimeout: true,
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<p data-diff-action="remove">' +
						'foo bar baz' +
					'</p>' +
					'<p data-diff-action="insert">' +
						'foo car baz' +
					'</p>'
			},
			{
				msg: 'Minimal text change',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo bar! baz</p>',
				expected:
					'<p>' +
						'foo bar' +
						'<ins data-diff-action="insert">!</ins>' +
						' baz' +
					'</p>'
			},
			{
				msg: 'Minimal text change at start of paragraph',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo! bar baz</p>',
				expected:
					'<p>' +
						'foo' +
						'<ins data-diff-action="insert">!</ins>' +
						' bar baz' +
					'</p>'
			},
			{
				msg: 'Minimal text change at end of paragraph',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo bar !baz</p>',
				expected:
					'<p>' +
						'foo bar ' +
						'<ins data-diff-action="insert">!</ins>' +
						'baz' +
					'</p>'
			},
			{
				msg: 'Non semantic whitespace change (no diff)',
				oldDoc: '<p>foo</p>',
				newDoc: '<p>  foo  </p>',
				expected: noChanges
			},
			{
				msg: 'Simple text change with non-whitespace word break boundaires',
				oldDoc: '<p>foo"bar"baz</p>',
				newDoc: '<p>foo"bXr"baz</p>',
				expected:
					'<p>' +
						'foo"' +
						'<del data-diff-action="remove">bar</del><ins data-diff-action="insert">bXr</ins>' +
						'"baz' +
					'</p>'
			},
			{
				msg: 'Text change in script with no whitespace',
				oldDoc: '<p>粵文係粵語嘅書面語</p>',
				newDoc: '<p>粵文唔係粵語嘅書面語</p>',
				expected:
					'<p>' +
						'粵文' +
						'<ins data-diff-action="insert">唔</ins>' +
						'係粵語嘅書面語' +
					'</p>'
			},
			{
				msg: 'Consecutive word partial changes',
				oldDoc: '<p>foo bar baz hello world quux whee</p>',
				newDoc: '<p>foo bar baz hellish work quux whee</p>',
				expected:
					'<p>' +
						'foo bar baz ' +
						'<del data-diff-action="remove">hello world</del>' +
						'<ins data-diff-action="insert">hellish work</ins>' +
						' quux whee' +
					'</p>'
			},
			{
				msg: 'Only change-adjacent paragraphs are shown',
				oldDoc: '<p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<p>boo</p><p>bar</p><p>baz</p>',
				expected:
					'<p data-diff-action="remove">foo</p>' +
					'<p data-diff-action="insert">boo</p>' +
					'<p data-diff-action="none">bar</p>' +
					spacer
			},
			{
				msg: 'Only change-adjacent paragraphs are shown (div wrapped doc)',
				oldDoc: '<div><p>foo</p><p>bar</p><p>baz</p></div>',
				newDoc: '<div><p>boo</p><p>bar</p><p>baz</p></div>',
				expected:
					'<div>' +
						'<p data-diff-action="remove">foo</p>' +
						'<p data-diff-action="insert">boo</p>' +
						'<p data-diff-action="none">bar</p>' +
						spacer +
					'</div>'
			},
			{
				msg: 'Heading context always shown',
				oldDoc: '<p>lead</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<p>lead</p><h2>context</h2><p>foo</p><p>bar</p><p>baq</p>',
				expected:
					spacer +
					'<h2 data-diff-action="none">context</h2>' +
					spacer +
					'<p data-diff-action="none">bar</p>' +
					'<p data-diff-action="remove">baz</p>' +
					'<p data-diff-action="insert">baq</p>'
			},
			{
				msg: 'Heading context always shown (div wrapped doc)',
				oldDoc: '<div><p>lead</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p></div>',
				newDoc: '<div><p>lead</p><h2>context</h2><p>foo</p><p>bar</p><p>baq</p></div>',
				expected:
					'<div>' +
						spacer +
						'<h2 data-diff-action="none">context</h2>' +
						spacer +
						'<p data-diff-action="none">bar</p>' +
						'<p data-diff-action="remove">baz</p>' +
						'<p data-diff-action="insert">baq</p>' +
					'</div>'
			},
			{
				msg: 'Heading context shown with small inline change',
				oldDoc: '<p>lead</p><h2>context</h2><p>foo</p><p>bar</p><p>baz quux whee</p>',
				newDoc: '<p>lead</p><h2>context</h2><p>foo</p><p>bar</p><p>baz quux whee 123</p>',
				expected:
					spacer +
					'<h2 data-diff-action="none">context</h2>' +
					spacer +
					'<p data-diff-action="none">bar</p>' +
					'<p>baz quux whee<ins data-diff-action="insert"> 123</ins></p>'
			},
			{
				msg: 'No spacer above heading context when it is the 0th child',
				oldDoc: '<h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<h2>context</h2><p>foo</p><p>bar</p><p>baq</p>',
				expected:
					'<h2 data-diff-action="none">context</h2>' +
					spacer +
					'<p data-diff-action="none">bar</p>' +
					'<p data-diff-action="remove">baz</p>' +
					'<p data-diff-action="insert">baq</p>'
			},
			{
				msg: 'No spacer below heading context when next child is already context',
				oldDoc: '<h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<h2>context</h2><p>foo</p><p>baq</p><p>baz</p>',
				expected:
					'<h2 data-diff-action="none">context</h2>' +
					'<p data-diff-action="none">foo</p>' +
					'<p data-diff-action="remove">bar</p>' +
					'<p data-diff-action="insert">baq</p>' +
					'<p data-diff-action="none">baz</p>'
			},
			{
				msg: 'Second heading is context',
				oldDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foo</p><p>bar</p><p>baq</p>',
				expected:
					spacer +
					'<h2 data-diff-action="none">context</h2>' +
					spacer +
					'<p data-diff-action="none">bar</p>' +
					'<p data-diff-action="remove">baz</p>' +
					'<p data-diff-action="insert">baq</p>'
			},
			{
				msg: 'Modification in first section',
				oldDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<h2>first heading</h2><p>wheeb</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				expected:
					'<h2 data-diff-action="none">first heading</h2>' +
					'<p data-diff-action="remove">whee</p>' +
					'<p data-diff-action="insert">wheeb</p>' +
					'<h2 data-diff-action="none">context</h2>' +
					spacer
			},
			{
				msg: 'Modification at start of second section',
				oldDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foob</p><p>bar</p><p>baz</p>',
				expected:
					spacer +
					'<h2 data-diff-action="none">context</h2>' +
					'<p data-diff-action="remove">foo</p>' +
					'<p data-diff-action="insert">foob</p>' +
					'<p data-diff-action="none">bar</p>' +
					spacer
			},
			{
				msg: 'Modification in middle of second section',
				oldDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foo</p><p>barb</p><p>baz</p>',
				expected:
					spacer +
					'<h2 data-diff-action="none">context</h2>' +
					'<p data-diff-action="none">foo</p>' +
					'<p data-diff-action="remove">bar</p>' +
					'<p data-diff-action="insert">barb</p>' +
					'<p data-diff-action="none">baz</p>'
			},
			{
				msg: 'No extra context shown when second heading modified',
				oldDoc: '<h2>first heading</h2><p>whee</p><h2>context</h2><p>foo</p><p>bar</p><p>baz</p>',
				newDoc: '<h2>first heading</h2><p>whee</p><h2>context!</h2><p>foo</p><p>bar</p><p>baz</p>',
				expected:
					spacer +
					'<p data-diff-action="none">whee</p>' +
					'<h2>context<ins data-diff-action="insert">!</del></h2>' +
					'<p data-diff-action="none">foo</p>' +
					spacer
			},
			{
				msg: 'Wrapper paragraphs are made concrete',
				oldDoc: 'foo',
				newDoc: 'boo',
				expected:
					'<p data-diff-action="remove">foo</p>' +
					'<p data-diff-action="insert">boo</p>'
			},
			{
				msg: 'Attributes added to ClassAttributeNodes',
				oldDoc: '<figure><img src="http://example.org/foo.jpg" alt="foo"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure><img src="http://example.org/foo.jpg" alt="bar"><figcaption>bar</figcaption></figure>',
				expected:
					'<figure data-diff-action="structural-change" data-diff-id="0"><img src="http://example.org/foo.jpg" alt="bar"><figcaption>bar</figcaption></figure>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-changed,alt,<del>foo</del>,<ins>bar</ins></div>'
				]
			},
			{
				msg: 'Attributes added to ClassAttributeNodes with classes',
				oldDoc: '<figure class="ve-align-right"><img src="http://example.org/foo.jpg" alt="foo"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure class="ve-align-right"><img src="http://example.org/foo.jpg" alt="bar"><figcaption>bar</figcaption></figure>',
				expected:
					'<figure class="ve-align-right" data-diff-action="structural-change" data-diff-id="0"><img src="http://example.org/foo.jpg" alt="bar"><figcaption>bar</figcaption></figure>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-changed,alt,<del>foo</del>,<ins>bar</ins></div>'
				]
			},
			{
				msg: 'Changed src on an image is considered a delete + insert',
				oldDoc: '<figure class="ve-align-right"><img src="http://example.org/foo.jpg"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure class="ve-align-right"><img src="http://example.org/bar.jpg"><figcaption>bar</figcaption></figure>',
				expected:
					'<figure class="ve-align-right" data-diff-action="remove"><img src="http://example.org/foo.jpg"><figcaption>bar</figcaption></figure>' +
					'<figure class="ve-align-right" data-diff-action="insert"><img src="http://example.org/bar.jpg"><figcaption>bar</figcaption></figure>'
			},
			{
				msg: 'Node inserted',
				oldDoc: '<p>foo</p>',
				newDoc: '<p>foo</p><div rel="ve:Alien">Alien</div>',
				expected:
					'<p data-diff-action="none">foo</p>' +
					'<div rel="ve:Alien" data-diff-action="insert">Alien</div>'
			},
			{
				msg: 'Node removed',
				oldDoc: '<p>foo</p><div rel="ve:Alien">Alien</div>',
				newDoc: '<p>foo</p>',
				expected:
					'<p data-diff-action="none">foo</p>' +
					'<div rel="ve:Alien" data-diff-action="remove">Alien</div>'
			},
			{
				msg: 'Node replaced',
				oldDoc: '<div rel="ve:Alien">Alien</div>',
				newDoc: '<p>Foo</p>',
				expected:
					'<div rel="ve:Alien" data-diff-action="remove">Alien</div>' +
					'<p data-diff-action="insert">Foo</p>'
			},
			{
				msg: 'Multi-node insert',
				oldDoc: '',
				newDoc: '<p>foo</p><p>bar</p>',
				expected:
					'<p data-diff-action="remove"></p>' +
					'<p data-diff-action="insert">foo</p>' +
					'<p data-diff-action="insert">bar</p>'
			},
			{
				msg: 'Multi-node remove',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '',
				expected:
					'<p data-diff-action="remove">foo</p>' +
					'<p data-diff-action="remove">bar</p>' +
					'<p data-diff-action="insert"></p>'
			},
			{
				msg: 'About-grouped node inserted',
				oldDoc: '<p>Foo</p>',
				newDoc: '<p>Foo</p>' +
					'<div rel="ve:Alien" about="#group1">A</div>' +
					'<div rel="ve:Alien" about="#group1">B</div>' +
					'<div rel="ve:Alien" about="#group1">C</div>',
				expected:
					'<p data-diff-action="none">Foo</p>' +
					'<div data-diff-action="insert" rel="ve:Alien" about="#group1">A</div>' +
					'<div data-diff-action="insert" rel="ve:Alien" about="#group1">B</div>' +
					'<div data-diff-action="insert" rel="ve:Alien" about="#group1">C</div>'
			},
			{
				msg: 'Inline node inserted',
				oldDoc: '<p>foo bar baz quux</p>',
				newDoc: '<p>foo bar <!--whee--> baz quux</p>',
				expected:
					'<p>' +
						'foo bar ' +
						'<ins data-diff-action="insert">' + comment( 'whee' ) + ' </ins>' +
						'baz quux' +
					'</p>'
			},
			{
				msg: 'Inline node removed',
				oldDoc: '<p>foo bar <!--whee--> baz quux</p>',
				newDoc: '<p>foo bar baz quux</p>',
				expected:
					'<p>' +
						'foo bar ' +
						'<del data-diff-action="remove">' + comment( 'whee' ) + ' </del>' +
						'baz quux' +
					'</p>'
			},
			{
				msg: 'Inline node modified',
				oldDoc: '<p>foo bar <!--whee--> baz quux</p>',
				newDoc: '<p>foo bar <!--wibble--> baz quux</p>',
				expected:
					'<p>' +
						'foo bar ' +
						'<span data-diff-action="change-remove">' + comment( 'whee' ) + '</span>' +
						'<span data-diff-action="change-insert" data-diff-id="0">' + comment( 'wibble' ) + '</span>' +
						' baz quux' +
					'</p>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-comment-diff,<span>w<del>he</del><ins>ibbl</ins>e</span></div>'
				]
			},
			{
				msg: 'Alien node modified',
				oldDoc: '<p>foo</p><div rel="ve:Alien">Alien old</div>',
				newDoc: '<p>foo</p><div rel="ve:Alien">Alien new</div>',
				expected:
					'<p data-diff-action="none">foo</p>' +
					'<div rel="ve:Alien" data-diff-action="remove">Alien old</div>' +
					'<div rel="ve:Alien" data-diff-action="insert">Alien new</div>'
			},
			{
				msg: '`about` attribute ignored inside alien nodes',
				oldDoc: '<div rel="ve:Alien"><span about="old">Alien</span></div>',
				newDoc: '<div rel="ve:Alien"><span about="new">Alien</span></div>',
				expected:
					'<div rel="ve:Alien"><span about="new">Alien</span></div>'
			},
			{
				msg: 'Paragraphs moved',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '<p>bar</p><p>foo</p>',
				expected:
					'<p data-diff-action="none" data-diff-move="up" data-diff-id="0">bar</p>' +
					'<p data-diff-action="none">foo</p>',
				expectedDescriptions: [
					'<div>visualeditor-diff-moved-up</div>'
				]
			},
			{
				msg: 'Paragraphs moved, with insert',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '<p>baz</p><p>bar</p><p>foo</p>',
				expected:
					'<p data-diff-action="insert">baz</p>' +
					'<p data-diff-action="none" data-diff-move="up" data-diff-id="0">bar</p>' +
					'<p data-diff-action="none">foo</p>',
				expectedDescriptions: [
					'<div>visualeditor-diff-moved-up</div>'
				]
			},
			{
				msg: 'Paragraphs moved, with remove',
				oldDoc: '<p>baz</p><p>foo</p><p>bar</p>',
				newDoc: '<p>bar</p><p>foo</p>',
				expected:
					'<p data-diff-action="remove">baz</p>' +
					'<p data-diff-action="none" data-diff-move="up" data-diff-id="0">bar</p>' +
					'<p data-diff-action="none">foo</p>',
				expectedDescriptions: [
					'<div>visualeditor-diff-moved-up</div>'
				]
			},
			{
				msg: 'Paragraphs moved and modified',
				oldDoc: '<p>foo bar baz</p><p>quux whee</p>',
				newDoc: '<p>quux whee!</p><p>foo bar baz!</p>',
				expected:
					'<p data-diff-move="up" data-diff-id="0">quux whee<ins data-diff-action="insert">!</ins></p>' +
					'<p>foo bar baz<ins data-diff-action="insert">!</ins></p>',
				expectedDescriptions: [
					'<div>visualeditor-diff-moved-up</div>'
				]
			},
			{
				msg: 'Insert table column',
				oldDoc: '<table><tr><td>A</td></tr><tr><td>C</td></tr></table>',
				newDoc: '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td>' +
						'<td data-diff-action="structural-insert"><p data-diff-action="insert">B</p></td></tr>' +
						'<tr><td>C</td>' +
						'<td data-diff-action="structural-insert"><p data-diff-action="insert">D</p></td></tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Remove table column',
				oldDoc: '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>',
				newDoc: '<table><tr><td>A</td></tr><tr><td>C</td></tr></table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td><td data-diff-action="structural-remove"><p data-diff-action="remove">B</p></td></tr>' +
						'<tr><td>C</td><td data-diff-action="structural-remove"><p data-diff-action="remove">D</p></td></tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Change table columns',
				oldDoc:
					'<table>' +
						'<tr><td>A</td><td>Foo</td><td>Baz</td></tr>' +
						'<tr><td>B</td><td>Bar</td><td>Qux</td></tr>' +
					'</table>',
				newDoc:
					'<table>' +
						'<tr><td>A</td><td>Foo 1</td><td>Baz 1</td></tr>' +
						'<tr><td>B</td><td>Bar 1</td><td>Qux 1</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td><td>Foo<ins data-diff-action="insert"> 1</ins></td><td>Baz<ins data-diff-action="insert"> 1</ins></td></tr>' +
						'<tr><td>B</td><td>Bar<ins data-diff-action="insert"> 1</ins></td><td>Qux<ins data-diff-action="insert"> 1</ins></td></tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Change table rows',
				oldDoc:
					'<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>Foo</td><td>Bar</td></tr>' +
						'<tr><td>Baz</td><td>Qux</td></tr>' +
					'</table>',
				newDoc:
					'<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>Foo 1</td><td>Bar 1</td></tr>' +
						'<tr><td>Baz 1</td><td>Qux 1</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>Foo<ins data-diff-action="insert"> 1</ins></td><td>Bar<ins data-diff-action="insert"> 1</ins></td></tr>' +
						'<tr><td>Baz<ins data-diff-action="insert"> 1</ins></td><td>Qux<ins data-diff-action="insert"> 1</ins></td></tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Table row removed and cells edited',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td><td>E</td><td>F</td></tr>' +
						'<tr><td>G</td><td>H</td><td>I</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>Q</td><td>H</td><td>Y</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr data-diff-action="structural-remove">' +
							'<td data-diff-action="structural-remove"><p data-diff-action="remove">D</p></td>' +
							'<td data-diff-action="structural-remove"><p data-diff-action="remove">E</p></td>' +
							'<td data-diff-action="structural-remove"><p data-diff-action="remove">F</p></td>' +
						'</tr>' +
						'<tr>' +
							'<td><del data-diff-action="remove">G</del><ins data-diff-action="insert">Q</ins></td>' +
							'<td>H</td>' +
							'<td><del data-diff-action="remove">I</del><ins data-diff-action="insert">Y</ins></td>' +
						'</tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Table row moved',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
						'<tr><td>E</td><td>F</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>E</td><td>F</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr data-diff-action="structural-insert">' +
							'<td data-diff-action="structural-insert"><p data-diff-action="insert">E</p></td>' +
							'<td data-diff-action="structural-insert"><p data-diff-action="insert">F</p></td>' +
						'</tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
						'<tr data-diff-action="structural-remove">' +
							'<td data-diff-action="structural-remove"><p data-diff-action="remove">E</p></td>' +
							'<td data-diff-action="structural-remove"><p data-diff-action="remove">F</p></td>' +
						'</tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Horizontal merge (also rowspan set to 1 and not described)',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td colspan="2" rowspan="1">A</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td colspan="2" rowspan="1" data-diff-action="structural-change" data-diff-id="0">A</td><td data-diff-action="structural-remove"><p data-diff-action="remove">B</p></td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</tbody></table>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-set,colspan,<ins>2</ins></div>'
				]
			},
			{
				msg: 'Horizontal unmerge (also rowspan unset from 1 and not described)',
				oldDoc: '<table>' +
						'<tr><td colspan="2" rowspan="1">A</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td data-diff-action="structural-change" data-diff-id="0">A</td><td data-diff-action="structural-insert"><p data-diff-action="insert">B</p></td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</tbody></table>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-unset,colspan,<del>2</del></div>'
				]
			},
			{
				msg: 'Horizontal merge and change',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td colspan="2">Q</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td colspan="2" data-diff-action="structural-change" data-diff-id="0"><del data-diff-action="remove">A</del><ins data-diff-action="insert">Q</ins></td><td data-diff-action="structural-remove"><p data-diff-action="remove">B</p></td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</tbody></table>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-set,colspan,<ins>2</ins></div>'
				]
			},
			{
				msg: 'Vertical merge',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td rowspan="2">A</td><td>B</td></tr>' +
						'<tr><td>D</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td rowspan="2" data-diff-action="structural-change" data-diff-id="0">A</td><td>B</td></tr>' +
						'<tr><td data-diff-action="structural-remove"><p data-diff-action="remove">C</p></td><td>D</td></tr>' +
					'</tbody></table>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-set,rowspan,<ins>2</ins></div>'
				]
			},
			{
				msg: 'Vertical merge and modify',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td></tr>' +
						'<tr><td>C</td><td>D</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td rowspan="2">A</td><td>B 1</td></tr>' +
						'<tr><td>D 1</td></tr>' +
					'</table>',
				expected:
					// TODO: Detect this change
					'<table data-diff-action="remove"><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>' +
					'<table data-diff-action="insert"><tbody><tr><td rowspan="2">A</td><td>B 1</td></tr><tr><td>D 1</td></tr></tbody></table>'
			},
			{
				msg: 'Table with no changes (colspan/rowspan set to 1) is not rendered',
				oldDoc: '<table><tr><td>A</td></tr></table>',
				newDoc: '<table><tr><td colspan="1" rowspan="1">A</td></tr></table>',
				expected: noChanges
			},
			{
				msg: 'Sparse table insertion',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td><td>E</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td><td data-diff-action="structural-insert"><p data-diff-action="insert">E</p></td></tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Sparse table removal',
				oldDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td><td>E</td></tr>' +
					'</table>',
				newDoc: '<table>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td></tr>' +
					'</table>',
				expected:
					'<table><tbody>' +
						'<tr><td>A</td><td>B</td><td>C</td></tr>' +
						'<tr><td>D</td><td data-diff-action="structural-remove"><p data-diff-action="remove">E</p></td></tr>' +
					'</tbody></table>'
			},
			{
				msg: 'Table caption change',
				oldDoc: '<table><caption>Foo</caption><tr><td>Bar</td></tr></table>',
				newDoc: '<table><caption>Foo 1</caption><tr><td>Bar</td></tr></table>',
				expected:
					'<table><caption>Foo<ins data-diff-action="insert"> 1</ins></caption><tbody><tr><td>Bar</td></tr></tbody></table>'
			},
			{
				msg: 'Table caption insert',
				oldDoc: '<table><tr><td>Bar</td></tr></table>',
				newDoc: '<table><caption>Foo</caption><tr><td>Bar</td></tr></table>',
				expected:
					'<table><caption data-diff-action="structural-insert"><p data-diff-action="insert">Foo</p></caption><tbody><tr><td>Bar</td></tr></tbody></table>'
			},
			{
				msg: 'Table caption remove',
				oldDoc: '<table><caption>Foo</caption><tr><td>Bar</td></tr></table>',
				newDoc: '<table><tr><td>Bar</td></tr></table>',
				expected:
					'<table><caption data-diff-action="structural-remove"><p data-diff-action="remove">Foo</p></caption><tbody><tr><td>Bar</td></tr></tbody></table>'
			},
			{
				msg: 'List item indentation in div',
				oldDoc:
					'<div>' +
						'<ul><li>foo</li><li>bar</li><li>baz</li></ul>' +
					'</div>',
				newDoc:
					'<div>' +
						'<ul><li>foo<ul><li>bar</li></ul></li><li>baz</li></ul>' +
					'</div>',
				expected:
					'<div>' +
						'<ul>' +
							'<li>' +
								'<p data-diff-action="none">foo</p>' +
								'<ul>' +
									'<li data-diff-id="0">' +
										'<p data-diff-action="structural-change">bar</p>' +
									'</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'<p data-diff-action="none">baz</p>' +
							'</li>' +
						'</ul>' +
					'</div>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-list-indent</div>'
				]
			},
			{
				msg: 'List item indentation in table',
				oldDoc:
					'<table>' +
						'<tr><td>Hello</td><td>World</td></tr>' +
						'<tr><td><ul><li>foo</li><li>bar</li><li>baz</li></ul></td><td>Here</td></tr>' +
					'</table>',
				newDoc:
					'<table>' +
						'<tr><td>Hello</td><td>World</td></tr>' +
						'<tr><td><ul><li>foo<ul><li>bar</li></ul></li><li>baz</li></ul></td><td>Here</td></tr>' +
					'</table>',
				expected:
					// TODO: This should be a list diff
					'<table><tbody><tr><td>Hello</td><td>World</td><tr><td>' +
						'<ul>' +
							'<li data-diff-action="structural-insert">' +
								'foo' +
								'<ul data-diff-action="structural-insert">' +
									'<li>bar</li>' +
								'</ul>' +
							'</li>' +
							'<li>baz</li>' +
						'</ul>' +
					'</td><td>Here</td></tr></tbody></table>'
			},
			{
				msg: 'List with block alien',
				oldDoc: '<ul><li>foo</li><li>bar</li><li>baz</li></ul>',
				newDoc: '<ul><li>foo</li><s><li>bar</li></s><li>baz</li></ul>',
				expected:
					'<ul>' +
						'<li><p data-diff-action="none">foo</p></li>' +
						'<li><p data-diff-action="remove">bar</p></li>' +
						'<s data-diff-action="insert"><li>bar</li></s>' +
						'<li><p data-diff-action="none">baz</p></li>' +
					'</ul>'
			},
			{
				msg: 'Annotation insertion',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo <b>bar</b> baz</p>',
				expected:
					'<p>foo <span data-diff-action="change-remove">bar</span><span data-diff-action="change-insert" data-diff-id="0"><b>bar</b></span> baz</p>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-textstyle-added,visualeditor-annotationbutton-bold-tooltip</div>'
				]
			},
			{
				msg: 'Annotation removal',
				oldDoc: '<p>foo <b>bar</b> baz</p>',
				newDoc: '<p>foo bar baz</p>',
				expected:
					'<p>foo <span data-diff-action="change-remove"><b>bar</b></span><span data-diff-action="change-insert" data-diff-id="0">bar</span> baz</p>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-textstyle-removed,visualeditor-annotationbutton-bold-tooltip</div>'
				]
			},
			{
				msg: 'Annotation attribute change',
				oldDoc: '<p>foo <a href="http://example.org/quuz">bar</a> baz</p>',
				newDoc: '<p>foo <a href="http://example.org/whee">bar</a> baz</p>',
				expected:
					'<p>foo <span data-diff-action="change-remove"><a href="http://example.org/quuz">bar</a></span><span data-diff-action="change-insert" data-diff-id="0"><a href="http://example.org/whee">bar</a></span> baz</p>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-link-href-diff,<span>http://example.org/<del>quuz</del><ins>whee</ins></span></div>'
				]
			},
			{
				msg: 'Annotation insertion (no desc)',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo <dfn>bar</dfn> baz</p>',
				expected:
					'<p>foo <span data-diff-action="change-remove">bar</span><span data-diff-action="change-insert"><dfn>bar</dfn></span> baz</p>'
			},
			{
				msg: 'Annotation removal (no desc)',
				oldDoc: '<p>foo <dfn>bar</dfn> baz</p>',
				newDoc: '<p>foo bar baz</p>',
				expected:
					'<p>foo <span data-diff-action="change-remove"><dfn>bar</dfn></span><span data-diff-action="change-insert">bar</span> baz</p>'
			},
			{
				msg: 'Link insertion',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo <a href="http://example.org/">bar</a> baz</p>',
				expected:
					'<p>foo <span data-diff-action="change-remove">bar</span><span data-diff-action="change-insert" data-diff-id="0"><a href="http://example.org/">bar</a></span> baz</p>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-link-added,http://example.org/</div>'
				]
			},
			{
				msg: 'Link removal',
				oldDoc: '<p>foo <a href="http://example.org/">bar</a> baz</p>',
				newDoc: '<p>foo bar baz</p>',
				expected:
					'<p>foo <span data-diff-action="change-remove"><a href="http://example.org/">bar</a></span><span data-diff-action="change-insert" data-diff-id="0">bar</span> baz</p>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-link-removed,http://example.org/</div>'
				]
			},
			{
				msg: 'Nested annotation change',
				oldDoc: '<p><a href="http://example.org/">foo bar baz</a></p>',
				newDoc: '<p><a href="http://example.org/">foo <b>bar</b> baz</a></p>',
				expected:
					'<p><a href="http://example.org/">foo <span data-diff-action="change-remove">bar</span><span data-diff-action="change-insert" data-diff-id="0"><b>bar</b></span> baz</a></p>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-textstyle-added,visualeditor-annotationbutton-bold-tooltip</div>'
				]
			},
			{
				msg: 'Annotation insertion with text change',
				oldDoc: '<p>foo car baz</p>',
				newDoc: '<p>foo <b>bar</b> baz</p>',
				expected:
					'<p>foo <del data-diff-action="remove">car</del><ins data-diff-action="insert"><b>bar</b></ins> baz</p>'
			},
			{
				msg: 'Annotation removal with text change',
				oldDoc: '<p>foo <b>bar</b> baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<p>foo <del data-diff-action="remove"><b>bar</b></del><ins data-diff-action="insert">car</ins> baz</p>'
			},
			{
				msg: 'Comment insertion',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo bar<!--comment--> baz</p>',
				expected:
					'<p>' +
						'foo bar' +
						'<ins data-diff-action="insert">' + comment( 'comment' ) + '</ins>' +
						' baz' +
					'</p>'
			},
			{
				msg: 'Comment removal',
				oldDoc: '<p>foo bar<!--comment--> baz</p>',
				newDoc: '<p>foo bar baz</p>',
				expected:
					'<p>' +
						'foo bar' +
						'<del data-diff-action="remove">' + comment( 'comment' ) + '</del>' +
						' baz' +
					'</p>'
			},
			{
				msg: 'List item insertion',
				oldDoc: '<ul><li>foo</li><li>baz</li></ul>',
				newDoc: '<ul><li>foo</li><li>bar</li><li>baz</li></ul>',
				expected:
					'<ul>' +
						'<li><p data-diff-action="none">foo</p></li>' +
						'<li><p data-diff-action="insert">bar</p></li>' +
						'<li><p data-diff-action="none">baz</p></li>' +
					'</ul>'
			},
			{
				msg: 'List item removal',
				oldDoc: '<ol><li>foo</li><li>bar</li><li>baz</li><li>quux</li><li>whee</li></ol>',
				newDoc: '<ol><li>foo</li><li>quux</li></ol>',
				expected:
					'<ol>' +
						'<li value="1"><p data-diff-action="none">foo</p></li>' +
						'<li value="2"><p data-diff-action="remove">bar</p></li>' +
						'<li value="3"><p data-diff-action="remove">baz</p></li>' +
						'<li value="2"><p data-diff-action="none">quux</p></li>' +
						'<li value="5"><p data-diff-action="remove">whee</p></li>' +
					'</ol>'
			},
			{
				msg: 'List item removal from both ends',
				oldDoc: '<ol><li>foo</li><li>bar</li><li>baz</li></ol>',
				newDoc: '<ol><li>bar</li></ol>',
				expected:
					'<ol>' +
						'<li value="1"><p data-diff-action="remove">foo</p></li>' +
						'<li value="1"><p data-diff-action="none">bar</p></li>' +
						'<li value="3"><p data-diff-action="remove">baz</p></li>' +
					'</ol>'
			},
			{
				msg: 'List item move up',
				oldDoc: '<ol><li>foo</li><li>bar</li><li>baz</li><li>quux</li></ol>',
				newDoc: '<ol><li>baz</li><li>foo</li><li>bar</li><li>quux</li></ol>',
				expected:
					'<ol>' +
						'<li value="1"><p data-diff-action="none" data-diff-move="up" data-diff-id="0">baz</p></li>' +
						'<li value="2"><p data-diff-action="none">foo</p></li>' +
						'<li value="3"><p data-diff-action="none">bar</p></li>' +
						'<li value="4"><p data-diff-action="none">quux</p></li>' +
					'</ol>',
				expectedDescriptions: [
					'<div>visualeditor-diff-moved-up</div>'
				]
			},
			{
				msg: 'List item move down',
				oldDoc: '<ol><li>foo</li><li>bar</li><li>baz</li><li>quux</li></ol>',
				newDoc: '<ol><li>foo</li><li>baz</li><li>quux</li><li>bar</li></ol>',
				expected:
					'<ol>' +
						'<li value="1"><p data-diff-action="none">foo</p></li>' +
						'<li value="2"><p data-diff-action="none">baz</p></li>' +
						'<li value="3"><p data-diff-action="none">quux</p></li>' +
						'<li value="4"><p data-diff-action="none" data-diff-move="down" data-diff-id="0">bar</p></li>' +
					'</ol>',
				expectedDescriptions: [
					'<div>visualeditor-diff-moved-down</div>'
				]
			},
			{
				msg: 'List item move and change',
				oldDoc: '<ol><li>foo</li><li>bar</li><li>baz baz</li><li>quux</li></ol>',
				newDoc: '<ol><li>baz bat</li><li>foo</li><li>bar</li><li>quux</li></ol>',
				expected:
					'<ol>' +
						'<li value="1"><p data-diff-move="up" data-diff-id="0">baz <del data-diff-action="remove">baz</del><ins data-diff-action="insert">bat</ins></p></li>' +
						'<li value="2"><p data-diff-action="none">foo</p></li>' +
						'<li value="3"><p data-diff-action="none">bar</p></li>' +
						'<li value="4"><p data-diff-action="none">quux</p></li>' +
					'</ol>',
				expectedDescriptions: [
					'<div>visualeditor-diff-moved-up</div>'
				]
			},
			{
				msg: 'List item indentation',
				oldDoc: '<ol><li>foo</li><li>bar</li><li>baz</li></ol>',
				newDoc: '<ol><li>foo<ol><li>bar</li></ol></li><li>baz</li></ol>',
				expected:
					'<ol>' +
						'<li value="1">' +
							'<p data-diff-action="none">foo</p>' +
							'<ol>' +
								'<li value="1" data-diff-id="0">' +
									'<p data-diff-action="structural-change">bar</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
						'<li value="2">' +
							'<p data-diff-action="none">baz</p>' +
						'</li>' +
					'</ol>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-list-indent</div>'
				]
			},
			{
				msg: 'List item deindentation',
				oldDoc: '<ol><li>foo<ol><li>bar</li></ol></li><li>baz</li></ol>',
				newDoc: '<ol><li>foo</li><li>bar</li><li>baz</li></ol>',
				expected:
					'<ol>' +
						'<li value="1">' +
							'<p data-diff-action="none">foo</p>' +
						'</li>' +
						'<li value="2" data-diff-id="0">' +
							'<p data-diff-action="structural-change">bar</p>' +
						'</li>' +
						'<li value="3">' +
							'<p data-diff-action="none">baz</p>' +
						'</li>' +
					'</ol>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-list-outdent</div>'
				]
			},
			{
				msg: 'List item deindentation from numbered list to bullet',
				oldDoc: '<ul><li>Foo<ol><li>Bar</li><li>Baz</li></ol></li></ul>',
				newDoc: '<ul><li>Foo<ol><li>Bar</li></ol></li><li>Baz</li></ul>',
				expected:
					'<ul>' +
						'<li><p data-diff-action="none">Foo</p>' +
							'<ol>' +
								'<li value="1"><p data-diff-action="none">Bar</p></li>' +
							'</ol>' +
						'</li>' +
						'<li data-diff-id="0"><p data-diff-action="structural-change">Baz</p></li>' +
					'</ul>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-list-outdent</div>',
					'<div>visualeditor-changedesc-no-key,<del>visualeditor-listbutton-number-tooltip</del>,<ins>visualeditor-listbutton-bullet-tooltip</ins></div>'
				]
			},
			{
				msg: 'Full list replacement',
				oldDoc: '<ul><li>one</li><li>two</li><li>three</li></ul>',
				newDoc: '<ul><li>four</li><li>five</li><li>six</li></ul>',
				expected:
					'<ul data-diff-action="remove">' +
						'<li>one</li>' +
						'<li>two</li>' +
						'<li>three</li>' +
					'</ul>' +
					'<ul data-diff-action="insert">' +
						'<li>four</li>' +
						'<li>five</li>' +
						'<li>six</li>' +
					'</ul>'
			},
			{
				msg: 'List node type change',
				oldDoc: '<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>',
				newDoc: '<ol><li>Foo</li><li>Bar</li><li>Baz</li></ol>',
				expected:
					'<ol data-diff-id="0">' +
						'<li value="1"><p data-diff-action="structural-change">Foo</p></li>' +
						'<li value="2"><p data-diff-action="structural-change">Bar</p></li>' +
						'<li value="3"><p data-diff-action="structural-change">Baz</p></li>' +
					'</ol>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-no-key,<del>visualeditor-listbutton-bullet-tooltip</del>,<ins>visualeditor-listbutton-number-tooltip</ins></div>'
				]
			},
			{
				msg: 'List node type change with indentation',
				oldDoc: '<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>',
				newDoc: '<ol><li>Foo<ul><li>Bar</li></ul></li><li>Baz</li></ol>',
				expected:
					'<ol data-diff-id="0">' +
						'<li value="1"><p data-diff-action="structural-change">Foo</p>' +
							'<ul><li data-diff-id="1"><p data-diff-action="structural-change">Bar</p></li></ul>' +
						'</li>' +
						'<li value="2"><p data-diff-action="structural-change">Baz</p></li>' +
					'</ol>',
				expectedDescriptions: [
					// TODO: This should show only one list node type change
					'<div>visualeditor-changedesc-no-key,<del>visualeditor-listbutton-bullet-tooltip</del>,<ins>visualeditor-listbutton-number-tooltip</ins></div>',
					'<div>visualeditor-changedesc-list-indent</div>',
					'<div>visualeditor-changedesc-no-key,<del>visualeditor-listbutton-bullet-tooltip</del>,<ins>visualeditor-listbutton-number-tooltip</ins></div>'
				]
			},
			{
				msg: 'List item node type change',
				oldDoc: '<dl><dt>Foo</dt><dd>Bar</dd></dl>',
				newDoc: '<dl><dd>Foo</dd><dd>Bar</dd></dl>',
				expected:
					'<dl>' +
						'<dd data-diff-id="0"><p data-diff-action="structural-change">Foo</p></dd>' +
						'<dd><p data-diff-action="none">Bar</p></dd>' +
					'</dl>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-changed,style,<del>term</del>,<ins>definition</ins></div>'
				]
			},
			{
				msg: 'List item indentation with child type change',
				oldDoc: '<ul><li>foo</li><li><h2>bar</h2></li><li>baz</li></ul>',
				newDoc: '<ul><li>foo<ul><li><h3>bar</h3></li></ul></li><li>baz</li></ul>',
				expected:
					'<ul>' +
						'<li>' +
							'<p data-diff-action="none">foo</p>' +
							'<ul>' +
								'<li data-diff-id="1">' +
									'<h3 data-diff-action="structural-change" data-diff-id="0">bar</h3>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<p data-diff-action="none">baz</p>' +
						'</li>' +
					'</ul>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-no-key,<del>visualeditor-formatdropdown-format-heading2</del>,<ins>visualeditor-formatdropdown-format-heading3</ins></div>',
					'<div>visualeditor-changedesc-list-indent</div>'
				]
			},
			{
				msg: 'Change in deep sparse list',
				oldDoc: '<ul><li><ul><li><ul><li>Foo</li></ul></li></ul></li></ul>',
				newDoc: '<ul><li><ul><li><ul><li>Foo bar</li></ul></li></ul></li></ul>',
				expected:
					// TODO: The rendered list has the wrong depth and a re-parented <ul>
					'<ul><li><ul><li>Foo<ins data-diff-action="insert"> bar</ins></li></ul></li></ul><ul></ul>'
			},
			{
				msg: 'Inline widget with same type but not diff comparable is marked as a remove/insert',
				oldDoc: '<p>Foo bar baz<span rel="test:inlineWidget" data-name="FooWidget"></span></p>',
				newDoc: '<p>Foo bar baz<span rel="test:inlineWidget" data-name="BarWidget"></span></p>',
				expected:
					'<p>Foo bar baz' +
						'<del data-diff-action="remove"><span rel="test:inlineWidget" data-name="FooWidget"></span></del>' +
						'<ins data-diff-action="insert"><span rel="test:inlineWidget" data-name="BarWidget"></span></ins>' +
					'</p>'
			},
			{
				msg: 'Adjacent inline node removed with common prefix modified',
				oldDoc: '<p>foo bar <!--whee--><!--wibble--></p>',
				newDoc: '<p>foo quux bar <!--whee--></p>',
				expected:
					'<p>foo ' +
						'<ins data-diff-action="insert">quux </ins>' +
						'bar ' +
						comment( 'whee' ) +
						'<del data-diff-action="remove">' + comment( 'wibble' ) + '</del>' +
					'</p>'
			},
			{
				msg: 'Similar item added to list and indented (T187632)',
				oldDoc:
					'<ul>' +
						'<li>foo</li>' +
						'<li>bar baz quux whee one</li>' +
					'</ul>',
				newDoc:
					'<ul>' +
						'<li>foo</li>' +
						'<li>bar baz quux whee one' +
							'<ul><li>bar baz quux whee won</li></ul>' +
						'</li>' +
					'</ul>',
				expected:
					'<ul>' +
						'<li><p data-diff-action="none">foo</p></li>' +
						'<li><p data-diff-action="none">bar baz quux whee one</p>' +
							'<ul><li><p data-diff-action="insert">bar baz quux whee won</p></li></ul>' +
						'</li>' +
					'</ul>'
			},
			{
				msg: 'Newlines and tabs are substituted in a paragraph',
				oldDoc: '<p>Quux</p>',
				newDoc: '<p>Quux</p><p>Foo\n\tBar</p>',
				expected: '<p data-diff-action="none">Quux</p>' +
					'<p data-diff-action="insert">Foo↵➞Bar</p>'
			},
			{
				msg: 'Newlines and tabs not substitued in nodes with signficant whitespace',
				oldDoc: '<p>Quux</p>',
				newDoc: '<p>Quux</p><pre>Foo\n\tBar</pre>',
				expected: '<p data-diff-action="none">Quux</p>' +
					'<pre data-diff-action="insert">Foo\n\tBar</pre>'
			},
			{
				msg: 'Metadata change inside paragraph (no diff)',
				oldDoc: '<p>foo bar baz<meta foo="a"></p>',
				newDoc: '<p>foo bar baz<meta foo="b"></p>',
				expected: '<div class="ve-ui-diffElement-no-changes">' + ve.msg( 'visualeditor-diff-no-changes' ) + '</div>'
			},
			{
				msg: 'Metadata change between list items (no diff)',
				oldDoc: '<ul><li>foo</li><meta foo="a"><li>baz</li></ul>',
				newDoc: '<ul><li>foo</li><meta foo="b"><li>baz</li></ul>',
				expected: '<div class="ve-ui-diffElement-no-changes">' + ve.msg( 'visualeditor-diff-no-changes' ) + '</div>'
			},
			{
				msg: 'Insert metadata inside paragraph (no diff)',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo bar baz<meta foo="a"></p>',
				expected: '<div class="ve-ui-diffElement-no-changes">' + ve.msg( 'visualeditor-diff-no-changes' ) + '</div>'
			},
			{
				msg: 'Remove metadata inside paragraph (no diff)',
				oldDoc: '<p>foo bar baz<meta foo="a"></p>',
				newDoc: '<p>foo bar baz</p>',
				expected: '<div class="ve-ui-diffElement-no-changes">' + ve.msg( 'visualeditor-diff-no-changes' ) + '</div>'
			},
			{
				msg: 'Header attribute change in list',
				oldDoc: '<ul><li><h2>Foo</h2></li></ul>',
				newDoc: '<ul><li><h3>Foo</h3></li></ul>',
				expected:
					'<ul><li><h3 data-diff-action="structural-change" data-diff-id="0">Foo</h3></li></ul>',
				expectedDescriptions: [
					'<div>visualeditor-changedesc-no-key,<del>visualeditor-formatdropdown-format-heading2</del>,<ins>visualeditor-formatdropdown-format-heading3</ins></div>'
				]
			},
			{
				msg: 'Table change in list',
				oldDoc: '<ul><li><table><tr><td>Foo</td><td>Bar</td><td>Baz1</td></tr></table></li></ul>',
				newDoc: '<ul><li><table><tr><td>Foo</td><td>Bar</td><td>Baz2</td></tr></table></li></ul>',
				expected:
					'<ul><li>' +
						'<table><tbody><tr><td>Foo</td><td>Bar</td><td><del data-diff-action="remove">Baz1</del><ins data-diff-action="insert">Baz2</ins></td></tr></tbody></table>' +
					'</li></ul>'
			},
			{
				msg: 'Internal list change',
				oldDoc: 'Hi<ref>Foo</ref><ref>Bar</ref><ref>Baz1</ref><ref>Baz2</ref><ref>Baz3</ref><ref>Baz4</ref>',
				newDoc: 'Hi<ref>Foo 1</ref><ref>Baz1</ref><ref>Baz2</ref><ref>Baz3</ref><ref>Baz4</ref><ref>Quux</ref>',
				expected:
					'<p data-diff-action="none">Hi' + '<ref></ref>'.repeat( 6 ) + '</p>' +
					'<ol>' +
						'<li value="1">Foo<ins data-diff-action="insert"> 1</ins></li>' +
						'<li value="2"><p data-diff-action="remove">Bar</p></li>' +
						'<li value="2"><p data-diff-action="none">Baz1</p></li>' +
						'<li class="ve-ui-diffElement-internalListSpacer">' + spacer + '</li>' +
						'<li value="5"><p data-diff-action="none">Baz4</p></li>' +
						'<li value="6"><p data-diff-action="insert">Quux</p></li>' +
					'</ol>'
			},
			{
				msg: 'Two reference lists',
				oldDoc:
					'<p>One<ref>Foo</ref><ref>Bar</ref><ref>Baz</ref></p>' +
					'<p>Two<ref group="g1">Foo</ref><ref group="g1">Bar</ref></p>',
				newDoc:
					'<p>One<ref>Foo</ref><ref>Baz</ref></p>' +
					'<p>Two<ref group="g1">Foo</ref><ref group="g1">Bar</ref><ref group="g1">Baz</ref></p>',
				expected:
					'<p>One<ref></ref><ref></ref><del data-diff-action="remove"><ref></ref></del></p>' +
					// Refs are all comparable so diff thinks the first one is inserted (T273905)
					'<p>Two<ins data-diff-action="insert"><ref group="g1"></ref></ins><ref group="g1"></ref><ref group="g1"></ref></p>' +
					'<ol>' +
						'<li value="1"><p data-diff-action="none">Foo</p></li>' +
						'<li value="2"><p data-diff-action="remove">Bar</p></li>' +
						'<li value="2"><p data-diff-action="none">Baz</p></li>' +
					'</ol>' +
					'<ol>' +
						'<li class="ve-ui-diffElement-internalListSpacer"><div class="ve-ui-diffElement-spacer">⋮</div></li>' +
						'<li value="2"><p data-diff-action="none">Bar</p></li>' +
						'<li value="3"><p data-diff-action="insert">Baz</p></li>' +
					'</ol>'
			},
			{
				msg: 'Internal list inserted',
				oldDoc: 'Hi',
				newDoc: 'Hi<ref>Foo</ref><ref>Bar</ref>',
				expected:
					'Hi<ins data-diff-action="insert">' + '<ref></ref>'.repeat( 2 ) + '</ins>' +
					'<ol>' +
						'<li value="1"><p data-diff-action="insert">Foo</p></li>' +
						'<li value="2"><p data-diff-action="insert">Bar</p></li>' +
					'</ol>'
			},
			{
				msg: 'Internal list deleted',
				oldDoc: 'Hi<ref>Foo</ref><ref>Bar</ref>',
				newDoc: 'Hi',
				expected:
					'Hi<del data-diff-action="remove">' + '<ref></ref>'.repeat( 2 ) + '</del>' +
					'<ol>' +
						'<li value="1"><p data-diff-action="remove">Foo</p></li>' +
						'<li value="2"><p data-diff-action="remove">Bar</p></li>' +
					'</ol>'
			}
		];

	function InlineWidgetNode() {
		InlineWidgetNode.super.apply( this, arguments );
	}
	OO.inheritClass( InlineWidgetNode, ve.dm.LeafNode );
	InlineWidgetNode.static.name = 'testInlineWidget';
	InlineWidgetNode.static.matchTagNames = [ 'span' ];
	InlineWidgetNode.static.matchRdfaTypes = [ 'test:inlineWidget' ];
	InlineWidgetNode.static.isContent = true;
	InlineWidgetNode.static.toDataElement = function ( domElements ) {
		return {
			type: this.name,
			attributes: {
				name: domElements[ 0 ].getAttribute( 'data-name' )
			}
		};
	};
	InlineWidgetNode.static.isDiffComparable = function ( element, other ) {
		return element.attributes.name === other.attributes.name;
	};
	ve.dm.modelRegistry.register( InlineWidgetNode );

	cases.forEach( function ( caseItem ) {
		ve.test.utils.runDiffElementTest( assert, caseItem );
	} );

	ve.dm.modelRegistry.unregister( InlineWidgetNode );
} );

QUnit.test( 'compareAttributes/describeChanges', function ( assert ) {
	var cases = [
		{
			msg: 'LinkAnnotation: Random attribute test (fallback)',
			type: 'link',
			before: {
				href: 'https://www.example.org/foo'
			},
			after: {
				href: 'https://www.example.org/foo',
				foo: '!!'
			},
			expected: [ 'visualeditor-changedesc-set,foo,<ins>!!</ins>' ]
		},
		{
			msg: 'LinkAnnotation: href change',
			type: 'link',
			before: { href: 'https://www.example.org/foo' },
			after: { href: 'https://www.example.org/bar' },
			expected: [ 'visualeditor-changedesc-link-href-diff,<span>https://www.example.org/<del>foo</del><ins>bar</ins></span>' ]
		},
		{
			msg: 'LinkAnnotation: href fragment change',
			type: 'link',
			before: { href: 'https://www.example.org/foo#bar' },
			after: { href: 'https://www.example.org/foo#baz' },
			expected: [ 'visualeditor-changedesc-link-href-diff,<span>https://www.example.org/foo#ba<del>r</del><ins>z</ins></span>' ]
		},
		{
			msg: 'LinkAnnotation: Full href change',
			type: 'link',
			before: { href: 'foo' },
			after: { href: 'bar' },
			expected: [ 'visualeditor-changedesc-link-href,<del>foo</del>,<ins>bar</ins>' ]
		},
		{
			msg: 'LanguageAnnotation: lang change',
			type: 'meta/language',
			before: { nodeName: 'span', lang: 'en', dir: 'ltr' },
			after: { nodeName: 'span', lang: 'fr', dir: 'ltr' },
			expected: [ 'visualeditor-changedesc-language,<del>langname-en</del>,<ins>langname-fr</ins>' ]
		},
		{
			msg: 'LanguageAnnotation: dir change',
			type: 'meta/language',
			before: { nodeName: 'span', lang: 'en', dir: 'ltr' },
			after: { nodeName: 'span', lang: 'en', dir: 'rtl' },
			expected: [ 'visualeditor-changedesc-direction,<del>ltr</del>,<ins>rtl</ins>' ]
		},
		{
			msg: 'LanguageAnnotation: Other attribute change (fallback)',
			type: 'meta/language',
			before: { nodeName: 'span', lang: 'en', dir: 'ltr', foo: 'bar' },
			after: { nodeName: 'span', lang: 'en', dir: 'ltr', foo: 'quux' },
			expected: [ 'visualeditor-changedesc-changed,foo,<del>bar</del>,<ins>quux</ins>' ]
		}
	];

	cases.forEach( function ( caseItem ) {
		var attributeChanges = ve.ui.DiffElement.static.compareAttributes( caseItem.before, caseItem.after );
		var changes = ve.dm.modelRegistry.lookup( caseItem.type ).static.describeChanges(
			attributeChanges, caseItem.after, { type: caseItem.type, attributes: caseItem.after }
		);
		changes.forEach( function ( change, j ) {
			assert.deepEqualWithDomElements(
				change,
				$.parseHTML( caseItem.expected[ j ] ),
				caseItem.msg + ', message ' + j
			);
		} );
	} );
} );
