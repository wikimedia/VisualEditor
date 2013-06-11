/*!
 * VisualEditor DataModel MWTransclusionModel class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

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
	this.specs = {};
	this.uid = 0;
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
	// Promise is resolved passing the specs object as the first argument - binding #specs
	// to precede that argument and passing them both to extendObject will cause #specs to be added
	// to when the promise is resolved
	return this.fetchSpecs( templates ).done( ve.bind( ve.extendObject, null, this.specs ) );
};

/**
 * Fetch template specifications from server.
 *
 * @param {ve.dm.MWTransclusionModel[]} templates List of templates to load data for
 * @returns {jQuery.Promise} Promise, resolved when spec is loaded
 */
ve.dm.MWTransclusionModel.prototype.fetchSpecs = function ( templates ) {
	var i, len, title, deferred = $.Deferred(),
		specs = {},
		titles = [];

	// Get unique list of titles
	for ( i = 0, len = templates.length; i < len; i++ ) {
		title = templates[i].getTitle();
		if ( ve.indexOf( title, titles ) === -1 ) {
			titles.push( title );
		}
	}

	// Bypass server for empty lists
	if ( !titles.length ) {
		setTimeout( deferred.reject );
		return deferred.promise();
	}

	// Request template specs from server
	$.ajax( {
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
						specs[data.normalized[i].from] = specs[data.normalized[i].to];
					}
				}
				// Load into existing templates
				for ( i = 0, len = templates.length; i < len; i++ ) {
					title = templates[i].getTitle();
					if ( specs.hasOwnProperty( title ) ) {
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
		} );

	return deferred.promise();
};

/**
 * Get plain object representation of template transclusion.
 *
 * @method
 * @returns {Object} Plain object representation
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

	// Use single-part format when possible
	if ( obj.parts.length === 1 ) {
		obj = this.content.parts[0].template;
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
	this.parts.splice( index === undefined ? this.parts.length : index, 0, part );
	this.emit( 'add', part );
	return part;
};

/**
 * Add template part.
 *
 * @method
 * @param {string} title Template title
 * @param {number} [index] Specific index to add content at
 * @returns {ve.dm.MWTransclusionModel} Added template part
 * @emits add
 */
ve.dm.MWTransclusionModel.prototype.addTemplate = function ( title, index ) {
	var part = new ve.dm.MWTemplateModel( this, title );
	if ( this.specs.hasOwnProperty( title ) ) {
		part.getSpec().extend( this.specs[title] );
	}
	this.parts.splice( index === undefined ? this.parts.length : index, 0, part );
	this.emit( 'add', part );
	return part;
};

/**
 * Remove a part.
 *
 * @method
 * @param {ve.dm.MWTransclusionPartModel} part Template part
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
 * Get a template specification.
 *
 * @method
 * @param {string} name Template name
 * @return {ve.dm.MWTemplateSpecModel} Template spec
 */
ve.dm.MWTransclusionModel.prototype.getTemplateSpec = function ( name ) {
	return this.specs[name];
};
