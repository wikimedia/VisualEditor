/*!
 * VisualEditor Base method tests.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've' );

/* Tests */

// ve.cloneObject: Tested upstream (OOJS)

// ve.getObjectValues: Tested upstream (OOJS)

// ve.getObjectKeys: Tested upstream (JavaScript)

// ve.compare: Tested upstream (OOJS)

// ve.copy: Tested upstream (OOJS)

// ve.isPlainObject: Tested upstream (jQuery)

// ve.isEmptyObject: Tested upstream (jQuery)

// ve.bind: Tested upstream (jQuery)

// ve.indexOf: Tested upstream (jQuery)

// ve.extendObject: Tested upstream (jQuery)

QUnit.test( 'getDomAttributes', 1, function ( assert ) {
	assert.deepEqual(
		ve.getDomAttributes( $( '<div foo="bar" baz quux=3></div>' ).get( 0 ) ),
		{ foo: 'bar', baz: '', quux: '3' },
		'getDomAttributes() returns object with correct attributes'
	);
} );

QUnit.test( 'setDomAttributes', 3, function ( assert ) {
	var element = document.createElement( 'div' );
	ve.setDomAttributes( element, { foo: 'bar', baz: '', quux: 3 } );
	assert.deepEqual(
		ve.getDomAttributes( element ),
		{ foo: 'bar', baz: '', quux: '3' },
		'setDomAttributes() sets attributes correctly'
	);
	ve.setDomAttributes( element, { foo: null, bar: 1, baz: undefined, quux: 5, whee: 'yay' } );
	assert.deepEqual(
		ve.getDomAttributes( element ),
		{ bar: '1', quux: '5', whee: 'yay' },
		'setDomAttributes() overwrites attributes, removes attributes, and sets new attributes'
	);
	ve.setDomAttributes( element, { onclick: 'alert(1);' }, ['foo', 'bar', 'baz', 'quux', 'whee'] );
	assert.ok( !element.hasAttribute( 'onclick' ), 'event attributes are blocked when sanitizing' );
} );

QUnit.test( 'getHtmlAttributes', 7, function ( assert ) {
	assert.deepEqual(
		ve.getHtmlAttributes(),
		'',
		'no attributes argument'
	);
	assert.deepEqual(
		ve.getHtmlAttributes( NaN + 'px' ),
		'',
		'invalid attributes argument'
	);
	assert.deepEqual(
		ve.getHtmlAttributes( {} ),
		'',
		'empty attributes argument'
	);
	assert.deepEqual(
		ve.getHtmlAttributes( { src: 'foo' } ),
		'src="foo"',
		'one attribute'
	);
	assert.deepEqual(
		ve.getHtmlAttributes( { href: 'foo', rel: 'bar' } ),
		'href="foo" rel="bar"',
		'two attributes'
	);
	assert.deepEqual(
		ve.getHtmlAttributes( { selected: true, blah: false, value: 3 } ),
		'selected="selected" value="3"',
		'handling of booleans and numbers'
	);
	assert.deepEqual(
		ve.getHtmlAttributes( { placeholder: '<foo>&"bar"&\'baz\'' } ),
		'placeholder="&lt;foo&gt;&amp;&quot;bar&quot;&amp;&#039;baz&#039;"',
		'escaping of attribute values'
	);
} );

QUnit.test( 'getOpeningHtmlTag', 3, function ( assert ) {
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'code', {} ),
		'<code>',
		'opening tag without attributes'
	);
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'img', { src: 'foo' } ),
		'<img src="foo">',
		'opening tag with one attribute'
	);
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'a', { href: 'foo', rel: 'bar' } ),
		'<a href="foo" rel="bar">',
		'tag with two attributes'
	);
} );

