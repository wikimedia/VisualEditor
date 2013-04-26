/*!
 * VisualEditor Base method tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've' );

/* Tests */

// ve.createObject: Tested upstream (K-js)

QUnit.test( 'inheritClass', 18, function ( assert ) {
	var foo, bar;

	function Foo() {
		this.constructedFoo = true;
	}

	Foo.a = 'prop of Foo';
	Foo.b = 'prop of Foo';
	Foo.prototype.b = 'proto of Foo';
	Foo.prototype.c = 'proto of Foo';
	Foo.prototype.bFn = function () {
		return 'proto of Foo';
	};
	Foo.prototype.cFn = function () {
		return 'proto of Foo';
	};

	foo = new Foo();

	function Bar() {
		this.constructedBar = true;
	}
	ve.inheritClass( Bar, Foo );

	assert.deepEqual(
		Foo.static,
		{},
		'A "static" property (empty object) is automatically created if absent'
	);

	Foo.static.a = 'static of Foo';
	Foo.static.b = 'static of Foo';

	assert.notStrictEqual( Foo.static, Bar.static, 'Static property is not copied, but inheriting' );
	assert.equal( Bar.static.a, 'static of Foo', 'Foo.static inherits from Bar.static' );

	Bar.static.b = 'static of Bar';

	assert.equal( Foo.static.b, 'static of Foo', 'Change to Bar.static does not affect Foo.static' );

	Bar.a = 'prop of Bar';
	Bar.prototype.b = 'proto of Bar';
	Bar.prototype.bFn = function () {
		return 'proto of Bar';
	};

	assert.throws( function () {
		ve.inheritClass( Bar, Foo );
	}, 'Throw if target already inherits from source (from an earlier call)' );

	assert.throws( function () {
		ve.inheritClass( Bar, Object );
	}, 'Throw if target already inherits from source (naturally, Object)' );

	bar = new Bar();

	assert.strictEqual(
		Bar.b,
		undefined,
		'Constructor properties are not inherited'
	);

	assert.strictEqual(
		foo instanceof Foo,
		true,
		'foo instance of Foo'
	);
	assert.strictEqual(
		foo instanceof Bar,
		false,
		'foo not instance of Bar'
	);

	assert.strictEqual(
		bar instanceof Foo,
		true,
		'bar instance of Foo'
	);
	assert.strictEqual(
		bar instanceof Bar,
		true,
		'bar instance of Bar'
	);

	assert.equal( bar.constructor, Bar, 'constructor property is restored' );
	assert.equal( bar.b, 'proto of Bar', 'own methods go first' );
	assert.equal( bar.bFn(), 'proto of Bar', 'own properties go first' );
	assert.equal( bar.c, 'proto of Foo', 'prototype properties are inherited' );
	assert.equal( bar.cFn(), 'proto of Foo', 'prototype methods are inherited' );

	Bar.prototype.dFn = function () {
		return 'proto of Bar';
	};
	Foo.prototype.dFn = function () {
		return 'proto of Foo';
	};
	Foo.prototype.eFn = function () {
		return 'proto of Foo';
	};

	assert.equal( bar.dFn(), 'proto of Bar', 'inheritance is live (overwriting an inherited method)' );
	assert.equal( bar.eFn(), 'proto of Foo', 'inheritance is live (adding a new method deeper in the chain)' );
});

// ve.mixinClass: Tested upstream (K-js)

// ve.cloneObject: Tested upstream (K-js)

// ve.isPlainObject: Tested upstream (jQuery)

// ve.isEmptyObject: Tested upstream (jQuery)

// ve.isArray: Tested upstream (jQuery)

// ve.bind: Tested upstream (jQuery)

// ve.indexOf: Tested upstream (jQuery)

// ve.extendObject: Tested upstream (jQuery)

