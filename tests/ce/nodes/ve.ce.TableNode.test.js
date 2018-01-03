/*!
 * VisualEditor ContentEditable TableNode tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.TableNode' );

/* Tests */

QUnit.test( 'getNearestCellNode', function ( assert ) {
	var i,
		view = ve.test.utils.createSurfaceViewFromHtml(
			'<table>' +
				'<tr><td>Foo' +
					'<table><tr><td>Bar</td></tr></table>' +
				'</td><td>Baz</td></tr>' +
			'</table>'
		),
		documentNode = view.getDocument().getDocumentNode(),
		tableNode = documentNode.children[ 0 ],
		$tableNode = tableNode.$element,
		cases = [
			{
				msg: 'Table cell',
				element: $tableNode.find( 'td' )[ 0 ],
				node: documentNode.children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ]
			},
			{
				msg: 'Paragraph inside cell',
				element: $tableNode.find( 'td' ).last().find( 'p' )[ 0 ],
				node: documentNode.children[ 0 ].children[ 0 ].children[ 0 ].children[ 1 ]
			},
			{
				msg: 'Cell inside nested table',
				element: $tableNode.find( 'table td' ).first()[ 0 ],
				node: null
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		assert.strictEqual( tableNode.getNearestCellNode( cases[ i ].element ), cases[ i ].node, cases[ i ].msg );
	}
	view.destroy();
} );

QUnit.test( 'onTableMouseDown', function ( assert ) {
	var i,
		view = ve.test.utils.createSurfaceViewFromHtml(
			'<table><tr><td>Foo</td><td>Bar</td></tr></table>'
		),
		documentNode = view.getDocument().getDocumentNode(),
		tableNode = documentNode.children[ 0 ],
		$tableNode = tableNode.$element,
		mockEvent = {
			preventDefault: function () {}
		},
		cases = [
			{
				msg: 'Table cell',
				event: {
					target: $tableNode.find( 'td' )[ 0 ]
				},
				expectedSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 20 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				}
			},
			{
				msg: 'Shift click second cell paragraph',
				event: {
					target: $tableNode.find( 'td' ).last().find( 'p' )[ 0 ],
					shiftKey: true
				},
				expectedSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 20 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				}
			}
		];

	for ( i = 0; i < cases.length; i++ ) {
		tableNode.onTableMouseDown( $.extend( mockEvent, cases[ i ].event ) );
		assert.deepEqual(
			tableNode.surface.getModel().getSelection().toJSON(),
			cases[ i ].expectedSelection,
			cases[ i ].msg
		);
		// Clear document mouse up handlers
		tableNode.onTableMouseUp();
	}
	view.destroy();
} );
