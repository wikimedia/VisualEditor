/*!
 * Wordbreak module tests
 *
 * @copyright 2013 UnicodeJS team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 'unicodeJS.wordbreak' );

QUnit.test( 'charRangeArrayRegexp', function ( assert ) {
	var i, test, doTestFunc, equalityTests, throwTests;

	equalityTests = [
		[[0x0040], '\\u0040', 'single BMP character'],
		[[0xFFFF], '\\uffff', 'highest BMP character'],
		[
			[0x005F, [0x203F, 0x2040], 0x2054, [0xFE33, 0xFE34],
				[0xFE4D, 0xFE4F], 0xFF3F],
			'[\\u005f\\u203f-\\u2040\\u2054\\ufe33-\\ufe34\\ufe4d-\\ufe4f\\uff3f]',
			'multiple BMP ranges (= ExtendNumLet from wordbreak rules)'
		],
		[[0xD7FF], '\\ud7ff', 'just below surrogate range'],
		[[0xE000], '\\ue000', 'just above surrogate range'],
		[[0x10000], '\\ud800\\udc00', 'lowest non-BMP character'],
		[[0x10001], '\\ud800\\udc01', 'second-lowest non-BMP character'],
		[[0x103FF], '\\ud800\\udfff', 'highest character with D800 leading surrogate'],
		[[0x10400], '\\ud801\\udc00', 'lowest character with D801 leading surrogate'],
		[
			[[0xFF00, 0xFFFF]],
			'[\\uff00-\\uffff]',
			'single range at top of BMP'
		],
		[
			[[0xFF00, 0x10000]],
			'[\\uff00-\\uffff]|\\ud800\\udc00',
			'single range spanning BMP and non-BMP'
		],
		[
			[0xFFFF, 0x10000, 0x10002],
			'\\uffff|\\ud800\\udc00|\\ud800\\udc02', // TODO: could compact
			'single characters, both BMP and non-BMP'
		],
		[
			[[0x0300, 0x0400], 0x10FFFF],
			'[\\u0300-\\u0400]|\\udbff\\udfff',
			'BMP range and non-BMP character'
		],
		[
			[[0xFF00, 0x103FF]],
			'[\\uff00-\\uffff]|\\ud800[\\udc00-\\udfff]',
			'range to top of D800 leading surrogate range'
		],
		[
			[[0xFF00, 0x10400]],
			'[\\uff00-\\uffff]|\\ud800[\\udc00-\\udfff]|\\ud801\\udc00',
			'range to start of D801 leading surrogate range'
		],
		[
			[[0xFF00, 0x10401]],
			'[\\uff00-\\uffff]|\\ud800[\\udc00-\\udfff]|\\ud801[\\udc00-\\udc01]',
			'range past start of D801 leading surrogate range'
		],
		[
			[[0xFF00, 0x15555]],
			'[\\uff00-\\uffff]|[\\ud800-\\ud814][\\udc00-\\udfff]|\\ud815[\\udc00-\\udd55]',
			'range spanning multiple leading surrogate ranges'
		],
		[
			[[0x10454, 0x10997]],
			'\\ud801[\\udc54-\\udfff]|\\ud802[\\udc00-\\udd97]',
			'range starting within one leading surrogate range, and ending in the next'
		],
		[
			[[0x20222, 0x29999]],
			'\\ud840[\\ude22-\\udfff]|[\\ud841-\\ud865][\\udc00-\\udfff]|\\ud866[\\udc00-\\udd99]',
			'range starting within one leading surrogate range, and ending in a distant one'
		],
		[
			[0x00AD, [0x0600, 0x0604], 0x06DD, 0x070F,
				[0x200E, 0x200F], [0x202A, 0x202E], [0x2060, 0x2064],
				[0x206A, 0x206F], 0xFEFF, [0xFFF9, 0xFFFB],
				0x110BD, [0x1D173, 0x1D17A],
				0xE0001, [0xE0020, 0xE007F]],
			// TODO: could compact
			'[\\u00ad\\u0600-\\u0604\\u06dd\\u070f' +
				'\\u200e-\\u200f\\u202a-\\u202e\\u2060-\\u2064' +
				'\\u206a-\\u206f\\ufeff\\ufff9-\\ufffb]' +
				'|\\ud804\\udcbd|\\ud834[\\udd73-\\udd7a]|\\udb40\\udc01' +
				'|\\udb40[\\udc20-\\udc7f]',
			'multiple BMP and non-BMP ranges (= Format from wordbreak rules)'
		],
		[
			[[0x0, 0xD7FF], [0xE000, 0xFFFF], [0x10000, 0x10FFFF]],
			'[\\u0000-\\ud7ff\\ue000-\\uffff]|[\\ud800-\\udbff][\\udc00-\\udfff]',
			'largest possible range'
		]
	];
	throwTests = [
		[[0xD800], 'surrogate character U+D800'],
		[[0xDFFF], 'surrogate character U+DFFF'],
		[[[0xCCCC, 0xDDDD]], 'surrogate overlap 1'],
		[[[0xDDDD, 0xEEEE]], 'surrogate overlap 2'],
		[[[0xDDDD, 0xEEEEE]], 'surrogate overlap 3'],
		[[[0xCCCC, 0xEEEE]], 'surrogate overlap 4']
	];

	QUnit.expect( equalityTests.length + throwTests.length );
	for ( i = 0; i < equalityTests.length; i++ ) {
		test = equalityTests[i];
		assert.equal(
			unicodeJS.charRangeArrayRegexp( test[0] ),
			test[1],
			test[2]
		);
	}
	for ( i = 0; i < throwTests.length; i++ ) {
		/* jshint loopfunc: true */
		test = throwTests[i];
		doTestFunc = function () {
			unicodeJS.charRangeArrayRegexp( test[0] );
		};
		assert.throws(
			doTestFunc,
			Error,
			'throw: ' + test[1]
		);
	}
});

