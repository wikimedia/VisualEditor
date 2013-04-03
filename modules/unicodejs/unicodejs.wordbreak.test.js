/*!
 * Wordbreak module tests
 *
 * @copyright 2013 UnicodeJS team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 'unicodeJS.wordbreak' );

QUnit.test( 'isBreakInText', function ( assert ) {
	var i, result, context,
		text =
			/*jshint quotmark:double */
			// 0 - 10
			"\u0300xyz'd a' " +
			// 10 - 20
			"'a a-b 1a\r" +
			// 20 - 30
			"\nカタカナ3,1.2" +
			// 30 - 40
			" a_b_3_ナ_ " +
			// 40 - 50
			"汉字/漢字 c\u0300\u0327k" +
			// 50 - 60
			" c\u0300\u0327",
			/*jshint quotmark:single */
		breaks = [
			0, 1, 6, 7, 8, 9, 10,
			11, 12, 13, 14, 15, 16, 17, 19,
			21, 25, 30,
			31, 39, 40,
			41, 42, 43, 44, 45, 46, 50,
			51, 54
		];

	QUnit.expect( text.length + 1 );

	for ( i = 0; i <= text.length; i++ ) {
		result = ( breaks.indexOf( i ) !== -1 );
		context =
			text.substring( Math.max( i - 4, 0 ), i ) +
			'│' +
			text.substring( i, Math.min( i + 4, text.length ) )
		;
		assert.equal(
			unicodeJS.wordbreak.isBreakInText( text, i ),
			result,
			'Position ' + i + ' is ' + ( result ? '' : 'not ' ) + 'a break: ' + context
		);
	}
});