( function () {
	var plainObj, funcObj, arrObj;
	plainObj = {
		foo: 3,
		bar: {
			baz: null,
			quux: {
				whee: 'yay'
			}
		}
	};
	funcObj = function abc( d ) { return d; };
	funcObj.foo = 3;
	funcObj.bar = {
		baz: null,
		quux: {
			whee: 'yay'
		}
	};
	arrObj = ['a', 'b', 'c'];
	arrObj.foo = 3;
	arrObj.bar = {
		baz: null,
		quux: {
			whee: 'yay'
		}
	};

	$.each( {
		Object: plainObj,
		Function: funcObj,
		Array: arrObj
	}, function ( type, obj ) {

		QUnit.test( 'getProp( ' + type + ' )', 9, function ( assert ) {
			assert.deepEqual(
				ve.getProp( obj, 'foo' ),
				3,
				'single key'
			);
			assert.deepEqual(
				ve.getProp( obj, 'bar' ),
				{ baz: null, quux: { whee: 'yay' } },
				'single key, returns object'
			);
			assert.deepEqual(
				ve.getProp( obj, 'bar', 'baz' ),
				null,
				'two keys, returns null'
			);
			assert.deepEqual(
				ve.getProp( obj, 'bar', 'quux', 'whee' ),
				'yay',
				'three keys'
			);
			assert.deepEqual(
				ve.getProp( obj, 'x' ),
				undefined,
				'missing property returns undefined'
			);
			assert.deepEqual(
				ve.getProp( obj, 'foo', 'bar' ),
				undefined,
				'missing 2nd-level property returns undefined'
			);
			assert.deepEqual(
				ve.getProp( obj, 'foo', 'bar', 'baz', 'quux', 'whee' ),
				undefined,
				'multiple missing properties don\'t cause an error'
			);
			assert.deepEqual(
				ve.getProp( obj, 'bar', 'baz', 'quux' ),
				undefined,
				'accessing property of null returns undefined, doesn\'t cause an error'
			);
			assert.deepEqual(
				ve.getProp( obj, 'bar', 'baz', 'quux', 'whee', 'yay' ),
				undefined,
				'accessing multiple properties of null'
			);
		} );

		QUnit.test( 'setProp( ' + type + ' )', 7, function ( assert ) {
			ve.setProp( obj, 'foo', 4 );
			assert.deepEqual( 4, obj.foo, 'setting an existing key with depth 1' );

			ve.setProp( obj, 'test', 'TEST' );
			assert.deepEqual( 'TEST', obj.test, 'setting a new key with depth 1' );

			ve.setProp( obj, 'bar', 'quux', 'whee', 'YAY' );
			assert.deepEqual( 'YAY', obj.bar.quux.whee, 'setting an existing key with depth 3' );

			ve.setProp( obj, 'bar', 'a', 'b', 'c' );
			assert.deepEqual( 'c', obj.bar.a.b, 'setting two new keys within an existing key' );

			ve.setProp( obj, 'a', 'b', 'c', 'd', 'e', 'f' );
			assert.deepEqual( 'f', obj.a.b.c.d.e, 'setting new keys with depth 5' );

			ve.setProp( obj, 'bar', 'baz', 'whee', 'wheee', 'wheeee' );
			assert.deepEqual( null, obj.bar.baz, 'descending into null fails silently' );

			ve.setProp( obj, 'foo', 'bar', 'baz', 5 );
			assert.deepEqual( undefined, obj.foo.bar, 'descending into a non-object fails silently' );
		} );
	} );

}() );

