/*!
 * VisualEditor UserInterface CommentInspector tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.CommentInspector' );

/* Tests */

QUnit.test( 'Lifecycle tests', ( assert ) => {
	const testsDone = assert.async(),
		cases = [
			{
				msg: 'Comment change',
				range: new ve.Range( 17, 19 ),
				input: function ( done ) {
					this.textWidget.setValue( 'new' );
					done();
				},
				expectedRange: new ve.Range( 17, 19 ),
				expectedData: ( data ) => {
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
				range: new ve.Range( 17, 19 ),
				input: function ( done ) {
					this.textWidget.setValue( 'new' );
					done();
				},
				actionData: {},
				expectedRange: new ve.Range( 17, 19 ),
				expectedData: () => {}
			},
			{
				msg: 'Comment clear (empty input)',
				range: new ve.Range( 17, 19 ),
				input: function ( done ) {
					this.textWidget.setValue( '' );
					done();
				},
				expectedRange: new ve.Range( 17 ),
				expectedData: ( data ) => {
					data.splice( 17, 2 );
				}
			},
			{
				msg: 'Comment delete (action button)',
				range: new ve.Range( 17, 19 ),
				actionData: { action: 'remove' },
				expectedRange: new ve.Range( 17 ),
				expectedData: ( data ) => {
					data.splice( 17, 2 );
				}
			}
		].map( ( caseItem ) => Object.assign( { name: 'comment' }, caseItem ) );

	ve.test.utils.runFragmentInspectorTests( assert, cases ).finally( () => testsDone() );
} );