QUnit.test( 'getHash: Basic usage', 7, function ( assert ) {
	var tmp,
		cases = {},
		hash = '{"a":1,"b":1,"c":1}',
		customHash = '{"first":1,"last":1}';

	cases['a-z literal'] = {
		object: {
			a: 1,
			b: 1,
			c: 1
		},
		hash: hash
	};

	cases['z-a literal'] = {
		object: {
			c: 1,
			b: 1,
			a: 1
		},
		hash: hash
	};

	tmp = {};
	cases['a-z augmented'] = {
		object: tmp,
		hash: hash
	};
	tmp.a = 1;
	tmp.b = 1;
	tmp.c = 1;

	tmp = {};
	cases['z-a augmented'] = {
		object: tmp,
		hash: hash
	};
	tmp.c = 1;
	tmp.b = 1;
	tmp.a = 1;

	cases['custom hash'] = {
		object: {
			getHashObject: function () {
				return {
					'first': 1,
					'last': 1
				};
			}
		},
		hash: customHash
	};

	cases['custom hash reversed'] = {
		object: {
			getHashObject: function () {
				return {
					'last': 1,
					'first': 1
				};
			}
		},
		hash: customHash
	};

	$.each( cases, function ( key, val ) {
		assert.equal(
			ve.getHash( val.object ),
			val.hash,
			key + ': object has expected hash, regardless of "property order"'
		);
	});

	// .. and that something completely different is in face different
	// (just incase getHash is broken and always returns the same)
	assert.notEqual(
		ve.getHash( { a: 2, b: 2 } ),
		hash,
		'A different object has a different hash'
	);
} );

QUnit.test( 'getHash: Complex usage', 3, function ( assert ) {
	var obj, hash, frame;

	obj = {
		a: 1,
		b: 1,
		c: 1,
		// Nested array
		d: ['x', 'y', 'z'],
		e: {
			a: 2,
			b: 2,
			c: 2
		}
	};

	assert.equal(
		ve.getHash( obj ),
		'{"a":1,"b":1,"c":1,"d":["x","y","z"],"e":{"a":2,"b":2,"c":2}}',
		'Object with nested array and nested object'
	);

	// Include a circular reference
	/*
	 * PhantomJS hangs when calling JSON.stringify with an object containing a
	 * circular reference (https://github.com/ariya/phantomjs/issues/11206).
	 * We know latest Chrome/Firefox and IE8+ support this. So, for the sake of
	 * having qunit/phantomjs work, lets disable this for now.
	obj.f = obj;

	assert.throws( function () {
		ve.getHash( obj );
	}, 'Throw exceptions for objects with cirular refences ' );
	*/

	function Foo() {
		this.a = 1;
		this.c = 3;
		this.b = 2;
	}

	hash = '{"a":1,"b":2,"c":3}';

	assert.equal(
		ve.getHash( new Foo() ),
		hash,
		// This was previously broken when we used .constructor === Object
		// ve.getHash.keySortReplacer, because although instances of Foo
		// do inherit from Object (( new Foo() ) instanceof Object === true),
		// direct comparison would return false.
		'Treat objects constructed by a function as well'
	);

	frame = document.createElement( 'frame' );
	frame.src = 'about:blank';
	$( '#qunit-fixture' ).append( frame );
	obj = new frame.contentWindow.Object();
	obj.c = 3;
	obj.b = 2;
	obj.a = 1;

	assert.equal(
		ve.getHash( obj ),
		hash,
		// This was previously broken when we used comparison with "Object" in
		// ve.getHash.keySortReplacer, because they are an instance of the other
		// window's "Object".
		'Treat objects constructed by a another window as well'
	);
} );

QUnit.test( 'getObjectValues', 6, function ( assert ) {
	var tmp;

	assert.deepEqual(
		ve.getObjectValues( { a: 1, b: 2, c: 3, foo: 'bar' } ),
		[ 1, 2, 3, 'bar' ],
		'Simple object with numbers and strings as values'
	);
	assert.deepEqual(
		ve.getObjectValues( [ 1, 2, 3, 'bar' ] ),
		[ 1, 2, 3, 'bar' ],
		'Simple array with numbers and strings as values'
	);

	tmp = function () {
		this.isTest = true;

		return this;
	};
	tmp.a = 'foo';
	tmp.b = 'bar';

	assert.deepEqual(
		ve.getObjectValues( tmp ),
		['foo', 'bar'],
		'Function with properties'
	);

	assert.throws(
		function () {
			ve.getObjectValues( 'hello' );
		},
		TypeError,
		'Throw exception for non-object (string)'
	);

	assert.throws(
		function () {
			ve.getObjectValues( 123 );
		},
		TypeError,
		'Throw exception for non-object (number)'
	);

	assert.throws(
		function () {
			ve.getObjectValues( null );
		},
		TypeError,
		'Throw exception for non-object (null)'
	);
} );

