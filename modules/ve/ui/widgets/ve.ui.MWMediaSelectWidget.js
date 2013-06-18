/*!
 * VisualEditor UserInterface MWMediaSelectWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * Creates an ve.ui.MWMediaSelectWidget object.
 *
 * @class
 * @extends ve.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Config options
 * @param {number} [size] Vertical size of thumbnails
 */
ve.ui.MWMediaSelectWidget = function VeUiMWMediaSelectWidget( config ) {
	// Configuration intialization
	config = config || {};

	// Parent constructor
	ve.ui.Widget.call( this, config );

	// Properties
	this.input = new ve.ui.TextInputWidget( {
		'$$': this.$$,
		'placeholder': ve.msg( 'visualeditor-media-input-placeholder' ),
		'value': mw.config.get( 'wgTitle' ),
		'icon': 'search'
	} );
	this.select = new ve.ui.SelectWidget( { '$$': this.$$ } );
	this.$query = this.$$( '<div>' );
	this.$results = this.$$( '<div>' );

	this.sources = ve.copyArray( ve.init.platform.getMediaSources() );
	this.size = config.size || 150;
	this.inputTimeout = null;
	this.titles = {};
	this.queryMediaSourcesCallback = ve.bind( this.queryMediaSources, this );

	// Events
	this.input.connect( this, { 'change': 'onInputChange' } );
	this.select.connect( this, { 'select': 'onSelectSelect' } );
	this.$results.on( 'scroll', ve.bind( this.onResultsScroll, this ) );

	// Initialization
	this.$query
		.addClass( 've-ui-mwMediaSelectWidget-query' )
		.append( this.input.$ );
	this.$results
		.addClass( 've-ui-mwMediaSelectWidget-results' )
		.append( this.select.$ );
	this.$
		.addClass( 've-ui-mwMediaSelectWidget' )
		.append( this.$results, this.$query );
	this.queryMediaSources();
};

/* Inheritance */

ve.inheritClass( ve.ui.MWMediaSelectWidget, ve.ui.Widget );

/* Events */

/**
 * @event select
 * @param {Object} item Media item info
 */

/* Methods */

/**
 * Handle select widget select events.
 *
 * @param {string} value New value
 */
ve.ui.MWMediaSelectWidget.prototype.onInputChange = function () {
	var i, len;

	if ( this.loading ) {
		this.request.abort();
	}

	// Reset
	this.select.clearItems();
	for ( i = 0, len = this.sources.length; i < len; i++ ) {
		delete this.sources[i].gsroffset;
	}

	// Queue
	clearTimeout( this.inputTimeout );
	this.inputTimeout = setTimeout( this.queryMediaSourcesCallback, 100 );
};

/**
 * Handle select widget select events.
 *
 * @param {ve.ui.MWMediaSelectItemWidget} item Selected item
 * @emits select
 */
ve.ui.MWMediaSelectWidget.prototype.onSelectSelect = function ( item ) {
	this.emit( 'select', item ? item.getData() : null );
};

/**
 * Handle results scroll events.
 *
 * @param {jQuery.Event} e Scroll event
 */
ve.ui.MWMediaSelectWidget.prototype.onResultsScroll = function () {
	var position = this.$results.scrollTop() + this.$results.outerHeight(),
		threshold = this.select.$.outerHeight() - this.size;
	if ( !this.input.isPending() && position > threshold ) {
		this.queryMediaSources();
	}
};

/**
 * Query all sources for media.
 *
 * @method
 */
ve.ui.MWMediaSelectWidget.prototype.queryMediaSources = function () {
	var i, len, source,
		value = this.input.getValue();

	if ( value === '' ) {
		return;
	}

	for ( i = 0, len = this.sources.length; i < len; i++ ) {
		source = this.sources[i];
		if ( source.request ) {
			source.request.abort();
		}
		if ( !source.gsroffset ) {
			source.gsroffset = 0;
		}
		this.input.pushPending();
		source.request = $.ajax( {
			'url': source.url,
			'data': {
				'format': 'json',
				'action': 'query',
				'generator': 'search',
				'gsrsearch': value,
				'gsrnamespace': 6,
				'gsrlimit': 15,
				'gsroffset': source.gsroffset,
				'prop': 'imageinfo',
				'iiprop': 'dimensions|url',
				'iiurlheight': this.size
			},
			'dataType': 'jsonp'
		} )
			.always( ve.bind( this.onMediaQueryAlways, this, source ) )
			.done( ve.bind( this.onMediaQueryDone, this, source ) );
	}
};

/**
 * Handle media query response events.
 *
 * @method
 * @param {Object} source Media query source
 */
ve.ui.MWMediaSelectWidget.prototype.onMediaQueryAlways = function ( source ) {
	source.request = null;
	this.input.popPending();
};

/**
 * Handle media query load events.
 *
 * @method
 * @param {Object} source Media query source
 * @param {Object} data Media query response
 */
ve.ui.MWMediaSelectWidget.prototype.onMediaQueryDone = function ( source, data ) {
	if ( !data.query || !data.query.pages ) {
		return;
	}

	var	page, title,
		items = [],
		pages = data.query.pages,
		value = this.input.getValue();

	if ( value === '' ) {
		return;
	}

	if ( data['query-continue'] && data['query-continue'].search ) {
		source.gsroffset = data['query-continue'].search.gsroffset;
	}

	for ( page in pages ) {
		title = pages[page].title;
		if ( !( title in this.titles ) ) {
			this.titles[title] = true;
			items.push(
				new ve.ui.MWMediaSelectItemWidget(
					pages[page],
					{ '$$': this.$$, 'size': this.size }
				)
			);
		}
	}

	this.select.addItems( items );
};