QUnit.test( 'batchSplice', 8, function ( assert ) {
	var actual = [ 'a', 'b', 'c', 'd', 'e' ], expected = actual.slice( 0 ), bigArr = [],
		actualRet, expectedRet, i;

	actualRet = ve.batchSplice( actual, 1, 1, [] );
	expectedRet = expected.splice( 1, 1 );
	assert.deepEqual( expectedRet, actualRet, 'removing 1 element (return value)' );
	assert.deepEqual( expected, actual, 'removing 1 element (array)' );

	actualRet = ve.batchSplice( actual, 3, 2, [ 'w', 'x', 'y', 'z' ] );
	expectedRet = expected.splice( 3, 2, 'w', 'x', 'y', 'z' );
	assert.deepEqual( expectedRet, actualRet, 'replacing 2 elements with 4 elements (return value)' );
	assert.deepEqual( expected, actual, 'replacing 2 elements with 4 elements (array)' );

	actualRet = ve.batchSplice( actual, 0, 0, [ 'f', 'o', 'o' ] );
	expectedRet = expected.splice( 0, 0, 'f', 'o', 'o' );
	assert.deepEqual( expectedRet, actualRet, 'inserting 3 elements (return value)' );
	assert.deepEqual( expected, actual, 'inserting 3 elements (array)' );

	for ( i = 0; i < 2100; i++ ) {
		bigArr[i] = i;
	}
	actualRet = ve.batchSplice( actual, 2, 3, bigArr );
	expectedRet = expected.splice.apply( expected, [2, 3].concat( bigArr.slice( 0, 1050 ) ) );
	expected.splice.apply( expected, [1052, 0].concat( bigArr.slice( 1050 ) ) );
	assert.deepEqual( expectedRet, actualRet, 'replacing 3 elements with 2100 elements (return value)' );
	assert.deepEqual( expected, actual, 'replacing 3 elements with 2100 elements (array)' );
} );

QUnit.test( 'createDocumentFromHtml', function ( assert ) {
	var key, doc, expectedHead, expectedBody,
		cases = [
			{
				msg: 'simple document with doctype, head and body',
				html: '<!doctype html><html><head><title>Foo</title></head><body><p>Bar</p></body></html>',
				head: '<title>Foo</title>',
				body: '<p>Bar</p>'
			},
			{
				msg: 'simple document without doctype',
				html: '<html><head><title>Foo</title></head><body><p>Bar</p></body></html>',
				head: '<title>Foo</title>',
				body: '<p>Bar</p>'
			},
			{
				msg: 'document with missing closing tags and missing <html> tag',
				html: '<!doctype html><head><title>Foo</title><base href="yay"><body><p>Bar<b>Baz',
				head: '<title>Foo</title><base href="yay" />',
				body: '<p>Bar<b>Baz</b></p>'
			},
			{
				msg: 'empty string results in empty document',
				html: '',
				head: '',
				body: ''
			}
		];
	QUnit.expect( cases.length * 2 );
	for ( key in cases ) {
		doc = ve.createDocumentFromHtml( cases[key].html );
		expectedHead = $( '<head>' ).html( cases[key].head ).get( 0 );
		expectedBody = $( '<body>' ).html( cases[key].body ).get( 0 );
		assert.equalDomElement( $( 'head', doc ).get( 0 ), expectedHead, cases[key].msg + ' (head)' );
		assert.equalDomElement( $( 'body', doc ).get( 0 ), expectedBody, cases[key].msg + ' (body)' );
	}
} );

QUnit.test( 'isBlockElement/isVoidElement', 10, function ( assert ) {
	assert.strictEqual( ve.isBlockElement( 'div' ), true, '"div" is a block element' );
	assert.strictEqual( ve.isBlockElement( 'SPAN' ), false, '"SPAN" is not a block element' );
	assert.strictEqual( ve.isBlockElement( 'a' ), false, '"a" is not a block element' );
	assert.strictEqual( ve.isBlockElement( document.createElement( 'div' ) ), true, '<div> is a block element' );
	assert.strictEqual( ve.isBlockElement( document.createElement( 'span' ) ), false, '<span> is not a block element' );

	assert.strictEqual( ve.isVoidElement( 'img' ), true, '"img" is a void element' );
	assert.strictEqual( ve.isVoidElement( 'DIV' ), false, '"DIV" is not a void element' );
	assert.strictEqual( ve.isVoidElement( 'span' ), false, '"span" is not a void element' );
	assert.strictEqual( ve.isVoidElement( document.createElement( 'img' ) ), true, '<img> is a void element' );
	assert.strictEqual( ve.isVoidElement( document.createElement( 'div' ) ), false, '<div> is not a void element' );
} );

// TODO: ve.isUnattachedCombiningMark

// TODO: ve.getByteOffset

// TODO: ve.getClusterOffset

