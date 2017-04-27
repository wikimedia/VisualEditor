/*!
 * VisualEditor DataModel LinkAnnotation tests.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.LinkAnnotation' );

QUnit.test( 'getFragment', function ( assert ) {
	var	i, l,
		cases = [
			{
				msg: 'No fragment returns empty string',
				annotation: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/' }
				} ),
				expected: ''
			},
			{
				msg: 'Blank fragment returns empty string',
				annotation: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/#' }
				} ),
				expected: ''
			},
			{
				msg: 'Extant fragment returns same string',
				annotation: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/#foo' }
				} ),
				expected: 'foo'
			},
			{
				msg: 'Hash-bang works returns full string',
				annotation: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/#!foo' }
				} ),
				expected: '!foo'
			},
			{
				msg: 'Double-hash returns empty',
				annotation: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/##foo' }
				} ),
				expected: ''
			},
			{
				msg: 'Multi-fragment returns first one',
				annotation: new ve.dm.LinkAnnotation( {
					type: 'link',
					attributes: { href: 'https://www.example.org/#foo#bar' }
				} ),
				expected: 'foo'
			}
		];

	QUnit.expect( cases.length );

	for ( i = 0, l = cases.length; i < l; i++ ) {
		assert.deepEqual( cases[ i ].annotation.getFragment(), cases[ i ].expected, cases[ i ].msg );
	}
} );