QUnit.test( 'copyArray', 7, function ( assert ) {
	var simpleArray = [ 'foo', 3, true, false ],
		withObj = [ { 'bar': 'baz', 'quux': 3 }, 5, null ],
		nestedArray = [ [ 'a', 'b' ], [ 1, 3, 4 ] ],
		sparseArray = [ 'a', undefined, undefined, 'b' ],
		withSparseArray = [ [ 'a', undefined, undefined, 'b' ] ],
		withFunction = [ function () { return true; } ],
		Cloneable = function ( p ) {
			this.p = p;
		};

	Cloneable.prototype.clone = function () {
		return new Cloneable( this.p + '-clone' );
	};

	assert.deepEqual(
		ve.copyArray( simpleArray ),
		simpleArray,
		'Simple array'
	);
	assert.deepEqual(
		ve.copyArray( withObj ),
		withObj,
		'Array containing object'
	);
	assert.deepEqual(
		ve.copyArray( [ new Cloneable( 'bar' ) ] ),
		[ new Cloneable( 'bar-clone' ) ],
		'Use the .clone() method if available'
	);
	assert.deepEqual(
		ve.copyArray( nestedArray ),
		nestedArray,
		'Nested array'
	);
	assert.deepEqual(
		ve.copyArray( sparseArray ),
		sparseArray,
		'Sparse array'
	);
	assert.deepEqual(
		ve.copyArray( withSparseArray ),
		withSparseArray,
		'Nested sparse array'
	);
	assert.deepEqual(
		ve.copyArray( withFunction ),
		withFunction,
		'Array containing function'
	);
} );

QUnit.test( 'copyObject', 7, function ( assert ) {
	var simpleObj = { 'foo': 'bar', 'baz': 3, 'quux': null, 'truth': true, 'falsehood': false },
		nestedObj = { 'foo': { 'bar': 'baz', 'quux': 3 }, 'whee': 5 },
		withArray = { 'foo': [ 'a', 'b' ], 'bar': [ 1, 3, 4 ] },
		withSparseArray = { 'foo': [ 'a', undefined, undefined, 'b' ] },
		withFunction = { 'func': function () { return true; } },
		Cloneable = function ( p ) {
			this.p = p;
		};
	Cloneable.prototype.clone = function () { return new Cloneable( this.p + '-clone' ); };

	assert.deepEqual(
		ve.copyObject( simpleObj ),
		simpleObj,
		'Simple object'
	);
	assert.deepEqual(
		ve.copyObject( nestedObj ),
		nestedObj,
		'Nested object'
	);
	assert.deepEqual(
		ve.copyObject( new Cloneable( 'foo' ) ),
		new Cloneable( 'foo-clone' ),
		'Cloneable object'
	);
	assert.deepEqual(
		ve.copyObject( { 'foo': new Cloneable( 'bar' ) } ),
		{ 'foo': new Cloneable( 'bar-clone' ) },
		'Object containing object'
	);
	assert.deepEqual(
		ve.copyObject( withArray ),
		withArray,
		'Object with array'
	);
	assert.deepEqual(
		ve.copyObject( withSparseArray ),
		withSparseArray,
		'Object with sparse array'
	);
	assert.deepEqual(
		ve.copyObject( withFunction ),
		withFunction,
		'Object with function'
	);
} );

QUnit.test( 'getDomAttributes', 1, function ( assert ) {
	assert.deepEqual(
		ve.getDomAttributes( $( '<div foo="bar" baz quux=3></div>').get( 0 ) ),
		{ 'foo': 'bar', 'baz': '', 'quux': '3' },
		'getDomAttributes() returns object with correct attributes'
	);
} );