QUnit.test( 'isBreak', function ( assert ) {
	var i, result, context,
		text =
			/*jshint quotmark:double */
			// 0 - 9
			"\u0300xyz'd a' " +
			// 10 - 19
			"'a a-b 1a\r" +
			// 20 - 29
			"\nカタカナ3,1.2" +
			// 30 - 39
			" a_b_3_ナ_ " +
			// 40 - 49
			"汉字/漢字 c\u0300\u0327k  " +
			// 50 - 59
			"\ud800\udf08" + // U+10308 OLD ITALIC LETTER THE
			"\ud800\udf08\u0302" + // U+10308 OLD ITALIC LETTER THE + combining circumflex
			"\ud800\udf0a" + // U+1030A OLD ITALIC LETTER KA
			" pad " +
			"\ud800\udf0a" + // U+1030A OLD ITALIC LETTER KA
			"\ud800\udf0a" + // U+1030A OLD ITALIC LETTER KA
			// 60 - 69
			" 뜨락또르 트랙터 " + // hangul (not decomposed into jamo)
			//// TODO: test the equivalent text in jamo when graphemebreak rules work
			//// "\u1104\u1173\u1105\u1161\u11a8\u1104\u1169\u1105\u1173 " +
			//// "\u1110\u1173\u1105\u1162\u11a8\u1110\u1165" +
			// 70 - 75: "a." tests end of para
			" c\u0300\u0327 a.",
			/*jshint quotmark:single */
		textString = new unicodeJS.TextString( text ),
		breaks = [
			0, 1, 6, 7, 8, 9, 10,
			11, 12, 13, 14, 15, 16, 17, 19,
			21, 25, 30,
			31, 39, 40,
			41, 42, 43, 44, 45, 46, 48, 49, 50,
			53, 54, 57, 58, 60,
			61, 65, 66, 69, 70,
			71, 72, 73, 74, 75
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
			'Break at position ' + i + ': ' + context
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
