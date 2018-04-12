/*!
 * VisualEditor DiffElement tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.DiffElement' );

/* Tests */

QUnit.test( 'Diffing', function ( assert ) {
	var i, len,
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
				msg: 'Forced time out',
				forceTimeout: true,
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="remove">' +
							'<del>foo bar baz</del>' +
						'</p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert">' +
							'<ins>foo car baz</ins>' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Minimal text change',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo bar! baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar' +
							'<ins data-diff-action="insert">!</ins>' +
							' baz' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Minimal text change at start of paragraph',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo! bar baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo' +
							'<ins data-diff-action="insert">!</ins>' +
							' bar baz' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Minimal text change at end of paragraph',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo bar !baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar ' +
							'<ins data-diff-action="insert">!</ins>' +
							'baz' +
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
						'<p data-diff-action="remove"><del>foo</del></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert"><ins>boo</ins></p>' +
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
						'<p data-diff-action="remove"><del>foo</del></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert"><ins>boo</ins></p>' +
					'</div>'
			},
			{
				msg: 'Attributes added to ClassAttributeNodes',
				oldDoc: '<figure><img src="http://example.org/foo.jpg"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure><img src="http://example.org/boo.jpg"><figcaption>bar</figcaption></figure>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<figure data-diff-action="structural-change" data-diff-id="0"><img src="http://example.org/boo.jpg" width="0" height="0" alt="null"><figcaption>bar</figcaption></figure>' +
					'</div>',
				expectedDescriptions: [
					'visualeditor-changedesc-changed,src,http://example.org/foo.jpg,http://example.org/boo.jpg'
				]
			},
			{
				msg: 'Attributes added to ClassAttributeNodes with classes',
				oldDoc: '<figure class="ve-align-right"><img src="http://example.org/foo.jpg"><figcaption>bar</figcaption></figure>',
				newDoc: '<figure class="ve-align-right"><img src="http://example.org/boo.jpg"><figcaption>bar</figcaption></figure>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<figure class="ve-align-right" data-diff-action="structural-change" data-diff-id="0"><img src="http://example.org/boo.jpg" width="0" height="0" alt="null"><figcaption>bar</figcaption></figure>' +
					'</div>',
				expectedDescriptions: [
					'visualeditor-changedesc-changed,src,http://example.org/foo.jpg,http://example.org/boo.jpg'
				]
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
						'<p data-diff-action="insert"><ins>Foo</ins></p>' +
					'</div>'
			},
			{
				msg: 'Multi-node insert',
				oldDoc: '',
				newDoc: '<p>foo</p><p>bar</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="remove"><del></del></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert"><ins>foo</ins></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert"><ins>bar</ins></p>' +
					'</div>'
			},
			{
				msg: 'Multi-node remove',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="remove"><del>foo</del></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="remove"><del>bar</del></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p data-diff-action="insert"><ins></ins></p>' +
					'</div>'
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
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div data-diff-action="insert" rel="ve:Alien" about="#group1">A</div>' +
						'<div data-diff-action="insert" rel="ve:Alien" about="#group1">B</div>' +
						'<div data-diff-action="insert" rel="ve:Alien" about="#group1">C</div>' +
					'</div>'
			},
			{
				msg: 'Inline node inserted',
				oldDoc: '<p>foo bar baz quux</p>',
				newDoc: '<p>foo bar <!--whee--> baz quux</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar ' +
							'<ins data-diff-action="insert">' + comment( 'whee' ) + ' </ins>' +
							'baz quux' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Inline node removed',
				oldDoc: '<p>foo bar <!--whee--> baz quux</p>',
				newDoc: '<p>foo bar baz quux</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar ' +
							'<del data-diff-action="remove">' + comment( 'whee' ) + ' </del>' +
							'baz quux' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Inline node modified',
				oldDoc: '<p>foo bar <!--whee--> baz quux</p>',
				newDoc: '<p>foo bar <!--wibble--> baz quux</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo bar ' +
							'<span data-diff-action="change-remove">' + comment( 'whee' ) + '</span>' +
							'<span data-diff-action="change-insert" data-diff-id="0">' + comment( 'wibble' ) + '</span>' +
							' baz quux' +
						'</p>' +
					'</div>',
				expectedDescriptions: [
					'visualeditor-changedesc-comment,whee,wibble'
				]
			},
			{
				msg: 'Alien node modified',
				oldDoc: '<p>foo</p><div rel="ve:Alien">Alien old</div>',
				newDoc: '<p>foo</p><div rel="ve:Alien">Alien new</div>',
				expected:
					'<p data-diff-action="none">foo</p>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<div rel="ve:Alien" data-diff-action="remove">Alien old</div>' +
						'<div rel="ve:Alien" data-diff-action="insert">Alien new</div>' +
					'</div>'
			},
			{
				msg: 'Paragraphs moved',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '<p>bar</p><p>foo</p>',
				expected:
					'<p data-diff-action="none" data-diff-move="up">bar</p>' +
					'<p data-diff-action="none">foo</p>',
				hasMoves: true
			},
			{
				msg: 'Paragraphs moved, with insert',
				oldDoc: '<p>foo</p><p>bar</p>',
				newDoc: '<p>baz</p><p>bar</p><p>foo</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change"><p data-diff-action="insert"><ins>baz</ins></p></div>' +
					'<p data-diff-action="none" data-diff-move="up">bar</p>' +
					'<p data-diff-action="none">foo</p>',
				hasMoves: true
			},
			{
				msg: 'Paragraphs moved, with remove',
				oldDoc: '<p>baz</p><p>foo</p><p>bar</p>',
				newDoc: '<p>bar</p><p>foo</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change"><p data-diff-action="remove"><del>baz</del></p></div>' +
					'<p data-diff-action="none" data-diff-move="up">bar</p>' +
					'<p data-diff-action="none">foo</p>',
				hasMoves: true
			},
			{
				msg: 'Paragraphs moved and modified',
				oldDoc: '<p>foo bar baz</p><p>quux whee</p>',
				newDoc: '<p>quux whee!</p><p>foo bar baz!</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change" data-diff-move="up">' +
						'<p>quux whee<ins data-diff-action="insert">!</ins></p>' +
					'</div>' +
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo bar baz<ins data-diff-action="insert">!</ins></p>' +
					'</div>',
				hasMoves: true
			},
			{
				msg: 'Insert table column',
				oldDoc: '<table><tr><td>A</td></tr><tr><td>C</td></tr></table>',
				newDoc: '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<table><tbody>' +
							'<tr><td>A</td>' +
							'<td data-diff-action="structural-insert"><p data-diff-action="insert">B</p></td></tr>' +
							'<tr><td>C</td>' +
							'<td data-diff-action="structural-insert"><p data-diff-action="insert">D</p></td></tr>' +
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
							'<tr><td>A</td><td data-diff-action="structural-remove"><p data-diff-action="remove">B</p></td></tr>' +
							'<tr><td>C</td><td data-diff-action="structural-remove"><p data-diff-action="remove">D</p></td></tr>' +
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
								'<td data-diff-action="structural-remove"><p data-diff-action="remove">D</p></td>' +
								'<td data-diff-action="structural-remove"><p data-diff-action="remove">E</p></td>' +
								'<td data-diff-action="structural-remove"><p data-diff-action="remove">F</p></td>' +
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
				oldDoc: '<p>foo <a href="http://example.org/quuz">bar</a> baz</p>',
				newDoc: '<p>foo <a href="http://example.org/whee">bar</a> baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo <span data-diff-action="change-remove"><a href="http://example.org/quuz" rel="noopener" target="_blank">bar</a></span><span data-diff-action="change-insert" data-diff-id="0"><a href="http://example.org/whee" rel="noopener" target="_blank">bar</a></span> baz</p>' +
					'</div>',
				expectedDescriptions: [
					'visualeditor-changedesc-link-href,http://example.org/quuz,http://example.org/whee'
				]
			},
			{
				msg: 'Nested annotation change',
				oldDoc: '<p><a href="http://example.org/">foo bar baz</a></p>',
				newDoc: '<p><a href="http://example.org/">foo <b>bar</b> baz</a></p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p><a href="http://example.org/" rel="noopener" target="_blank">foo <del data-diff-action="remove">bar</del><ins data-diff-action="insert"><b>bar</b></ins> baz</a></p>' +
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
							'<li data-diff-action="structural-insert"><p data-diff-action="insert">bar</p></li>' +
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
							'<li data-diff-action="structural-remove"><p data-diff-action="remove">bar</p></li>' +
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
						'<ul data-diff-action="structural-insert">' +
							'<li data-diff-action="structural-insert"><ul><li><p>foo</p></li></ul></li>' +
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
			},
			{
				msg: 'Inline widget with same type but not diff comparable is marked as a remove/insert',
				oldDoc: '<p>Foo bar baz<span rel="test:inlineWidget" data-name="FooWidget"></span></p>',
				newDoc: '<p>Foo bar baz<span rel="test:inlineWidget" data-name="BarWidget"></span></p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>Foo bar baz' +
							'<del data-diff-action="remove"><span rel="test:inlineWidget" data-name="FooWidget"></span></del>' +
							'<ins data-diff-action="insert"><span rel="test:inlineWidget" data-name="BarWidget"></span></ins>' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Adjacent inline node removed with common prefix modified',
				oldDoc: '<p>foo bar <!--whee--><!--wibble--></p>',
				newDoc: '<p>foo quux bar <!--whee--></p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>foo ' +
							'<ins data-diff-action="insert">quux </ins>' +
							'bar ' +
							'<span rel="ve:Comment" data-ve-comment="whee">&nbsp;</span>' +
							'<del data-diff-action="remove"><span rel="ve:Comment" data-ve-comment="wibble">&nbsp;</span></del>' +
						'</p>' +
					'</div>'
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

	for ( i = 0, len = cases.length; i < len; i++ ) {
		ve.test.utils.runDiffElementTest( assert, cases[ i ] );
	}

	ve.dm.modelRegistry.unregister( InlineWidgetNode );
} );

