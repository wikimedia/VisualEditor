/*!
 * VisualEditor UserInterface LanguageInspector tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.LanguageInspector' );

/* Tests */

QUnit.test( 'Lifecycle tests', ( assert ) => {
	const testsDone = assert.async(),
		cases = [
			{
				msg: 'Language annotation doesn\'t expand',
				range: new ve.Range( 2, 3 ),
				expectedRange: new ve.Range( 2, 3 ),
				expectedData: ( data ) => {
					data.splice(
						2, 1,
						[ 'o', [ 'h785e2045ecc398c1' ] ]
					);
				}
			},
			{
				msg: 'Collapsed language annotation becomes insertion annotation',
				range: new ve.Range( 13 ),
				expectedRange: new ve.Range( 13 ),
				expectedData: () => {},
				expectedInsertionAnnotations: [ 'h785e2045ecc398c1' ]
			}
		].map( ( caseItem ) => Object.assign( { name: 'language' }, caseItem ) );

	ve.test.utils.runFragmentInspectorTests( assert, cases ).finally( () => testsDone() );
} );
