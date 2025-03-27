/*!
 * VisualEditor UserInterface LanguageSearchWidget class.
 *
 * @copyright See AUTHORS.txt
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
	// Configuration initialization
	config = ve.extendObject( {
		placeholder: ve.msg( 'visualeditor-language-search-input-placeholder' )
	}, config );

	// Parent constructor
	ve.ui.LanguageSearchWidget.super.call( this, config );

	// Properties
	this.filteredLanguageResultWidgets = [];
	this.languageResultWidgets = ve.init.platform.getLanguageCodes()
		.sort()
		.map( ( languageCode ) => new ve.ui.LanguageResultWidget( { data: {
			code: languageCode,
			name: ve.init.platform.getLanguageName( languageCode ),
			autonym: ve.init.platform.getLanguageAutonym( languageCode )
		} } ) );

	this.setAvailableLanguages();

	// Initialization
	this.$element.addClass( 've-ui-languageSearchWidget' );
};

/* Inheritance */

OO.inheritClass( ve.ui.LanguageSearchWidget, OO.ui.SearchWidget );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.LanguageSearchWidget.prototype.onQueryChange = function () {
	// Parent method
	ve.ui.LanguageSearchWidget.super.prototype.onQueryChange.apply( this, arguments );

	// Populate
	this.addResults();
};

/**
 * Set available languages to show
 *
 * @param {string[]} availableLanguages Available language codes to show, all if undefined
 */
ve.ui.LanguageSearchWidget.prototype.setAvailableLanguages = function ( availableLanguages ) {
	if ( !availableLanguages ) {
		this.filteredLanguageResultWidgets = this.languageResultWidgets.slice();
		return;
	}

	this.filteredLanguageResultWidgets = [];

	this.languageResultWidgets.forEach( ( languageResult ) => {
		const data = languageResult.getData();
		if ( availableLanguages.includes( data.code ) ) {
			this.filteredLanguageResultWidgets.push( languageResult );
		}
	} );
};

/**
 * Update search results from current query
 */
ve.ui.LanguageSearchWidget.prototype.addResults = function () {
	const matchProperties = [ 'name', 'autonym', 'code' ],
		query = this.query.getValue().trim(),
		compare = new Intl.Collator( this.lang, { sensitivity: 'base' } ).compare,
		hasQuery = !!query.length,
		items = [];

	this.results.clearItems();

	this.filteredLanguageResultWidgets.forEach( ( languageResult ) => {
		const data = languageResult.getData();

		const matchedProperty = matchProperties.find(
			( property ) => data[ property ] && compare( data[ property ].slice( 0, query.length ), query ) === 0
		);

		if ( query === '' || matchedProperty ) {
			items.push(
				languageResult
					.updateLabel( query, matchedProperty, compare )
					.setSelected( false )
					.setHighlighted( false )
			);
		}
	} );

	this.results.addItems( items );
	if ( hasQuery ) {
		this.results.highlightItem( this.results.findFirstSelectableItem() );
	}
};
