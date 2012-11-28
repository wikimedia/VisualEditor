/*global mw */

/**
 * VisualEditor MediaWiki initialization Target class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki target.
 *
 * @class
 * @constructor
 * @extends {ve.EventEmitter}
 * @param {String} pageName Name of target page
 */
ve.init.mw.Target = function VeInitMwTarget( pageName, oldId ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.pageName = pageName;
	this.oldId = oldId;
	this.editToken = mw.user.tokens.get( 'editToken' );
	this.apiUrl = mw.util.wikiScript( 'api' );
	this.submitUrl = ( new mw.Uri( mw.util.wikiGetlink( this.pageName ) ) )
		.extend( { 'action': 'submit' } );
	this.modules = ['ext.visualEditor.core', 'ext.visualEditor.specialMessages']
		.concat(
			window.devicePixelRatio > 1 ?
				['ext.visualEditor.viewPageTarget.icons-vector', 'ext.visualEditor.icons-vector'] :
				['ext.visualEditor.viewPageTarget.icons-raster', 'ext.visualEditor.icons-raster']
		);
	this.loading = false;
	this.saving = false;
	this.serializing = false;
	this.submitting = false;
	this.baseTimeStamp = null;
	this.startTimeStamp = null;
	this.dom = null;
	this.isMobileDevice = (
		'ontouchstart' in window ||
			( window.DocumentTouch && document instanceof window.DocumentTouch )
	);
};

/* Inheritance */

ve.inheritClass( ve.init.mw.Target, ve.EventEmitter );

/* Static Methods */

/**
 * Handle response to a successful load request.
 *
 * This method is called within the context of a target instance. If successful the DOM from the
 * server will be parsed, stored in {this.dom} and then {ve.init.mw.Target.onReady} will be called once
 * the modules are ready.
 *
 * @static
 * @method
 * @param {Object} response XHR Response object
 * @param {String} status Text status message
 * @emits loadError (null, message, null)
 */
ve.init.mw.Target.onLoad = function ( response ) {
	var data = response['ve-parsoid'];
	if ( !data && !response.error ) {
		ve.init.mw.Target.onLoadError.call(
			this, null, 'Invalid response in response from server', null
		);
	} else if ( response.error || data.result === 'error' ) {
		ve.init.mw.Target.onLoadError.call( this, null, 'Server error', null );
	} else if ( typeof data.content !== 'string' ) {
		ve.init.mw.Target.onLoadError.call(
			this, null, 'No HTML content in response from server', null
		);
	} else {
		this.dom = $( '<div>' ).html( data.content )[0];
		this.baseTimeStamp = data.basetimestamp;
		this.startTimeStamp = data.starttimestamp;
		// Everything worked, the page was loaded, continue as soon as the module is ready
		mw.loader.using( this.modules, ve.bind( ve.init.mw.Target.onReady, this ) );
	}
};

/**
 * Respond to both DOM and modules being loaded and ready.
 *
 * This method is called within the context of a target instance. After the load event is emitted
 * this.dom is cleared, allowing it to be garbage collected.
 *
 * @static
 * @method
 * @emits load (dom)
 */
ve.init.mw.Target.onReady = function () {
	this.loading = false;
	this.emit( 'load', this.dom );
	// Release DOM data
	this.dom = null;
};

/**
 * Respond to an unsuccessful load request.
 *
 * This method is called within the context of a target instance.
 *
 * @static
 * @method
 * @param {Object} response XHR Response object
 * @param {String} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 * @emits loadError (response, status, error)
 */
ve.init.mw.Target.onLoadError = function ( response, status, error ) {
	this.loading = false;
	this.emit( 'loadError', response, status, error );
};

/**
 * Respond to a successful save request.
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
ve.init.mw.Target.onSave = function ( response ) {
	this.saving = false;
	var data = response['ve-parsoid'];
	if ( !data && !response.error ) {
		ve.init.mw.Target.onSaveError.call( this, null, 'Invalid response from server', null );
	} else if ( response.error ) {
		if (response.error.code === 'editconflict' ) {
			this.emit( 'editConflict' );
		} else {
			ve.init.mw.Target.onSaveError.call(
				this, null, 'Unsuccessful request: ' + response.error.info, null
			);
		}
	} else if ( data.result !== 'success' ) {
		ve.init.mw.Target.onSaveError.call( this, null, 'Failed request: ' + data.result, null );
	} else if ( typeof data.content !== 'string' ) {
		ve.init.mw.Target.onSaveError.call(
			this, null, 'Invalid HTML content in response from server', null
		);
	} else {
		this.emit( 'save', data.content );
	}
};

/**
 * Respond to an unsuccessful save request.
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
ve.init.mw.Target.onSaveError = function ( response, status, error ) {
	this.saving = false;
	this.emit( 'saveError', response, status, error );
};

/**
 * Respond to a successful serialize request.
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
ve.init.mw.Target.onSerialize = function ( response ) {
	this.serializing = false;
	var data = response['ve-parsoid'];
	if ( !data && !response.error ) {
		ve.init.mw.Target.onSerializeError.call( this, null, 'Invalid response from server', null );
	} else if ( response.error || data.result === 'error' ) {
		ve.init.mw.Target.onSerializeError.call( this, null, 'Server error', null );
	} else if ( typeof data.content !== 'string' ) {
		ve.init.mw.Target.onSerializeError.call(
			this, null, 'No Wikitext content in response from server', null
		);
	} else {
		if ( typeof this.serializeCallback === 'function' ) {
			this.serializeCallback( data.content );
			delete this.serializeCallback;
		}
	}
};

/**
 * Respond to an unsuccessful serialize request.
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
ve.init.mw.Target.onSerializeError = function ( response, status, error ) {
	this.serializing = false;
	this.emit( 'serializeError', response, status, error );
};

/* Methods */

