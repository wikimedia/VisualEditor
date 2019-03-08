/*!
 * VisualEditor UserInterface FragmentInspector tests.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.FragmentInspector' );

/* Tests */

QUnit.test( 'find fragments', function ( assert ) {
	var done = assert.async(),
		promise = Promise.resolve(),
		surface = ve.test.utils.createSurfaceFromHtml(
			'<p>Foo <a href="bar">bar</a> baz  x</p>' +
			'<p><!-- comment --> comment</p>'
		),
		surfaceModel = surface.getModel(),
		fooHash = 'hd5a13e54366d44db',
		barHash = 'h071cb84c069d07a4',
		quuxHash = 'hb085ebec56a162a4',
		cases = [
			{
				msg: 'Collapsed selection expands to word',
				name: 'link',
				range: new ve.Range( 2 ),
				expectedRange: new ve.Range( 1, 4 ),
				expectedData: function ( data ) {
					data.splice(
						1, 3,
						[ 'F', [ fooHash ] ],
						[ 'o', [ fooHash ] ],
						[ 'o', [ fooHash ] ]
					);
				}
			},
			{
				msg: 'Cancel restores original data & selection',
				name: 'link',
				range: new ve.Range( 2 ),
				expectedRange: new ve.Range( 2 ),
				expectedData: function () {},
				actionData: {}
			},
			{
				msg: 'Collapsed selection inside existing link',
				name: 'link',
				range: new ve.Range( 6 ),
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: function () {}
			},
			{
				msg: 'Selection inside existing link',
				name: 'link',
				range: new ve.Range( 6, 7 ),
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: function () {}
			},
			{
				msg: 'Selection spanning existing link',
				name: 'link',
				range: new ve.Range( 6, 10 ),
				expectedRange: new ve.Range( 5, 10 ),
				expectedData: function ( data ) {
					data.splice(
						8, 2,
						[ ' ', [ barHash ] ],
						[ 'b', [ barHash ] ]
					);
				}
			},
			{
				msg: 'Selection with whitespace is trimmed',
				name: 'link',
				range: new ve.Range( 1, 5 ),
				expectedRange: new ve.Range( 1, 4 )
			},
			{
				msg: 'Link insertion',
				name: 'link',
				range: new ve.Range( 13 ),
				input: function () {
					this.annotationInput.getTextInputWidget().setValue( 'quux' );
				},
				expectedRange: new ve.Range( 17 ),
				expectedData: function ( data ) {
					data.splice(
						13, 0,
						[ 'q', [ quuxHash ] ],
						[ 'u', [ quuxHash ] ],
						[ 'u', [ quuxHash ] ],
						[ 'x', [ quuxHash ] ]
					);
				}
			},
			{
				msg: 'Link insertion with no input is no-op',
				name: 'link',
				range: new ve.Range( 13 ),
				expectedRange: new ve.Range( 13 ),
				expectedData: function () {}
			},
			{
				msg: 'Link removed (clear input)',
				name: 'link',
				range: new ve.Range( 5, 8 ),
				input: function () {
					this.annotationInput.getTextInputWidget().setValue( '' );
				},
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: function ( data ) {
					data.splice(
						5, 3,
						'b', 'a', 'r'
					);
				}
			},
			{
				msg: 'Clear input & cancel is still a no-op',
				name: 'link',
				range: new ve.Range( 5, 8 ),
				input: function () {
					this.annotationInput.getTextInputWidget().setValue( '' );
				},
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: function () {},
				actionData: {}
			},
			{
				msg: 'Comment change',
				name: 'comment',
				range: new ve.Range( 17, 19 ),
				input: function () {
					this.textWidget.setValue( 'new' );
				},
				expectedRange: new ve.Range( 17, 19 ),
				expectedData: function ( data ) {
					data.splice(
						17, 2,
						{
							type: 'comment',
							attributes: { text: ' new ' }
						},
						{ type: '/comment' }
					);
				}
			},
			{
				msg: 'Comment cancel',
				name: 'comment',
				range: new ve.Range( 17, 19 ),
				input: function () {
					this.textWidget.setValue( 'new' );
				},
				expectedRange: new ve.Range( 17, 19 ),
				expectedData: function () {},
				actionData: {}
			},
			{
				msg: 'Comment clear (empty input)',
				name: 'comment',
				range: new ve.Range( 17, 19 ),
				input: function () {
					this.textWidget.setValue( '' );
				},
				expectedRange: new ve.Range( 17 ),
				expectedData: function ( data ) {
					data.splice( 17, 2 );
				}
			},
			{
				msg: 'Comment delete (action button)',
				name: 'comment',
				range: new ve.Range( 17, 19 ),
				expectedRange: new ve.Range( 17 ),
				expectedData: function ( data ) {
					data.splice( 17, 2 );
				},
				actionData: { action: 'remove' }
			}
		];

	surface.getView().showSelectionState = function () {};

	cases.forEach( function ( caseItem ) {
		promise = promise.then( function () {
			return surface.context.inspectors.getWindow( caseItem.name ).then( function ( inspector ) {
				var windowData,
					linearData = ve.copy( surfaceModel.getDocument().getFullData() );

				surfaceModel.setLinearSelection( caseItem.range );
				windowData = { surface: surface, fragment: surfaceModel.getFragment() };
				return inspector.setup( windowData ).then( function () {
					return inspector.ready( windowData ).then( function () {
						if ( caseItem.input ) {
							caseItem.input.call( inspector );
						}
						// TODO: Skips ActionProcess
						return inspector.teardown( caseItem.actionData || { action: 'done' } ).then( function () {

							assert.equalRange( surfaceModel.getSelection().getRange(), caseItem.expectedRange, caseItem.msg + ': range' );
							if ( caseItem.expectedData ) {
								caseItem.expectedData( linearData );
								assert.equalLinearData(
									surfaceModel.getDocument().getFullData(),
									linearData,
									caseItem.msg + ': data'
								);
							}
							while ( surfaceModel.canUndo() ) {
								surfaceModel.undo();
							}
						} );
					} );
				} );
			} );
		} );
	} );
	promise.finally( function () {
		done();
	} );
} );
