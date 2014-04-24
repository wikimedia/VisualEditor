/*!
 * VisualEditor UserInterface LanguageSearchWidget class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LanguageSearchWidget object.
 *
 * @class
 * @extends OO.ui.SearchWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.LanguageSearchWidget = function VeUiLanguageSearchWidget( config ) {
	// Configuration intialization
	config = ve.extendObject( {
		'placeholder': ve.msg( 'visualeditor-language-search-input-placeholder' )
	}, config );

	// Parent constructor
	OO.ui.SearchWidget.call( this, config );

	// Properties
	this.languages = this.getLanguages();
	this.languageCodes = Object.keys( this.languages ).sort( $.uls.data.sortByAutonym );

	// Initialization
	this.$element.addClass( 've-ui-languageSearchWidget' );
};

/* Inheritance */

OO.inheritClass( ve.ui.LanguageSearchWidget, OO.ui.SearchWidget );

/* Methods */

/**
 * @inheritDoc
 */
ve.ui.LanguageSearchWidget.prototype.onQueryChange = function () {
	// Parent method
	OO.ui.SearchWidget.prototype.onQueryChange.call( this );

	// Populate
	this.addResults();
};

/**
 * Get a list of languages to search
 *
 * @returns {Object} Language names keyed by their codes
 */
ve.ui.LanguageSearchWidget.prototype.getLanguages = function () {
	return $.uls.data.getAutonyms();
};

/**
 * Update search results from current query
 */
ve.ui.LanguageSearchWidget.prototype.addResults = function () {
	var i, l, langCode, autonym,
		query = this.query.getValue().trim(),
		hasQuery = !!query.length,
		items = [];

	this.results.clearItems();

	for ( i = 0, l = this.languageCodes.length; i < l; i++ ) {
		langCode = this.languageCodes[i];

		if ( query === '' || this.languageFilter( langCode, query ) ) {
			autonym = $.uls.data.getAutonym( langCode ) || this.languages[langCode] || langCode;

			items.push( new OO.ui.OptionWidget(
				langCode, { '$': this.$, 'label': autonym }
			).setSelected( false ) );
		}
	}

	this.results.addItems( items );
	if ( hasQuery ) {
		this.results.highlightItem( this.results.getFirstSelectableItem() );
	}
};

/**
 * Match a language against a query.
 *
 * Ported from Languagefilter#filter in jquery.uls.
 *
 * @param {string} langCode Language code
 * @param {string} searchTerm Search term
 * @returns {boolean} Language code matches search term
 */
ve.ui.LanguageSearchWidget.prototype.languageFilter = function ( langCode, searchTerm ) {
	var matcher = new RegExp( '^' + this.constructor.static.escapeRegex( searchTerm ), 'i' ),
		languageName = this.languages[langCode];

	return matcher.test( languageName ) ||
		matcher.test( $.uls.data.getAutonym( langCode ) ) ||
		matcher.test( langCode ) ||
		matcher.test( $.uls.data.getScript( langCode ) );
};

/**
 * Escape regex.
 *
 * Ported from Languagefilter#escapeRegex in jquery.uls.
 *
 * @param {string} value Text
 * @returns {string} Text escaped for use in regex
 */
ve.ui.LanguageSearchWidget.static.escapeRegex = function ( value ) {
	return value.replace( /[\-\[\]{}()*+?.,\\\^$\|#\s]/g, '\\$&' );
};