QUnit.test( 'graphemeSafeSubstring', function ( assert ) {
	var i,
		text = '12\ud860\udee245\ud860\udee2789\ud860\udee2bc',
		cases = [
			{
				msg: 'start and end inside multibyte',
				start: 3,
				end: 12,
				expected: [ '\ud860\udee245\ud860\udee2789\ud860\udee2', '45\ud860\udee2789' ]
			},
			{
				msg: 'start and end next to multibyte',
				start: 4,
				end: 11,
				expected: [ '45\ud860\udee2789', '45\ud860\udee2789' ]
			},
			{
				msg: 'complete string',
				start: 0,
				end: text.length,
				expected: [ text, text ]
			},
			{
				msg: 'collapsed selection inside multibyte',
				start: 3,
				end: 3,
				expected: [ '\ud860\udee2', '' ]
			}
		];
	QUnit.expect( cases.length * 2 );
	for ( i = 0; i < cases.length; i++ ) {
		assert.strictEqual(
			ve.graphemeSafeSubstring( text, cases[i].start, cases[i].end, true ),
			cases[i].expected[0],
			cases[i].msg + ' (outer)'
		);
		assert.strictEqual(
			ve.graphemeSafeSubstring( text, cases[i].start, cases[i].end, false ),
			cases[i].expected[1],
			cases[i].msg + ' (inner)'
		);
	}
} );

QUnit.test( 'transformStyleAttributes', function ( assert ) {
	var i, wasStyleAttributeBroken, oldNormalizeAttributeValue,
		normalizeColor = function ( name, value ) {
			if ( name === 'style' && value === 'color:#ffd' ) {
				return 'color: rgb(255, 255, 221);';
			}
			return value;
		},
		normalizeBgcolor = function ( name, value ) {
			if ( name === 'bgcolor' ) {
				return value && value.toLowerCase();
			}
			return value;
		},
		cases = [
			{
				msg: 'Empty tags are not changed self-closing tags',
				before: '<html><head></head><body>Hello <a href="foo"></a> world</body></html>'
			},
			{
				msg: 'HTML string with doctype is parsed correctly',
				before: '<!DOCTYPE html><html><head><title>Foo</title></head><body>Hello</body></html>'
			},
			{
				msg: 'Style attributes are masked then unmasked',
				before: '<body><div style="color:#ffd">Hello</div></body>',
				masked: '<body><div style="color:#ffd" data-ve-style="color:#ffd">Hello</div></body>'
			},
			{
				msg: 'Style attributes that differ but normalize the same are overwritten when unmasked',
				masked: '<body><div style="color: rgb(255, 255, 221);" data-ve-style="color:#ffd">Hello</div></body>',
				after: '<body><div style="color:#ffd">Hello</div></body>',
				normalize: normalizeColor
			},
			{
				msg: 'Style attributes that do not normalize the same are not overwritten when unmasked',
				masked: '<body><div style="color: rgb(0, 0, 0);" data-ve-style="color:#ffd">Hello</div></body>',
				after: '<body><div style="color: rgb(0, 0, 0);">Hello</div></body>',
				normalize: normalizeColor
			},
			{
				msg: 'bgcolor attributes are masked then unmasked',
				before: '<body><table><tr bgcolor="#FFDEAD"></tr></table></body>',
				masked: '<body><table><tr bgcolor="#FFDEAD" data-ve-bgcolor="#FFDEAD"></tr></table></body>'
			},
			{
				msg: 'bgcolor attributes that differ but normalize the same are overwritten when unmasked',
				masked: '<body><table><tr bgcolor="#ffdead" data-ve-bgcolor="#FFDEAD"></tr></table></body>',
				after: '<body><table><tr bgcolor="#FFDEAD"></tr></table></body>',
				normalize: normalizeBgcolor
			},
			{
				msg: 'bgcolor attributes that do not normalize the same are not overwritten when unmasked',
				masked: '<body><table><tr bgcolor="#fffffa" data-ve-bgcolor="#FFDEAD"></tr></table></body>',
				after: '<body><table><tr bgcolor="#fffffa"></tr></table></body>',
				normalize: normalizeBgcolor
			}
		];
	QUnit.expect( 2 * cases.length );

	// Force transformStyleAttributes to think that we're in a broken browser
	wasStyleAttributeBroken = ve.isStyleAttributeBroken;
	ve.isStyleAttributeBroken = true;

	for ( i = 0; i < cases.length; i++ ) {
		if ( cases[i].normalize ) {
			oldNormalizeAttributeValue = ve.normalizeAttributeValue;
			ve.normalizeAttributeValue = cases[i].normalize;
		}
		if ( cases[i].before ) {
			assert.strictEqual(
				ve.transformStyleAttributes( cases[i].before, false ),
				cases[i].masked || cases[i].before,
				cases[i].msg + ' (masking)'
			);
		} else {
			assert.ok( true, cases[i].msg + ' (no masking test)' );
		}
		assert.strictEqual(
			ve.transformStyleAttributes( cases[i].masked || cases[i].before, true ),
			cases[i].after || cases[i].before,
			cases[i].msg + ' (unmasking)'
		);

		if ( cases[i].normalize ) {
			ve.normalizeAttributeValue = oldNormalizeAttributeValue;
		}
	}
} );