QUnit.test( 'setDomAttributes', 3, function ( assert ) {
	var element = document.createElement( 'div' );
	ve.setDomAttributes( element, { 'foo': 'bar', 'baz': '', 'quux': 3 } );
	assert.deepEqual(
		ve.getDomAttributes( element ),
		{ 'foo': 'bar', 'baz': '', 'quux': '3' },
		'setDomAttributes() sets attributes correctly'
	);
	ve.setDomAttributes( element, { 'foo': null, 'bar': 1, 'baz': undefined, 'quux': 5, 'whee': 'yay' } );
	assert.deepEqual(
		ve.getDomAttributes( element ),
		{ 'bar': '1', 'quux': '5', 'whee': 'yay' },
		'setDomAttributes() overwrites attributes, removes attributes, and sets new attributes'
	);
	ve.setDomAttributes( element, { 'onclick': 'alert(1);' }, ['foo', 'bar', 'baz', 'quux', 'whee'] );
	assert.ok( !element.hasAttribute( 'onclick' ), 'event attributes are blocked when sanitizing' );
} );

QUnit.test( 'getOpeningHtmlTag', 5, function ( assert ) {
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'code', {} ),
		'<code>',
		'opening tag without attributes'
	);
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'img', { 'src': 'foo' } ),
		'<img src="foo">',
		'opening tag with one attribute'
	);
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'a', { 'href': 'foo', 'rel': 'bar' } ),
		'<a href="foo" rel="bar">',
		'tag with two attributes'
	);
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'option', { 'selected': true, 'blah': false, 'value': 3 } ),
		'<option selected="selected" value="3">',
		'handling of booleans and numbers'
	);
	assert.deepEqual(
		ve.getOpeningHtmlTag( 'input', { 'placeholder': '<foo>&"bar"&\'baz\'' } ),
		'<input placeholder="&lt;foo&gt;&amp;&quot;bar&quot;&amp;&#039;baz&#039;">',
		'escaping of attribute values'
	);
} );

( function () {
	var plainObj, funcObj, arrObj;
	plainObj = {
		'foo': 3,
		'bar': {
			'baz': null,
			'quux': {
				'whee': 'yay'
			}
		}
	};
	funcObj = function abc( d ) { return d; };
	funcObj.foo = 3;
	funcObj.bar = {
		'baz': null,
		'quux': {
			'whee': 'yay'
		}
	};
	arrObj = ['a', 'b', 'c'];
	arrObj.foo = 3;
	arrObj.bar = {
		'baz': null,
		'quux': {
			'whee': 'yay'
		}
	};

	$.each( {
		'Object': plainObj,
		'Function': funcObj,
		'Array': arrObj
	}, function ( type, obj ) {

		QUnit.test( 'getProp( ' + type + ' )', 9, function ( assert ) {
			assert.deepEqual(
				ve.getProp( obj, 'foo' ),
				3,
				'single key'
			);
			assert.deepEqual(
				ve.getProp( obj, 'bar' ),
				{ 'baz': null, 'quux': { 'whee': 'yay' } },
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

		QUnit.test( 'setProp( ' + type + ' )' , 7, function ( assert ) {
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

QUnit.test( 'createDocumentFromHTML', function ( assert ) {
	var key, doc, expectedHead, expectedBody,
		cases = [
			{
				'msg': 'simple document with doctype, head and body',
				'html': '<!doctype html><html><head><title>Foo</title></head><body><p>Bar</p></body></html>',
				'head': '<title>Foo</title>',
				'body': '<p>Bar</p>'
			},
			{
				'msg': 'simple document without doctype',
				'html': '<html><head><title>Foo</title></head><body><p>Bar</p></body></html>',
				'head': '<title>Foo</title>',
				'body': '<p>Bar</p>'
			},
			{
				'msg': 'document with missing closing tags and missing <html> tag',
				'html': '<!doctype html><head><title>Foo</title><base href="yay"><body><p>Bar<b>Baz',
				'head': '<title>Foo</title><base href="yay" />',
				'body': '<p>Bar<b>Baz</b></p>'
			},
			{
				'msg': 'empty string results in empty document',
				'html': '',
				'head': '',
				'body': ''
			}
		];
	QUnit.expect( cases.length*2 );
	for ( key in cases ) {
		doc = ve.createDocumentFromHTML( cases[key].html );
		expectedHead = $( '<head>' ).html( cases[key].head ).get( 0 );
		expectedBody = $( '<body>' ).html( cases[key].body ).get( 0 );
		assert.equalDomElement( $( 'head', doc ).get( 0 ), expectedHead, cases[key].msg + ' (head)' );
		assert.equalDomElement( $( 'body', doc ).get( 0 ), expectedBody, cases[key].msg + ' (body)' );
	}
} );
