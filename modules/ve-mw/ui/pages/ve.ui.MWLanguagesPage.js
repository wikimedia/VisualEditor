/*!
 * VisualEditor user interface MWLanguagesPage class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * MediaWiki meta dialog Languages page.
 *
 * @class
 * @extends OO.ui.PageLayout
 *
 * @constructor
 * @param {string} name Unique symbolic name of page
 * @param {Object} [config] Configuration options
 */
ve.ui.MWLanguagesPage = function VeUiMWLanguagesPage( name, config ) {
	// Configuration initialization
	config = ve.extendObject( config, { 'icon': 'language' } );

	// Parent constructor
	OO.ui.PageLayout.call( this, name, config );

	// Properties
	this.label = ve.msg( 'visualeditor-dialog-meta-languages-section' );
	this.languagesFieldset = new OO.ui.FieldsetLayout( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-dialog-meta-languages-label' ),
		'icon': 'language'
	} );

	// Initialization
	this.languagesFieldset.$element.append(
		this.$( '<span>' )
			.text( ve.msg( 'visualeditor-dialog-meta-languages-readonlynote' ) )
	);
	this.$element.append( this.languagesFieldset.$element );

	this.getAllLanguageItems().done( ve.bind( this.onLoadLanguageData, this ) );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWLanguagesPage, OO.ui.PageLayout );

/* Methods */

ve.ui.MWLanguagesPage.prototype.onLoadLanguageData = function ( languages ) {
	var i, $languagesTable = this.$( '<table>' ), languageslength = languages.length;

	$languagesTable
		.addClass( 've-ui-MWLanguagesPage-languages-table' )
		.append( this.$( '<tr>' )
			.append(
				this.$( '<th>' )
					.append( ve.msg( 'visualeditor-dialog-meta-languages-code-label' ) )
			)
			.append(
				this.$( '<th>' )
					.append( ve.msg( 'visualeditor-dialog-meta-languages-link-label' ) )
			)
		);

	for ( i = 0; i < languageslength; i++ ) {
		languages[i].safelang = languages[i].lang;
		languages[i].dir = 'auto';
		if ( $.uls ) {
			// site codes don't always represent official language codes
			// using real language code instead of a dummy ('redirect' in ULS' terminology)
			languages[i].safelang = $.uls.data.isRedirect( languages[i].lang ) || languages[i].lang;
			languages[i].dir = $.uls.data.getDir( languages[i].safelang );
		}
		$languagesTable
			.append( this.$( '<tr>' )
				.append( this.$( '<td>' ).append( languages[i].lang ) )
				.append( this.$( '<td>' ).append( languages[i].title )
					.attr( 'lang', languages[i].safelang )
					.attr( 'dir', languages[i].dir ) )
			);
	}

	this.languagesFieldset.$element.append( $languagesTable );
};

/**
 * Handle language items being loaded.
 */
ve.ui.MWLanguagesPage.prototype.onAllLanuageItemsSuccess = function ( deferred, response ) {
	var i, iLen, languages = [], langlinks = response.query.pages[response.query.pageids[0]].langlinks;
	if ( langlinks ) {
		for ( i = 0, iLen = langlinks.length; i < iLen; i++ ) {
			languages.push( {
				'lang': langlinks[i].lang,
				'title': langlinks[i]['*'],
				'metaItem': null
			} );
		}
	}
	deferred.resolve( languages );
};

/**
 * Gets language item from meta list item
 *
 * @param {Object} ve.dm.MWLanguageMetaItem
 * @returns {Object} item
 */
ve.ui.MWLanguagesPage.prototype.getLanguageItemFromMetaListItem = function ( metaItem ) {
	// TODO: get real values from metaItem once Parsoid actually provides them - bug 48970
	return {
		'lang': 'lang',
		'title': 'title',
		'metaItem': metaItem
	};
};

/**
 * Get array of language items from meta list
 *
 * @returns {Object[]} items
 */
ve.ui.MWLanguagesPage.prototype.getLocalLanguageItems = function () {
	var i,
		items = [],
		languages = this.metaList.getItemsInGroup( 'mwLanguage' ),
		languageslength = languages.length;

	// Loop through MWLanguages and build out items

	for ( i = 0; i < languageslength; i++ ) {
		items.push( this.getLanguageItemFromMetaListItem( languages[i] ) );
	}
	return items;
};

/**
 * Get array of language items from meta list
 *
 * @returns {jQuery.Promise}
 */
ve.ui.MWLanguagesPage.prototype.getAllLanguageItems = function () {
	var deferred = $.Deferred();
	// TODO: Detect paging token if results exceed limit
	$.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'data': {
			'action': 'query',
			'prop': 'langlinks',
			'lllimit': 500,
			'titles': mw.config.get( 'wgTitle' ),
			'indexpageids': 1,
			'format': 'json'
		},
		'dataType': 'json',
		'type': 'POST',
		// Wait up to 100 seconds before giving up
		'timeout': 100000,
		'cache': 'false'
	} )
		.done( ve.bind( this.onAllLanuageItemsSuccess, this, deferred ) )
		.fail( ve.bind( this.onAllLanuageItemsError, this, deferred ) );
	return deferred.promise();
};

/**
 * Handle language items failing to be loaded.
 *
 * TODO: This error function should probably not be empty.
 */
ve.ui.MWLanguagesPage.prototype.onAllLanuageItemsError = function () {};
