/**
 * VisualEditor Base method tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've' );

/* Tests */

QUnit.test( 'getHash: Basic usage', 5, function ( assert ) {
	var tmp, hash, objects;

	objects = {};

	objects['a-z literal'] = {
		a: 1,
		b: 1,
		c: 1
	};

	objects['z-a literal'] = {
		c: 1,
		b: 1,
		a: 1
	};

	tmp = {};
	objects['a-z augmented'] = tmp;
	tmp.a = 1;
	tmp.b = 1;
	tmp.c = 1;

	tmp = {};
	objects['z-a augmented'] = tmp;
	tmp.c = 1;
	tmp.b = 1;
	tmp.a = 1;

	hash = '{"a":1,"b":1,"c":1}';

	$.each( objects, function ( key, val ) {
		assert.equal(
			ve.getHash( val ),
			hash,
			'Similar enough objects have the same hash, regardless of "property order"'
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

QUnit.test( 'getHash: Complex usage', 4, function ( assert ) {
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
		'Object with nested array and circular reference'
	);

	// Include a circular reference
	obj.f = obj;

	assert.throws( function () {
		ve.getHash( obj );
	}, 'Throw exceptions for objects with cirular refences ' );

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
		'Function with static members'
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

QUnit.test( 'copyArray', 6, function ( assert ) {
	var simpleArray = [ 'foo', 3 ],
		withObj = [ { 'bar': 'baz', 'quux': 3 }, 5 ],
		nestedArray = [ [ 'a', 'b' ], [ 1, 3, 4 ] ],
		sparseArray = [ 'a', undefined, undefined, 'b' ],
		withSparseArray = [ [ 'a', undefined, undefined, 'b' ] ],
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
} );

QUnit.test( 'copyObject', 6, function ( assert ) {
	var simpleObj = { 'foo': 'bar', 'baz': 3 },
		nestedObj = { 'foo': { 'bar': 'baz', 'quux': 3 }, 'whee': 5 },
		withArray = { 'foo': [ 'a', 'b' ], 'bar': [ 1, 3, 4 ] },
		withSparseArray = { 'foo': [ 'a', undefined, undefined, 'b' ] },
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
} );

QUnit.test( 'getDOMAttributes', 1, function ( assert ) {
	assert.deepEqual(
		ve.getDOMAttributes( $( '<div foo="bar" baz quux=3></div>').get( 0 ) ),
		{ 'foo': 'bar', 'baz': '', 'quux': '3' },
		'getDOMAttributes() returns object with correct attributes'
	);
} );

QUnit.test( 'setDOMAttributes', 2, function ( assert ) {
	var element = document.createElement( 'div' );
	ve.setDOMAttributes( element, { 'foo': 'bar', 'baz': '', 'quux': 3 } );
	assert.deepEqual(
		ve.getDOMAttributes( element ),
		{ 'foo': 'bar', 'baz': '', 'quux': '3' },
		'setDOMAttributes() sets attributes correctly'
	);
	ve.setDOMAttributes( element, { 'foo': null, 'bar': 1, 'baz': undefined, 'quux': 5, 'whee': 'yay' } );
	assert.deepEqual(
		ve.getDOMAttributes( element ),
		{ 'bar': '1', 'quux': '5', 'whee': 'yay' },
		'setDOMAttributes() overwrites attributes, removes attributes, and sets new attributes'
	);
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
