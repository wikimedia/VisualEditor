/*!
 * VisualEditor ContentEditable selection tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ce.Selection' );

QUnit.test( 'Rects', function ( assert ) {
	var html =
			'<div rel="ve:Alien" style="width: 300px; height: 200px;">foo</div>' +
			'<div rel="ve:Alien" style="position: relative;">' +
				'<div style="position: absolute; width: 400px; height: 100px;">foo</div>' +
				'<div style="position: absolute; width: 150px; height: 500px;">bar</div>' +
			'</div>' +
			'<p></p>' +
			'<table><tr><td style="width: 200px; height: 50px; border: 0; padding: 0; line-height: 0;"></td></tr></table>',
		view = ve.test.utils.createSurfaceViewFromHtml( html ),
		slugHeight = view.getDocument().getDocumentNode().children[ 2 ].$element[ 0 ].childNodes[ 0 ].offsetHeight,
		model = view.getModel(),
		cases = [
			{
				rangeOrSelection: { type: 'null' },
				msg: 'Null selection',
				expectedRects: null,
				expectedBoundingRect: null,
				expectedStartAndEndRects: null
			},
			{
				rangeOrSelection: new ve.Range( 0, 2 ),
				expectedRects: [ { width: 300, height: 200 } ],
				msg: 'Simple focusable node'
			},
			{
				rangeOrSelection: new ve.Range( 2, 4 ),
				expectedRects: [ { width: 400, height: 100 }, { width: 150, height: 500 } ],
				expectedBoundingRect: { width: 400, height: 500 },
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
					tableRange: new ve.Range( 6, 16 ),
					fromCol: 0,
					fromRow: 0
				},
				expectedRects: [ { width: 200, height: 50 } ],
				msg: 'Table selection'
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

	cases.forEach( function ( caseItem ) {
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
			ve.copy( view.getSelection().getSelectionStartAndEndRects(), null, filterProps ),
			caseItem.expectedStartAndEndRects !== undefined ?
				caseItem.expectedStartAndEndRects :
				{ start: caseItem.expectedRects[ 0 ], end: caseItem.expectedRects[ 0 ] },
			caseItem.msg + ': start and end rects'
		);
	} );

	view.destroy();
} );
