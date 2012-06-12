/**
 * Generic target.
 *
 * @class
 * @constructor
 * @param {String} title Page title of target
 */
ve.init.Target = function( title ) {
	// Properties
	this.title = title;
	this.editToken = mw.user.tokens.get( 'editToken' );
	this.apiUrl = mw.util.wikiScript( 'api' );
	this.modules = ['ext.visualEditor.core'];
	this.isDomLoading = false;
	this.isDomSaving = false;
	this.isMobileDevice = (
		'ontouchstart' in window ||
		( window.DocumentTouch && document instanceof DocumentTouch )
	);
};

/* Methods */

/**
 * Gets DOM from Parsoid API.
 *
 * This method performs an asynchronous action and uses a callback function to handle the result.
 *
 * @example
 *     target.loadDom(
 *         function( error, dom ) {
 *             // Handle errors and do something with the loaded DOM
 *         }
 *     );
 *
 * @method
 * @param {Function} callback Function to call when complete, accepts error and dom arguments
 * @returns {Boolean} Loading is now in progress
*/
ve.init.Target.prototype.load = function( callback ) {
	// Prevent duplicate requests
	if ( this.isDomLoading ) {
		return false;
	}
	// Start loading the module immediately
	mw.loader.load( this.modules );
	// Load DOM
	this.isDomLoading = true;
	$.ajax( {
		'url': this.apiUrl,
		'data': {
			'action': 've-parsoid',
			'paction': 'parse',
			'page': this.title,
			'format': 'json'
		},
		'dataType': 'json',
		'type': 'GET',
		'cache': 'false',
		// Wait up to 9 seconds
		'timeout': 9000,
		'error': callback,
		'success': ve.proxy( function( data ) {
			this.isDomLoading = false;
			var response = data['ve-parsoid'];
			if ( !response ) {
				callback( 'Invalid response from server' );
			} else if ( typeof response.parsed !== 'string' ) {
				callback( 'Invalid HTML content in response from server' );
			} else {
				// Everything worked, the page was loaded, continue as soon as the module is ready
				mw.loader.using( this.modules, function() {
					callback( null, $( '<div></div>' ).html( data['ve-parsoid'].parsed )[0] );
				} );
			}
		}, this )
	} );
	return true;
};

/**
 * Posts DOM to Parsoid API.
 *
 * This method performs an asynchronous action and uses a callback function to handle the result.
 *
 * @example
 *     target.saveDom(
 *         dom,
 *         { 'summary': 'test', 'minor': true, 'watch': false },
 *         function( error, html ) {
 *             // Handle errors and do something with the rendered HTML
 *         }
 *     );
 *
 * @method
 * @param {HTMLElement} dom DOM to save
 * @param {Object} options Saving options
 * @param {String} options.summary Edit summary
 * @param {Boolean} options.minor Edit is a minor edit
 * @param {Boolean} options.watch Watch this page
 * @param {Function} callback Function to call when complete, accepts error and html arguments
 * @returns {Boolean} Saving is now in progress
*/
ve.init.Target.prototype.save = function( dom, options, callback ) {
	// Prevent duplicate requests
	if ( this.isDomSaving ) {
		return false;
	}
	// Save DOM
	this.isDomSaving = true;
	$.ajax( {
		'url': this.apiUrl,
		'data': {
			'format': 'json',
			'action': 've-parsoid',
			'paction': 'save',
			'page': this.title,
			'html': $( dom ).html(),
			'token': this.editToken,
			'summary': options.summary,
			'minor': options.minor,
			'watch': options.watch
		},
		'dataType': 'json',
		'type': 'POST',
		'error': callback,
		'success': ve.proxy( function() {
			this.isDomSaving = false;
			var response = data['ve-parsoid'];
			if ( !response ) {
				callback( 'Invalid response from server' );
			} else if ( response.result !== 'success' ) {
				callback( 'Unsuccessful request: ' + response.result );
			} else if ( typeof response.content !== 'string' ) {
				callback( 'Invalid HTML content in response from server' );
			} else {
				// Everything worked, the page was saved, continue immediately
				callback( null, response.content );
			}
		}, this )
	} );
	return true;
};
