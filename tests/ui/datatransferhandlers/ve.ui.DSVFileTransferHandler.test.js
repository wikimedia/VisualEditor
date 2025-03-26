/*!
 * VisualEditor UserInterface DSVFileTransferHandler tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.DSVFileTransferHandler' );

/* Tests */

QUnit.test( 'getInsertableData', ( assert ) => {
	const done = assert.async(),
		fn = () => {},
		item = {
			getAsFile: () => ( { name: 'File' } )
		},
		mockSurface = {
			createProgress: () => ve.createDeferred().resolve(
				{ setProgress: fn },
				ve.createDeferred().resolve().promise()
			).promise()
		},
		mockReader = {
			readAsText: fn,
			result: 'a,b\nc,d\n'
		};

	const handler = ve.ui.dataTransferHandlerFactory.create( 'dsv', mockSurface, item );
	// Override with a mock reader then trigger file load event
	handler.reader = mockReader;
	handler.onFileLoad();

	handler.getInsertableData().done( ( data ) => {
		assert.deepEqual( data, [
			{ type: 'table' },
			{ type: 'tableSection', attributes: { style: 'body' } },
			{ type: 'tableRow' },
			{ type: 'tableCell', attributes: { style: 'header' } },
			{ type: 'paragraph', internal: { generated: 'wrapper' } },
			'a',
			{ type: '/paragraph' },
			{ type: '/tableCell' },
			{ type: 'tableCell', attributes: { style: 'header' } },
			{ type: 'paragraph', internal: { generated: 'wrapper' } },
			'b',
			{ type: '/paragraph' },
			{ type: '/tableCell' },
			{ type: '/tableRow' },
			{ type: 'tableRow' },
			{ type: 'tableCell', attributes: { style: 'data' } },
			{ type: 'paragraph', internal: { generated: 'wrapper' } },
			'c',
			{ type: '/paragraph' },
			{ type: '/tableCell' },
			{ type: 'tableCell', attributes: { style: 'data' } },
			{ type: 'paragraph', internal: { generated: 'wrapper' } },
			'd',
			{ type: '/paragraph' },
			{ type: '/tableCell' },
			{ type: '/tableRow' },
			{ type: '/tableSection' },
			{ type: '/table' }
		], 'DSV data' );
		done();
	} );
} );
