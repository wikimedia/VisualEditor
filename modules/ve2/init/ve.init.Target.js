/**
 * Generic target.
 *
 * @class
 * @constructor
 * @param {String} pageName Name of target page
 */
ve.init.Target = function( pageName ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.pageName = pageName;
	this.editToken = mw.user.tokens.get( 'editToken' );
	this.apiUrl = mw.util.wikiScript( 'api' );
	this.modules = ['ext.visualEditor.core'];
	this.loading = false;
	this.saving = false;
	this.dom = null;
	this.isMobileDevice = (
		'ontouchstart' in window ||
		( window.DocumentTouch && document instanceof DocumentTouch )
	);
};

/* Static Methods */

/**
 * Handle response to a successful load request.
 *
 * This method is called within the context of a target instance. If successful the DOM from the
 * server will be parsed, stored in {this.dom} and then {ve.init.Target.onReady} will be called once
 * the modules are ready.
 *
 * @static
 * @method
 * @param {Object} response XHR Response object
 * @param {String} status Text status message
 * @emits loadError (null, message, null)
 */
ve.init.Target.onLoad = function( response, status ) {
	var data = response['ve-parsoid'];
	if ( !data ) {
		this.loading = false;
		this.emit( 'loadError', null, 'Invalid response from server', null );
	} else if ( typeof data.parsed !== 'string' ) {
		this.loading = false;
		this.emit( 'loadError', null, 'Invalid HTML content in response from server', null );
	} else {
		this.dom = $( '<div></div>' ).html( data.parsed )[0];
		// Everything worked, the page was loaded, continue as soon as the module is ready
		mw.loader.using( this.modules, ve.proxy( ve.init.Target.onReady, this ) );
	}
};

/**
 * Handle both DOM and modules being loaded and ready.
 *
 * This method is called within the context of a target instance. After the load event is emitted
 * this.dom is cleared, allowing it to be garbage collected.
 *
 * @static
 * @method
 * @emits load (dom)
 */
ve.init.Target.onReady = function() {
	this.loading = false;
	this.emit( 'load', this.dom );
	// Release DOM data
	this.dom = null;
};

/**
 * Handle response to a successful load request.
 *
 * This method is called within the context of a target instance.
 *
 * @static
 * @method
 * @param {Object} response XHR Response object
 * @param {String} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 * @emits loadError (response, text, exception)
 */
ve.init.Target.onLoadError = function( response, text, exception ) {
	this.loading = false;
	this.emit( 'loadError', response, text, exception );
};

/**
 * Handle response to a successful save request.
 *
 * This method is called within the context of a target instance.
 *
 * @static
 * @method
 * @param {Object} response XHR Response object
 * @param {String} status Text status message
 * @emits save (html)
 * @emits saveError (null, message, null)
 */
ve.init.Target.onSave = function( response, status ) {
	this.saving = false;
	var data = response['ve-parsoid'];
	if ( !data ) {
		this.emit( 'saveError', null, 'Invalid response from server', null );
	} else if ( data.result !== 'success' ) {
		this.emit( 'saveError', null, 'Unsuccessful request: ' + data.result, null );
	} else if ( typeof data.content !== 'string' ) {
		this.emit( 'saveError', null, 'Invalid HTML content in response from server', null );
	} else {
		this.emit( 'save', data.content );
	}
};

/**
 * Handle response to a successful save request.
 *
 * This method is called within the context of a target instance.
 *
 * @static
 * @method
 * @param {Object} data HTTP Response object
 * @param {String} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 * @emits saveError (response, status, error)
 */
ve.init.Target.onSaveError = function( response, status, error ) {
	this.saving = false;
	this.emit( 'saveError', response, status, error );
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
	if ( this.loading ) {
		return false;
	}
	// Start loading the module immediately
	mw.loader.load( this.modules );
	// Load DOM
	this.loading = true;
	$.ajax( {
		'url': this.apiUrl,
		'data': {
			'action': 've-parsoid',
			'paction': 'parse',
			'page': this.pageName,
			'format': 'json'
		},
		'dataType': 'json',
		'type': 'GET',
		'cache': 'false',
		// Wait up to 9 seconds
		'timeout': 9000,
		'error': ve.proxy( ve.init.Target.onLoadError, this ),
		'success': ve.proxy( ve.init.Target.onLoad, this )
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
	if ( this.saving ) {
		return false;
	}
	// Save DOM
	this.saving = true;
	$.ajax( {
		'url': this.apiUrl,
		'data': {
			'format': 'json',
			'action': 've-parsoid',
			'paction': 'save',
			'page': this.pageName,
			'html': $( dom ).html(),
			'token': this.editToken,
			'summary': options.summary,
			'minor': options.minor,
			'watch': options.watch
		},
		'dataType': 'json',
		'type': 'POST',
		'error': ve.proxy( ve.init.Target.onSaveError, this ),
		'success': ve.proxy( ve.init.Target.onSave, this )
	} );
	return true;
};

/* Inheritance */

ve.extendClass( ve.init.Target, ve.EventEmitter );
