/*!
 * VisualEditor UserInterface SymbolListBookletLayout class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ...
 *
 * @class
 * @extends OO.ui.BookletLayout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.SymbolListBookletLayout = function VeUiSymbolListBookletLayout( config ) {
	config = config || {};

	// Parent constructor
	ve.ui.SymbolListBookletLayout.super.call( this, ve.extendObject( {
		outlined: true,
		continuous: true
	}, config ) );

	if ( config.preferenceNameSuffix && ve.init.platform.canUseUserConfig() ) {
		this.recentlyUsedKey = 'visualeditor-symbolList-recentlyUsed-' + config.preferenceNameSuffix;
		this.recentlyUsed = ve.userConfig( this.recentlyUsedKey ) || [];
	}

	this.$element.addClass( 've-ui-symbolListBookletLayout' );
};

/* Inheritance */

OO.inheritClass( ve.ui.SymbolListBookletLayout, OO.ui.BookletLayout );

/* Static properties */

/**
 * Sets how many entries to keep in the "recently used" list
 *
 * @static
 * @property {number}
 */
ve.ui.SymbolListBookletLayout.static.maxRecentlyUsed = 32;

/* Methods */

/**
 * Set symbol data
 *
 * @param {Object} symbolData
 */
ve.ui.SymbolListBookletLayout.prototype.setSymbolData = function ( symbolData ) {
	const pages = [];
	for ( const category in symbolData ) {
		pages.push(
			new ve.ui.SymbolListPage( category, symbolData[ category ] )
		);
	}
	this.addPages( pages );
	this.$element.on(
		'click',
		'.ve-ui-symbolListPage-symbol',
		this.onListClick.bind( this )
	);

	this.renderRecentlyUsed();
};

/**
 * Set recent data
 */
ve.ui.SymbolListBookletLayout.prototype.renderRecentlyUsed = function () {
	if ( this.recentlyUsed === undefined ) {
		return;
	}
	const recentPage = new ve.ui.SymbolListPage( 'recent', {
		label: ve.msg( 'visualeditor-specialcharacter-recentlyused' ),
		symbols: this.recentlyUsed,
		attributes: { 'data-recent': '' }
	} );
	this.addPages( [ recentPage ], 0 );
};

/**
 * Inserts a character at the start of the recently-used list and updates the user preference.
 *
 * @param {string|Object} character A symbol string or object
 * @param {boolean} fromRecentList Set when the symbol was chosen from the recently-used list. Inhibits a rerender.
 */
ve.ui.SymbolListBookletLayout.prototype.updateRecentlyUsed = function ( character, fromRecentList ) {
	if ( this.recentlyUsed === undefined ) {
		return;
	}

	const seen = this.recentlyUsed.findIndex(
		( c ) => JSON.stringify( c ) === JSON.stringify( character )
	);
	if ( seen === 0 ) {
		// The character is already the most recently-used, so there's no need to update anything
		return;
	}
	if ( seen !== -1 ) {
		// This character is already in the list - remove it so we can re-insert it at the start
		this.recentlyUsed.splice( seen, 1 );
	}
	this.recentlyUsed.unshift( character );
	this.recentlyUsed = this.recentlyUsed.slice( 0, this.constructor.static.maxRecentlyUsed );

	if ( this.recentlyUsedKey !== undefined ) {
		ve.userConfig( this.recentlyUsedKey, this.recentlyUsed );
	}

	/* Avoid re-ordering the list under the user's cursor */
	if ( !fromRecentList ) {
		this.renderRecentlyUsed();
	}
};

/**
 * Handle the click event on the list
 *
 * @param {jQuery.Event} e Mouse click event
 */
ve.ui.SymbolListBookletLayout.prototype.onListClick = function ( e ) {
	const symbol = $( e.target ).data( 'symbol' );

	if ( symbol ) {
		this.emit( 'choose', symbol );
		this.updateRecentlyUsed( symbol, e.target.parentNode.hasAttribute( 'data-recent' ) );
	}
};
