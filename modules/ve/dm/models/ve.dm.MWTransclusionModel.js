/*!
 * VisualEditor DataModel MWTransclusionModel class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

( function () {
var hasOwn = Object.hasOwnProperty,
	specCache = {};

/**
 * MediaWiki transclusion model.
 *
 * @class
 * @mixins ve.EventEmitter
 *
 * @constructor
 */
ve.dm.MWTransclusionModel = function VeDmMWTransclusionModel() {
	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.parts = [];
	this.uid = 0;
	this.requests = [];
};

/* Inheritance */

ve.mixinClass( ve.dm.MWTransclusionModel, ve.EventEmitter );

/* Events */

/**
 * @event add
 * @param {ve.dm.MWTransclusionPartModel} part Added part
 */

/**
 * @event remove
 * @param {ve.dm.MWTransclusionPartModel} part Removed part
 */

/* Methods */

/**
 * Load from transclusion data, and fetch spec from server.
 *
 * @method
 * @param {Object} data Transclusion data
 * @returns {jQuery.Promise} Promise, resolved when spec is loaded
 */
ve.dm.MWTransclusionModel.prototype.load = function ( data ) {
	var i, len, key, part, template,
		templates = [];

	// Convert single part format to multi-part format
	if ( data.params && data.target ) {
		data = { 'parts': [ { 'template': data } ] };
	}

	if ( ve.isArray( data.parts ) ) {
		for ( i = 0, len = data.parts.length; i < len; i++ ) {
			part = data.parts[i];
			if ( part.template ) {
				template = this.addTemplate( part.template.target );
				for ( key in part.template.params ) {
					template.addParameter( key, part.template.params[key].wt );
				}
				// Don't load specs for templates that don't have a resolvable target
				if ( part.template.target.href ) {
					templates.push( template );
				}
			} else if ( typeof part === 'string' ) {
				this.addContent( part );
			}
		}
	}
	// Add fetched specs to #specs store when the promise is resolved
	return this.fetchSpecs( templates ).done( function ( specs ) {
		ve.extendObject( specCache, specs );
	} );
};

/**
 * Fetch template specifications from server.
 *
 * @param {ve.dm.MWTransclusionModel[]} templates List of templates to load data for
 * @returns {jQuery.Promise} Promise, resolved when spec is loaded
 */
ve.dm.MWTransclusionModel.prototype.fetchSpecs = function ( templates ) {
	var i, len, title, request,
		requests = this.requests,
		deferred = $.Deferred(),
		specs = {},
		titles = [];

	// Get unique list of titles that aren't already loaded
	for ( i = 0, len = templates.length; i < len; i++ ) {
		title = templates[i].getTitle();
		if ( !specCache[title] && ve.indexOf( title, titles ) === -1 ) {
			titles.push( title );
		}
	}

	// Bypass server for empty lists
	if ( !titles.length ) {
		setTimeout( deferred.reject );
		return deferred.promise();
	}

	// Request template specs from server
	request = $.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'dataType': 'json',
		'data': {
			'format': 'json',
			'action': 'templatedata',
			'titles': titles.join( '|' )
		}
	} )
		.done( function ( data ) {
			var i, len, id, title;

			if ( data && data.pages ) {
				// Keep spec data on hand for future use
				for ( id in data.pages ) {
					specs[data.pages[id].title] = data.pages[id];
				}
				// Cross-reference under normalized titles
				if ( data.normalized ) {
					for ( i = 0, len = data.normalized.length; i < len; i++ ) {
						// Only define the alias if the target exists, otherwise
						// we create a new property with an invalid "undefined" value.
						if ( hasOwn.call( specs, data.normalized[i].to ) ) {
							specs[data.normalized[i].from] = specs[data.normalized[i].to];
						}
					}
				}
				// Load into existing templates
				for ( i = 0, len = templates.length; i < len; i++ ) {
					title = templates[i].getTitle();
					if ( hasOwn.call( specs, title ) ) {
						templates[i].getSpec().extend( specs[title] );
					}
				}
				deferred.resolve( specs );
			} else {
				deferred.reject( 'unavailable', arguments );
			}
		} )
		.fail( function () {
			deferred.reject( 'http', arguments );
		} )
		.always( function () {
			// Prune requests when complete
			var index = requests.indexOf( request );
			if ( index !== -1 ) {
				requests.splice( index, 1 );
			}
		} );
	requests.push( request );

	return deferred.promise();
};

/**
 * Abort any pending requests.
 *
 * @method
 */
ve.dm.MWTransclusionModel.prototype.abortRequests = function () {
	var i, len;

	for ( i = 0, len = this.requests.length; i < len; i++ ) {
		this.requests[i].abort();
	}
	this.requests.length = 0;
};

/**
 * Get plain object representation of template transclusion.
 *
 * @method
 * @returns {Object|null} Plain object representation, or null if empty
 */
