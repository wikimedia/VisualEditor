/*!
 * Wordbreak module tests
 *
 * @copyright 2013 UnicodeJS team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 'unicodeJS.wordbreak' );

QUnit.test( 'isBreak', function ( assert ) {
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
			"汉字/漢字 c\u0300\u0327k  " +
			// 50 - 60
			"\ud800\udf08" + // U+10308 OLD ITALIC LETTER THE
			"\ud800\udf08\u0302" + // U+10308 OLD ITALIC LETTER THE + combining circumflex
			"\ud800\udf0a" + // U+1030A OLD ITALIC LETTER KA
			" pad " +
			"\ud800\udf0a" + // U+1030A OLD ITALIC LETTER KA
			"\ud800\udf0a" + // U+1030A OLD ITALIC LETTER KA
			// 60 - 65: "a." tests end of para
			" c\u0300\u0327 a.",
			/*jshint quotmark:single */
		textString = new unicodeJS.TextString( text ),
		breaks = [
			0, 1, 6, 7, 8, 9, 10,
			11, 12, 13, 14, 15, 16, 17, 19,
			21, 25, 30,
			31, 39, 40,
			41, 42, 43, 44, 45, 46, 48, 49, 50,
			51, 52, // TODO: these should not be in the list
			53, 54, 57, 58,
			59, // TODO: this should not be in the list
			60,
			61, 62, 63, 64, 65
		];

	QUnit.expect( textString.getLength() + 1 );

	for ( i = 0; i <= textString.getLength(); i++ ) {
		result = ( breaks.indexOf( i ) !== -1 );
		context =
			textString.substring( Math.max( i - 4, 0 ), i ).getString() +
			'│' +
			textString.substring( i, Math.min( i + 4, text.length ) ).getString()
		;
		assert.equal(
			unicodeJS.wordbreak.isBreak( textString, i ),
			result,
			'Position ' + i + ' is ' + ( result ? '' : 'not ' ) + 'a break: ' + context
		);
	}
});

QUnit.test( 'nextBreakOffset/prevBreakOffset', function ( assert ) {
	var i, offset = 0,
		text = 'The quick brown fox',
		textString = new unicodeJS.TextString( text ),
		breaks = [ 0, 0, 3, 4, 9, 10, 15, 16, 19, 19 ];

	QUnit.expect( 2*(breaks.length - 2) );

	for ( i = 2; i < breaks.length; i++ ) {
		offset = unicodeJS.wordbreak.nextBreakOffset( textString, offset );
		assert.equal( offset, breaks[i], 'Next break is at position ' + breaks[i] );
	}
	for ( i = breaks.length - 3; i >= 0; i-- ) {
		offset = unicodeJS.wordbreak.prevBreakOffset( textString, offset );
		assert.equal( offset, breaks[i], 'Previous break is at position ' + breaks[i] );
	}
});

QUnit.test( 'nextBreakOffset/prevBreakOffset (ignore whitespace)', function ( assert ) {
	var i, offset = 0,
		text = '   The quick  brown ..fox jumps... 3.14159 すどくスドク   ',
		textString = new unicodeJS.TextString( text ),
		nextBreaks = [ 6, 12, 19, 25, 31, 42, 49, 52 ],
		prevBreaks = [ 46, 35, 26, 22, 14, 7, 3, 0 ];

	QUnit.expect( nextBreaks.length + prevBreaks.length + 6 );

	for ( i = 0; i < nextBreaks.length; i++ ) {
		offset = unicodeJS.wordbreak.nextBreakOffset( textString, offset, true );
		assert.equal( offset, nextBreaks[i], 'Next break is at position ' + nextBreaks[i] );
	}
	for ( i = 0; i < prevBreaks.length; i++ ) {
		offset = unicodeJS.wordbreak.prevBreakOffset( textString, offset, true );
		assert.equal( offset, prevBreaks[i], 'Previous break is at position ' + prevBreaks[i] );
	}

	assert.equal( unicodeJS.wordbreak.nextBreakOffset( textString, 9, true ),
		 12, 'Jump to end of word when starting in middle of word');
	assert.equal( unicodeJS.wordbreak.nextBreakOffset( textString, 3, true ),
		 6, 'Jump to end of word when starting at start of word');
	assert.equal( unicodeJS.wordbreak.nextBreakOffset( textString, 13, true ),
		 19, 'Jump to end of word when starting in double whitespace');
	assert.equal( unicodeJS.wordbreak.prevBreakOffset( textString, 17, true ),
		 14, 'Jump to start of word when starting in middle of word');
	assert.equal( unicodeJS.wordbreak.prevBreakOffset( textString, 6, true ),
		 3, 'Jump to start of word when starting at end of word');
	assert.equal( unicodeJS.wordbreak.prevBreakOffset( textString, 13, true ),
		 7, 'Jump to start of word when starting in double whitespace');
});
