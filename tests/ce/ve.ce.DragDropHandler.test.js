/*!
 * VisualEditor ContentEditable DragDropHandler tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ce.DragDropHandler' );

QUnit.test( 'onDocumentDragStart/onDocumentDrop', ( assert ) => {
	const noChange = () => {},
		cases = [
			{
				msg: 'Simple drag and drop',
				rangeOrSelection: new ve.Range( 1, 4 ),
				targetOffset: 10,
				expectedTransfer: {
					'text/html': 'a<b>b</b><i>c</i>',
					'text/plain': 'abc'
				},
				expectedData: ( data ) => {
					const removed = data.splice( 1, 3 );
					data.splice( 7, 0, ...removed );
				},
				expectedSelection: new ve.dm.LinearSelection( new ve.Range( 7, 10 ) )
			},
			{
				msg: 'Invalid target offset',
				rangeOrSelection: new ve.Range( 1, 4 ),
				targetOffset: -1,
				expectedTransfer: {
					'text/html': 'a<b>b</b><i>c</i>',
					'text/plain': 'abc'
				},
				expectedData: noChange,
				expectedSelection: new ve.dm.LinearSelection( new ve.Range( 1, 4 ) )
			}
		];

	function testRunner( rangeOrSelection, targetOffset, expectedTransfer, expectedData, expectedSelection, msg ) {
		const view = ve.test.utils.createSurfaceViewFromDocument( ve.dm.example.createExampleDocument() ),
			dragDropHandler = view.getDragDropHandler(),
			model = view.getModel(),
			data = ve.copy( model.getDocument().getFullData() ),
			dataTransfer = {},
			mockEvent = {
				originalEvent: {
					dataTransfer: {
						setData: ( key, value ) => {
							dataTransfer[ key ] = value;
						},
						getData: ( key ) => dataTransfer[ key ]
					}
				},
				preventDefault: () => {},
				stopPropagation: () => {}
			};

		// Mock drop coords
		view.getOffsetFromCoords = function () {
			return targetOffset;
		};

		expectedData( data );

		model.setSelection( ve.test.utils.selectionFromRangeOrSelection( model.getDocument(), rangeOrSelection ) );

		dragDropHandler.onDocumentDragStart( mockEvent );
		assert.deepEqual(
			dataTransfer,
			expectedTransfer,
			'dataTransfer data set after drag start'
		);

		dragDropHandler.onDocumentDrop( mockEvent );

		assert.equalLinearData( model.getDocument().getFullData(), data, msg + ': data' );
		assert.equalHash( model.getSelection(), expectedSelection, msg + ': selection' );
		view.destroy();
	}

	cases.forEach( ( caseItem ) => {
		testRunner(
			caseItem.rangeOrSelection, caseItem.targetOffset, caseItem.expectedTransfer, caseItem.expectedData,
			caseItem.expectedSelection, caseItem.msg
		);
	} );

} );