ve.dm.MWTransclusionModel.prototype.getPlainObject = function () {
	var i, len, part, template, name, params,
		obj = { 'parts': [] };

	for ( i = 0, len = this.parts.length; i < len; i++ ) {
		part = this.parts[i];
		if ( part instanceof ve.dm.MWTemplateModel ) {
			template = { 'target': part.getTarget(), 'params': {} };
			params = part.getParameters();
			for ( name in params ) {
				template.params[name] = { 'wt': params[name].getValue() };
			}
			obj.parts.push( { 'template': template } );
		} else if ( part instanceof ve.dm.MWTransclusionContentModel ) {
			obj.parts.push( part.getValue() );
		}
	}

	if ( obj.parts.length === 0 ) {
		return null;
	}

	// Use single-part format when possible
	if ( obj.parts.length === 1 ) {
		obj = obj.parts[0].template;
	}

	return obj;
};

/**
 * Get a unique ID for a part in the transclusion.
 *
 * This is used to give parts unique IDs, and returns a different value each time it's called.
 *
 * @method
 * @returns {number} Unique ID
 */
ve.dm.MWTransclusionModel.prototype.getUniquePartId = function () {
	return this.uid++;
};

/**
 * Add content part.
 *
 * @method
 * @param {string} value Content value
 * @param {number} [index] Specific index to add content at
 * @returns {ve.dm.MWTransclusionContentModel} Added content part
 * @emits add
 */
ve.dm.MWTransclusionModel.prototype.addContent = function ( value, index ) {
	var part = new ve.dm.MWTransclusionContentModel( this, value );
	this.addPart( part, index );
	return part;
};

/**
 * Add template part.
 *
 * Templates are added asynchronously.
 *
 * @method
 * @param {Object} target Template target
 * @param {string} target.wt Original wikitext of target
 * @param {string} [target.href] Hypertext reference to target
 * @param {number} [index] Specific index to add template at
 * @returns {ve.dm.MWTemplateModel} Added template part
 * @emits add
 */
ve.dm.MWTransclusionModel.prototype.addTemplate = function ( target, index ) {
	var part = new ve.dm.MWTemplateModel( this, target ),
		title = part.getTitle(),
		finish = ve.bind( this.addPart, this, part, index );

	if ( hasOwn.call( specCache, title ) ) {
		part.getSpec().extend( specCache[title] );
		setTimeout( finish );
	} else {
		// Add fetched specs to #specs store when the promise is resolved
		this.fetchSpecs( [ part ] )
			.done( function ( specs ) {
				ve.extendObject( specCache, specs );
			} )
			.always( finish );
	}
	return part;
};

/**
 * Add template placeholder part.
 *
 * @method
 * @param {number} [index] Specific index to add placeholder at
 * @returns {ve.dm.MWTransclusionModel} Added template part
 * @emits add
 */
ve.dm.MWTransclusionModel.prototype.addPlaceholder = function ( index ) {
	var part = new ve.dm.MWTemplatePlaceholderModel( this );

	this.addPart( part, index );
	return part;
};

/**
 * Add part.
 *
 * @method
 * @param {ve.dm.MWTransclusionPartModel} part Part to add
 * @param {number} [index] Specific index to add content at
 * @emits add
 */
ve.dm.MWTransclusionModel.prototype.addPart = function ( part, index ) {
	this.parts.splice( index === undefined ? this.parts.length : index, 0, part );
	this.emit( 'add', part );
};

/**
 * Remove a part.
 *
 * @method
 * @param {ve.dm.MWTransclusionPartModel} part Part to remove
 * @emits remove
 */
ve.dm.MWTransclusionModel.prototype.removePart = function ( part ) {
	var index = ve.indexOf( part, this.parts );
	if ( index !== -1 ) {
		this.parts.splice( index, 1 );
		this.emit( 'remove', part );
	}
};

/**
 * Get all parts.
 *
 * @method
 * @returns {ve.dm.MWTransclusionPartModel[]} Parts in transclusion
 */
ve.dm.MWTransclusionModel.prototype.getParts = function () {
	return this.parts;
};

/**
 * Get part by its ID.
 *
 * Matching is performed against the first section of the `id`, delimited by a '/'.
 *
 * @method
 * @param {string} id Part ID
 * @returns {ve.dm.MWTransclusionPartModel|null} Part with matching ID, if found
 */
ve.dm.MWTransclusionModel.prototype.getPartFromId = function ( id ) {
	var i, len,
		// For ids from ve.dm.MWTemplateParameterModel, compare against the part id
		// of the parameter instead of the entire model id (e.g. "part_1" instead of "part_1/foo").
		partId = id.split( '/' )[0];

	for ( i = 0, len = this.parts.length; i < len; i++ ) {
		if ( this.parts[i].getId() === partId ) {
			return this.parts[i];
		}
	}
	return null;
};

}() );