QUnit.test( 'describeChange', function ( assert ) {
	var i, l, key,
		cases = [
			{
				msg: 'LinkAnnotation: Random attribute test (fallback)',
				testedKey: 'foo',
				before: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: {
						href: 'https://www.example.org/foo'
					}
				} ),
				after: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: {
						href: 'https://www.example.org/foo',
						foo: '!!'
					}
				} ),
				expected: 'visualeditor-changedesc-set,foo,!!'
			},
			{
				msg: 'LinkAnnotation: Href change',
				testedKey: 'href',
				before: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/foo' }
				} ),
				after: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/bar' }
				} ),
				expected: 'visualeditor-changedesc-link-href,https://www.example.org/foo,https://www.example.org/bar'
			},
			{
				msg: 'LinkAnnotation: Href fragment change',
				testedKey: 'href',
				before: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/foo#bar' }
				} ),
				after: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/foo#baz' }
				} ),
				expected: 'visualeditor-changedesc-link-href,https://www.example.org/foo#bar,https://www.example.org/foo#baz'
			},
			{
				msg: 'LanguageAnnotation: Lang change',
				testedKey: 'lang',
				before: new ve.dm.LanguageAnnotation( {
					type: 'meta/language',
					attributes: { lang: 'en', dir: 'ltr' }
				} ),
				after: new ve.dm.LanguageAnnotation( {
					type: 'meta/language',
					attributes: { lang: 'fr', dir: 'ltr' }
				} ),
				expected: 'visualeditor-changedesc-language,langname-en,langname-fr'
			},
			{
				msg: 'LanguageAnnotation: Dir change',
				testedKey: 'dir',
				before: new ve.dm.LanguageAnnotation( {
					type: 'meta/language',
					attributes: { lang: 'en', dir: 'ltr' }
				} ),
				after: new ve.dm.LanguageAnnotation( {
					type: 'meta/language',
					attributes: { lang: 'en', dir: 'rtl' }
				} ),
				expected: 'visualeditor-changedesc-direction,ltr,rtl'
			},
			{
				msg: 'LanguageAnnotation: Style change (fallback)',
				testedKey: 'style',
				before: new ve.dm.LanguageAnnotation( {
					type: 'meta/language',
					attributes: { lang: 'en', dir: 'ltr', style: 'font-weight:800' }
				} ),
				after: new ve.dm.LanguageAnnotation( {
					type: 'meta/language',
					attributes: { lang: 'en', dir: 'ltr', style: 'font-weight:700' }
				} ),
				expected: 'visualeditor-changedesc-changed,style,font-weight:800,font-weight:700'
			},
			{
				msg: 'SpanAnnotation: Style change',
				testedKey: 'style',
				before: new ve.dm.SpanAnnotation( {
					attributes: { style: 'font-weight:800' }
				} ),
				after: new ve.dm.SpanAnnotation( {
					attributes: { style: 'font-weight:700' }
				} ),
				expected: 'visualeditor-changedesc-style,font-weight:800,font-weight:700'
			},
			{
				msg: 'SpanAnnotation: Title change (fallback)',
				testedKey: 'title',
				before: new ve.dm.SpanAnnotation( {
					attributes: { style: 'font-weight:800', title: 'Hello' }
				} ),
				after: new ve.dm.SpanAnnotation( {
					attributes: { style: 'font-weight:800', title: 'Farewell' }
				} ),
				expected: 'visualeditor-changedesc-changed,title,Hello,Farewell'
			}
		];

	for ( i = 0, l = cases.length; i < l; i++ ) {
		key = cases[ i ].testedKey;
		assert.deepEqual(
			cases[ i ].before.constructor.static.describeChange(
				key,
				{ from: cases[ i ].before.getAttribute( key ), to: cases[ i ].after.getAttribute( key ) }
			),
			cases[ i ].expected,
			cases[ i ].msg
		);
	}
} );