/**
 * Gets DOM from Parsoid API.
 *
 * This method performs an asynchronous action and uses a callback function to handle the result.
 *
 * A side-effect of calling this method is that it requests {this.modules} be loaded.
 *
 * @method
 * @returns {Boolean} Loading has been started
*/
ve.init.mw.Target.prototype.load = function () {
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
			'oldid': this.oldId,
			'token': this.editToken,
			'format': 'json'
		},
		'dataType': 'json',
		'type': 'POST',
		// Wait up to 100 seconds before giving up
		'timeout': 100000,
		'cache': 'false',
		'success': ve.bind( ve.init.mw.Target.onLoad, this ),
		'error': ve.bind( ve.init.mw.Target.onLoadError, this )
	} );
	return true;
};

/**
 * Posts DOM to Parsoid API.
 *
 * This method performs an asynchronous action and uses a callback function to handle the result.
 *
 * @example
 *     target.save( dom, { 'summary': 'test', 'minor': true, 'watch': false } );
 *
 * @method
 * @param {HTMLElement} dom DOM to save
 * @param {Object} options Saving options
 *  - {String} summary Edit summary
 *  - {Boolean} minor Edit is a minor edit
 *  - {Boolean} watch Watch this page
 * @returns {Boolean} Saving has been started
*/
ve.init.mw.Target.prototype.save = function ( dom, options ) {
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
			'oldid': this.oldId,
			'basetimestamp': this.baseTimeStamp,
			'starttimestamp': this.startTimeStamp,
			'html': $( dom ).html(),
			'token': this.editToken,
			'summary': options.summary,
			'minor': options.minor,
			'watch': options.watch
		},
		'dataType': 'json',
		'type': 'POST',
		// Wait up to 10 seconds before giving up
		'timeout': 10000,
		'success': ve.bind( ve.init.mw.Target.onSave, this ),
		'error': ve.bind( ve.init.mw.Target.onSaveError, this )
	} );
	return true;
};

/**
 * Posts DOM to Parsoid API.
 *
 * This method performs a synchronous action and will take the user to a new page when complete.
 *
 * @example
 *     target.submit( wikitext, { 'summary': 'test', 'minor': true, 'watch': false } );
 *
 * @method
 * @param {String} wikitext Wikitext to submit
 * @param {Object} options Saving options
 *  - {String} summary Edit summary
 *  - {Boolean} minor Edit is a minor edit
 *  - {Boolean} watch Watch this page
 * @returns {Boolean} Submitting has been started
*/
ve.init.mw.Target.prototype.submit = function ( wikitext, options ) {
	// Prevent duplicate requests
	if ( this.submitting ) {
		return false;
	}
	// Save DOM
	this.submitting = true;
	var key,
		$form = $( '<form method="post" enctype="multipart/form-data"></form>' ),
		params = {
			'format': 'text/x-wiki',
			'oldid': this.oldId || 0,
			'wpStarttime': this.baseTimeStamp,
			'wpEdittime': this.startTimeStamp,
			'wpTextbox1': wikitext,
			'wpSummary': options.summary,
			'wpWatchthis': options.watch,
			'wpMinoredit': options.minor,
			'wpEditToken': this.editToken,
			'wpSave': 1
		};
	// Add params as hidden fields
	for ( key in params ) {
		$form.append( $( '<input type="hidden">' ).attr( { 'name': key, 'value': params[key] } ) );
	}
	// Submit the form, mimicking a traditional edit
	$form.attr( 'action', this.submitUrl ).appendTo( 'body' ).submit();
	return true;
};

/**
 * Gets Wikitext from Parsoid API.
 *
 * This method performs an asynchronous action and uses a callback function to handle the result.
 *
 * @example
 *     target.serialize(
 *         dom,
 *         function ( wikitext ) {
 *             // Do something with the loaded DOM
 *         }
 *     );
 *
 * @method
 * @param {HTMLElement} dom DOM to serialize
 * @param {Function} callback Function to call when complete, accepts error and wikitext arguments
 * @returns {Boolean} Serializing has beeen started
*/
ve.init.mw.Target.prototype.serialize = function ( dom, callback ) {
	// Prevent duplicate requests
	if ( this.serializing ) {
		return false;
	}
	// Load DOM
	this.serializing = true;
	this.serializeCallback = callback;
	$.ajax( {
		'url': this.apiUrl,
		'data': {
			'action': 've-parsoid',
			'paction': 'serialize',
			'html': $( dom ).html(),
			'page': this.pageName,
			'token': this.editToken,
			'format': 'json'
		},
		'dataType': 'json',
		'type': 'POST',
		// Wait up to 100 seconds before giving up
		'timeout': 100000,
		'cache': 'false',
		'success': ve.bind( ve.init.mw.Target.onSerialize, this ),
		'error': ve.bind( ve.init.mw.Target.onSerializeError, this )
	} );
	return true;
};
