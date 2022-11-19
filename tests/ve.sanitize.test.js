/*!
 * VisualEditor HTML sanitization utilities tests.
 *
 * @copyright 2011-2022 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.sanitize' );

QUnit.test( 've.sanitizeHtml', function ( assert ) {

	var cases = [
		{
			msg: 'Unsafe link href removed',
			html: '<a href="javascript:alert(1);">Foo</a>',
			expected: '<a>Foo</a>'
		},
		{
			msg: 'Unsafe onclick removed',
			html: '<span onclick="alert(1);">Foo</span>',
			expected: '<span>Foo</span>'
		},
		{
			msg: 'script and style elements removed',
			html: '<script></script><style></style>',
			expected: ''
		},
		{
			msg: 'style attribute allowed',
			html: '<span style="font-weight: 700;">Foo</span>',
			expected: '<span style="font-weight: 700;">Foo</span>',
			fails: true
		},
		{
			msg: 'RDFa attributes allowed',
			html: '<span about="#1" rel="#2" resource="#3" property="#4" content="#5" dataType="#6" typeof="#7">Foo</span>',
			expected: '<span about="#1" rel="#2" resource="#3" property="#4" content="#5" dataType="#6" typeof="#7">Foo</span>'
		},
		{
			msg: 'figure-inline element allowed',
			html: '<figure-inline></figure-inline>',
			expected: '<figure-inline></figure-inline>'
		}
	];

	cases.forEach( function ( caseItem ) {
		var actual = document.createElement( 'div' );
		var nodes = ve.sanitizeHtml( caseItem.html );
		Array.prototype.forEach.call( nodes, function ( node ) {
			actual.appendChild( node );
		} );

		var expected = document.createElement( 'div' );
		expected.innerHTML = caseItem.expected;
		if ( caseItem.fails ) {
			assert.notEqualDomElement( actual, expected, caseItem.msg );
		} else {
			assert.equalDomElement( actual, expected, caseItem.msg );
		}
	} );

} );

QUnit.test( 've.sanitizeHtmlToDocument', function ( assert ) {

	var nodes = ve.sanitizeHtml( '<a href="allowed">Foo</a>' );
	var body = document.createElement( 'body' );
	Array.prototype.forEach.call( nodes, function ( node ) {
		body.appendChild( node );
	} );
	var sanitizedDocument = ve.sanitizeHtmlToDocument( '<a href="allowed">Foo</a>' );

	assert.equalDomElement( sanitizedDocument.body, body, 'Body node is the same as if we used ve.sanitizeHtml' );

} );
