/*!
 * VisualEditor UserInterface LinkAnnotationInspector tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.LinkAnnotationInspector' );

/* Tests */

QUnit.test( 'Lifecycle tests', ( assert ) => {
	const testsDone = assert.async(),
		fooHash = 'hd5a13e54366d44db',
		barHash = 'h071cb84c069d07a4',
		quuxHash = 'hb085ebec56a162a4',
		cases = [
			{
				msg: 'Collapsed selection expands to word',
				range: new ve.Range( 2 ),
				expectedRange: new ve.Range( 1, 4 ),
				expectedData: ( data ) => {
					data.splice(
						1, 3,
						...ve.dm.example.annotateText( 'Foo', fooHash )
					);
				}
			},
			{
				msg: 'Collapsed selection in word (noExpand)',
				range: new ve.Range( 2 ),
				setupData: { noExpand: true },
				expectedRange: new ve.Range( 2 ),
				expectedData: () => {}
			},
			{
				msg: 'Cancel restores original data & selection',
				range: new ve.Range( 2 ),
				expectedRange: new ve.Range( 2 ),
				expectedData: () => {},
				actionData: {}
			},
			{
				msg: 'Collapsed selection inside existing link',
				range: new ve.Range( 6 ),
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: () => {}
			},
			{
				msg: 'Selection inside existing link',
				range: new ve.Range( 6, 7 ),
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: () => {}
			},
			{
				msg: 'Selection spanning existing link',
				name: 'link',
				range: new ve.Range( 6, 10 ),
				expectedRange: new ve.Range( 5, 10 ),
				expectedData: ( data ) => {
					data.splice(
						8, 2,
						...ve.dm.example.annotateText( ' b', barHash )
					);
				}
			},
			{
				msg: 'Collapsed selection inside a word that is partially linked',
				range: new ve.Range( 30 ),
				expectedRange: new ve.Range( 29, 36 ),
				expectedData: ( data ) => {
					data.splice(
						29, 2,
						...ve.dm.example.annotateText( 'Fo', barHash )
					);
				}
			},
			{
				msg: 'Selection with whitespace is trimmed',
				range: new ve.Range( 1, 5 ),
				expectedRange: new ve.Range( 1, 4 )
			},
			{
				msg: 'Link insertion',
				range: new ve.Range( 13 ),
				input: function ( done ) {
					this.annotationInput.once( 'change', done );
					this.annotationInput.getTextInputWidget().setValue( 'quux' );
				},
				expectedRange: new ve.Range( 17 ),
				expectedData: ( data ) => {
					data.splice(
						13, 0,
						...ve.dm.example.annotateText( 'quux', quuxHash )
					);
				}
			},
			{
				msg: 'Link insertion with no input is no-op',
				range: new ve.Range( 13 ),
				expectedRange: new ve.Range( 13 ),
				expectedData: () => {}
			},
			{
				msg: 'Link target modified',
				range: new ve.Range( 5, 8 ),
				input: function ( done ) {
					this.annotationInput.once( 'change', done );
					this.annotationInput.getTextInputWidget().setValue( 'quux' );
				},
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: ( data ) => {
					data.splice(
						5, 3,
						...ve.dm.example.annotateText( 'bar', quuxHash )
					);
				}
			},
			{
				msg: 'Link target removed (clear input)',
				range: new ve.Range( 5, 8 ),
				input: function ( done ) {
					this.annotationInput.once( 'change', done );
					this.annotationInput.getTextInputWidget().setValue( '' );
				},
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: ( data ) => {
					data.splice(
						5, 3,
						...'bar'
					);
				}
			},
			{
				msg: 'Link target removed input then cancel is still a no-op',
				range: new ve.Range( 5, 8 ),
				input: function ( done ) {
					this.annotationInput.once( 'change', done );
					this.annotationInput.getTextInputWidget().setValue( '' );
				},
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: () => {},
				actionData: {}
			},
			{
				msg: 'Link label modified (mobile)',
				range: new ve.Range( 5, 8 ),
				isMobile: true,
				input: function ( done ) {
					this.labelInput.setValue( 'bat' );
					done();
				},
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: function ( data ) {
					data.splice(
						5, 3,
						...ve.dm.example.annotateText( 'bat', barHash )
					);
				}
			},
			{
				msg: 'Link label and link target (mobile)',
				range: new ve.Range( 5, 8 ),
				isMobile: true,
				input: function ( done ) {
					this.labelInput.setValue( 'bat' );
					this.annotationInput.once( 'change', done );
					this.annotationInput.getTextInputWidget().setValue( 'quux' );
				},
				expectedRange: new ve.Range( 5, 8 ),
				expectedData: function ( data ) {
					data.splice(
						5, 3,
						...ve.dm.example.annotateText( 'bat', quuxHash )
					);
				}
			},
			{
				msg: 'Removing link label defaults to using link target as label (mobile)',
				range: new ve.Range( 34 ),
				isMobile: true,
				input: function ( done ) {
					this.labelInput.setValue( '' );
					done();
				},
				expectedRange: new ve.Range( 31, 34 ),
				expectedData: function ( data ) {
					data.splice(
						31, 5,
						...ve.dm.example.annotateText( 'bar', barHash )
					);
				}
			}
		].map( ( caseItem ) => Object.assign( { name: 'link' }, caseItem ) );

	ve.test.utils.runFragmentInspectorTests( assert, cases ).finally( () => testsDone() );
} );
