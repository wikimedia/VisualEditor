/*!
 * VisualEditor ES6 utilities.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-env es6 */

/**
 * Run to completion a thenable-yielding iterator
 *
 * Each value yielded by the iterator is wrapped in a promise, the result of which is fed into
 * iterator.next/iterator.throw . For thenable values, this has the effect of pausing execution
 * until the thenable resolves.
 *
 * Both ve.spawn and ve.async bridge between async functions using yield and normal functions
 * using explicit promises. Use ve.spawn( iterator ).then( ... ) to wrap the iterator of an
 * async function that is already running, and funcName = ve.async( function* (...) {...} ) to
 * get a promise-returning function from an async function.
 *
 *     @example
 *     ve.spawn( function* ( url, filename ) {
 *     	var data = yield get( url );
 *     	yield save( filename, data );
 *     	return data.length;
 *     }() ).then( function ( data ) {
 *     	console.log( data );
 *     } ).catch( function ( err ) {
 *     	console.error( err );
 *     } );
 *
 * @param {Object} iterator An iterator that may yield promises
 * @return {Promise} Promise resolving on the iterator's return/throw value
 */
ve.spawn = function ( iterator ) {
	return new Promise( function ( resolve, reject ) {
		var resumeNext, resumeThrow;
		function resume( method, value ) {
			var result;
			try {
				result = method.call( iterator, value );
				if ( result.done ) {
					resolve( result.value );
				} else {
					Promise.resolve( result.value ).then( resumeNext, resumeThrow );
				}
			} catch ( err ) {
				reject( err );
			}
		}
		resumeNext = result => resume( iterator.next, result );
		resumeThrow = err => resume( iterator.throw, err );
		resumeNext();
	} );
};

/**
 * Wrap a thenable-yielding generator function to make an async function
 *
 * Both ve.spawn and ve.async bridge between async functions using yield and normal functions
 * using explicit promises. Use ve.spawn( iterator ).then( ... ) to wrap the iterator of an
 * async function that is already running, and funcName = ve.async( function* (...) {...} ) to
 * get a promise-returning function from an async function.
 *
 *     @example
 *     f = ve.async( function* ( url, filename ) {
 *     	var data = yield get( url );
 *     	yield save( filename, data );
 *     	return data.length;
 *     };
 *     f().then( function ( data ) {
 *     	console.log( data );
 *     } ).catch( function ( err ) {
 *     	console.error( err );
 *     } );
 *
 * @param {Function} generator A generator function
 * @return {Function} Function returning a promise resolving on the generator's return/throw value
 */
ve.async = function ( generator ) {
	return function () {
		return ve.spawn( generator.apply( this, arguments ) );
	};
};
