/*!
 * VisualEditor DiffElement Trigger tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.DiffElement' );

/* Tests */

QUnit.test( 'Diffing', function ( assert ) {
	var i, len, visualDiff, diffElement,
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
							'<span class="ve-ui-diffElement-remove">bar</span> <span class="ve-ui-diffElement-insert">car</span>' +
							' baz' +
						'</p>' +
					'</div>'
			},
			{
				msg: 'Simple text change with non-whitespace word break boundaires',
				oldDoc: '<p>foo"bar"baz</p>',
				newDoc: '<p>foo"bXr"baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p>' +
							'foo"' +
							'<span class="ve-ui-diffElement-remove">bar</span><span class="ve-ui-diffElement-insert">bXr</span>' +
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
							'<span class="ve-ui-diffElement-remove">文係</span><span class="ve-ui-diffElement-insert">文唔係</span>' +
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
			}
		];

	for ( i = 0, len = cases.length; i < len; i++ ) {
		visualDiff = new ve.dm.VisualDiff(
			ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( cases[ i ].oldDoc ) ),
			ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( cases[ i ].newDoc ) )
		);
		diffElement = new ve.ui.DiffElement( visualDiff );
		assert.strictEqual( diffElement.$element.html(), cases[ i ].expected, cases[ i ].msg );
	}
} );
