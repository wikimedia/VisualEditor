/*!
 * VisualEditor ContentEditable selection tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.Selection' );

QUnit.test( 'Rects', ( assert ) => {
	const html = ve.dm.example.singleLine`
			<div rel="ve:Alien" style="width: 300px; height: 200px;">foo</div>
			<div rel="ve:Alien" style="position: relative;">
				<div style="position: absolute; width: 400px; height: 100px;">foo</div>
				<div style="position: absolute; width: 150px; height: 500px; top: 110px;">bar</div>
			</div>
			<p></p>
			<table style="border-collapse: collapse;">
				<tr>
					<td style="width: 100px; height: 50px; border: 0; padding: 0; line-height: 0;"></td>
					<td style="width: 100px; height: 50px; border: 0; padding: 0; line-height: 0;"></td>
				</tr>
			</table>
			<div rel="ve:Alien" style="position: relative;">
				<div style="position: absolute; left: 100px; top: 0px; width: 10px; height: 4px;">dot (doesn't overlap "foo")</div>
				<div style="position: absolute; left: 110px; top: 5px; width: 90px; height: 10px;">foo</div>
				<div style="position: absolute; left: 200px; top: 0px; width: 50px; height: 10px;">superscript</div>
				<div style="position: absolute; left: 100px; top: 41px; width: 10px; height: 4px;">dot (doesn't overlap "bar")</div>
				<div style="position: absolute; left: 110px; top: 30px; width: 70px; height: 10px;">bar</div>
				<div style="position: absolute; left: 180px; top: 35px; width: 40px; height: 10px;">subscript</div>
			</div>
		`,
		view = ve.test.utils.createSurfaceViewFromHtml( html ),
		slugHeight = view.getDocument().getDocumentNode().children[ 2 ].$element[ 0 ].childNodes[ 0 ].offsetHeight,
		model = view.getModel(),
		cases = [
			{
				rangeOrSelection: { type: 'null' },
				expectedRects: null,
				expectedBoundingRect: null,
				expectedStartAndEndRects: null,
				expectedFocusRect: null,
				msg: 'Null selection'
			},
			{
				rangeOrSelection: new ve.Range( 0, 2 ),
				expectedRects: [ { width: 300, height: 200 } ],
				msg: 'Simple focusable node'
			},
			{
				rangeOrSelection: new ve.Range( 2, 4 ),
				expectedRects: [ { width: 400, height: 100 }, { width: 150, height: 500 } ],
				expectedBoundingRect: { width: 400, height: 610 },
				expectedStartAndEndRects: { start: { width: 400, height: 100 }, end: { width: 150, height: 500 } },
				msg: 'Complex focusable node'
			},
			{
				rangeOrSelection: new ve.Range( 5 ),
				expectedRects: [ { width: 0, height: slugHeight } ],
				msg: 'Cursor offset in an empty paragraph'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 6, 20 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedRects: [ { width: 100, height: 50 } ],
				expectedTableBoundingRect: { width: 200, height: 50 },
				msg: 'Table selection'
			},
			{
				rangeOrSelection: new ve.Range( 20, 22 ),
				expectedRects: [
					{ width: 10, height: 4 },
					{ width: 90, height: 10 },
					{ width: 50, height: 10 },
					{ width: 10, height: 4 },
					{ width: 70, height: 10 },
					{ width: 40, height: 10 }
				],
				expectedStartAndEndRects: {
					start: { width: 150, height: 15 },
					end: { width: 120, height: 15 }
				},
				expectedBoundingRect: { width: 150, height: 45 },
				msg: 'Subscript/superscript'
			}
		];

	function filterProps( val ) {
		if ( val && val.width !== undefined ) {
			return {
				width: val.width,
				height: val.height
			};
		}
	}

	cases.forEach( ( caseItem ) => {
		model.setSelection(
			ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), caseItem.rangeOrSelection )
		);

		assert.deepEqual(
			ve.copy( view.getSelection().getSelectionRects(), null, filterProps ),
			caseItem.expectedRects,
			caseItem.msg + ': rects'
		);
		assert.deepEqual(
			ve.copy( view.getSelection().getSelectionBoundingRect(), null, filterProps ),
			caseItem.expectedBoundingRect !== undefined ?
				caseItem.expectedBoundingRect :
				caseItem.expectedRects[ 0 ],
			caseItem.msg + ': bounding rect'
		);
		assert.deepEqual(
			ve.copy( view.getSelection().getSelectionFocusRect(), null, filterProps ),
			caseItem.expectedFocusRect !== undefined ?
				caseItem.expectedFocusRect :
				caseItem.expectedBoundingRect || caseItem.expectedRects[ 0 ],
			caseItem.msg + ': focus rect'
		);
		assert.deepEqual(
			ve.copy( view.getSelection().getSelectionStartAndEndRects(), null, filterProps ),
			caseItem.expectedStartAndEndRects !== undefined ?
				caseItem.expectedStartAndEndRects :
				{ start: caseItem.expectedRects[ 0 ], end: caseItem.expectedRects[ 0 ] },
			caseItem.msg + ': start and end rects'
		);
		if ( caseItem.expectedTableBoundingRect ) {
			assert.deepEqual(
				ve.copy( view.getSelection().getTableBoundingRect(), null, filterProps ),
				caseItem.expectedTableBoundingRect,
				caseItem.msg + ': table bounding rect'
			);
		}
	} );

	view.destroy();
} );

QUnit.test( 'getDirectionality', ( assert ) => {
	const html = ve.dm.example.singleLine`
			<p>Foo</p>
			<p style="direction: rtl;">Bar</p>
			<table style="direction: rtl;"><tr><td>Baz</td></tr></table>
		`,
		view = ve.test.utils.createSurfaceViewFromHtml( html ),
		model = view.getModel(),
		cases = [
			{
				rangeOrSelection: { type: 'null' },
				expected: 'ltr',
				msg: 'Null selection'
			},
			{
				rangeOrSelection: new ve.Range( 2 ),
				expected: 'ltr',
				msg: 'LTR linear selection'
			},
			{
				rangeOrSelection: new ve.Range( 8 ),
				expected: 'rtl',
				msg: 'RTL linear selection'
			},
			{
				rangeOrSelection: new ve.Range( 2, 8 ),
				expected: 'ltr',
				msg: 'Linear selection spanning different directions uses parent direction'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 10, 23 ),
					fromCol: 0,
					fromRow: 0
				},
				expected: 'rtl',
				msg: 'RTL table selection'
			}

		];

	cases.forEach( ( caseItem ) => {
		model.setSelection(
			ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), caseItem.rangeOrSelection )
		);

		assert.deepEqual(
			view.getSelectionDirectionality(),
			caseItem.expected,
			caseItem.msg
		);
	} );

	view.destroy();
} );

QUnit.test( 'equals', ( assert ) => {
	const surface1 = {
			getFocusedNode: () => null
		},
		surface2 = {
			getFocusedNode: () => null
		},
		modelSelection1 = new ve.dm.LinearSelection( new ve.Range( 1, 2 ) ),
		modelSelection2 = new ve.dm.LinearSelection( new ve.Range( 2, 1 ) );

	assert.true(
		new ve.ce.LinearSelection( modelSelection1, surface1 ).equals(
			new ve.ce.LinearSelection( modelSelection1, surface1 )
		),
		'Same model selection on same surface is equal'
	);

	assert.false(
		new ve.ce.LinearSelection( modelSelection1, surface1 ).equals(
			new ve.ce.LinearSelection( modelSelection1, surface2 )
		),
		'Same model selection on different surface is not equal'
	);

	assert.false(
		new ve.ce.LinearSelection( modelSelection1, surface1 ).equals(
			new ve.ce.LinearSelection( modelSelection2, surface1 )
		),
		'Different model selection on same surface is not equal'
	);
} );
