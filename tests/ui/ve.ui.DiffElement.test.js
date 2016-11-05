/*!
 * VisualEditor DiffElement Trigger tests.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.DiffElement' );

/* Tests */

QUnit.test( 'Diffing', function ( assert ) {
	var i, len, visualDiff, diffElement,
		cases = [
			{
				msg: 'Simple text change',
				oldDoc: '<p>foo bar baz</p>',
				newDoc: '<p>foo car baz</p>',
				expected:
					'<div class="ve-ui-diffElement-doc-child-change">' +
						'<p class="ve-ui-diffElement-change">' +
							'foo ' +
							'<span class="ve-ui-diffElement-remove">bar</span>  <span class="ve-ui-diffElement-insert">car</span>' +
							' baz' +
						'</p>' +
					'</div>'
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
