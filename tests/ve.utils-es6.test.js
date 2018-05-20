/*!
 * VisualEditor Node tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-env es6 */

QUnit.module( 've.utils-es6' );

QUnit.test( 'async', function ( assert ) {
	var wait, f1, f2,
		done = assert.async();

	wait = function () {
		return new Promise( function ( resolve ) {
			setTimeout( resolve );
		} );
	};
	f1 = ve.async( function* getVal( val ) {
		yield wait();
		return val;
	} );
	f2 = ve.async( function* add3( val ) {
		val += yield f1( 1 );
		val += yield f1( 2 );
		val += yield f1( 3 );
		return val;
	} );
	f2( 6 ).then( function ( val ) {
		assert.strictEqual( val, 12, 'Correct calculation' );
	} ).catch( function ( err ) {
		assert.ok( false, err.stack );
	} ).then( function () {
		done();
	} );
} );