QUnit.test( 'normalizeNode', function ( assert ) {
	var i, actual, expected, wasNormalizeBroken,
		cases = [
			{
				msg: 'Merge two adjacent text nodes',
				before: {
					type: 'p',
					children: [
						{ type: '#text', text: 'Foo' },
						{ type: '#text', text: 'Bar' }
					]
				},
				after: {
					type: 'p',
					children: [
						{ type: '#text', text: 'FooBar' }
					]
				}
			},
			{
				msg: 'Merge three adjacent text nodes',
				before: {
					type: 'p',
					children: [
						{ type: '#text', text: 'Foo' },
						{ type: '#text', text: 'Bar' },
						{ type: '#text', text: 'Baz' }
					]
				},
				after: {
					type: 'p',
					children: [
						{ type: '#text', text: 'FooBarBaz' }
					]
				}
			},
			{
				msg: 'Drop empty text node after single text node',
				before: {
					type: 'p',
					children: [
						{ type: '#text', text: 'Foo' },
						{ type: '#text', text: '' }
					]
				},
				after: {
					type: 'p',
					children: [
						{ type: '#text', text: 'Foo' }
					]
				}
			},
			{
				msg: 'Drop empty text node after two text nodes',
				before: {
					type: 'p',
					children: [
						{ type: '#text', text: 'Foo' },
						{ type: '#text', text: 'Bar' },
						{ type: '#text', text: '' }
					]
				},
				after: {
					type: 'p',
					children: [
						{ type: '#text', text: 'FooBar' }
					]
				}
			},
			{
				msg: 'Normalize recursively',
				before: {
					type: 'div',
					children: [
						{ type: '#text', text: '' },
						{
							type: 'p',
							children: [
								{ type: '#text', text: 'Foo' },
								{ type: '#text', text: 'Bar' }
							]
						},
						{
							type: 'p',
							children: [
								{ type: '#text', text: 'Baz' },
								{ type: '#text', text: 'Quux' }
							]
						},
						{ type: '#text', text: 'Whee' }
					]
				},
				after: {
					type: 'div',
					children: [
						{
							type: 'p',
							children: [
								{ type: '#text', text: 'FooBar' }
							]
						},
						{
							type: 'p',
							children: [
								{ type: '#text', text: 'BazQuux' }
							]
						},
						{ type: '#text', text: 'Whee' }
					]
				}
			}
		];
	QUnit.expect( 2 * cases.length );

	// Force normalizeNode to think native normalization is broken so it uses the manual
	// normalization code
	wasNormalizeBroken = ve.isNormalizeBroken;
	ve.isNormalizeBroken = true;

	for ( i = 0; i < cases.length; i++ ) {
		actual = ve.test.utils.buildDom( cases[i].before );
		expected = ve.test.utils.buildDom( cases[i].after );
		ve.normalizeNode( actual );
		assert.equalDomElement( actual, expected, cases[i].msg );
		assert.ok( actual.isEqualNode( expected ), cases[i].msg + ' (isEqualNode)' );
	}

	ve.isNormalizeBroken = wasNormalizeBroken;
} );
