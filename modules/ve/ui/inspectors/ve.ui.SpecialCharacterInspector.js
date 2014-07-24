/*!
 * VisualEditor UserInterface SpecialCharacterInspector class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Inspector for inserting special characters.
 *
 * @class
 * @extends ve.ui.InsertionInspector
 *
 * @constructor
 * @param {OO.ui.WindowManager} manager Manager of window
 * @param {Object} [config] Configuration options
 */
ve.ui.SpecialCharacterInspector = function VeUiSpecialCharacterInspector( manager, config ) {
	// Parent constructor
	ve.ui.InsertionInspector.call( this, manager, config );

	this.characters = null;
	this.$buttonDomList = null;
	this.initialSelection = null;
	this.categories = null;

	this.$element.addClass( 've-ui-specialCharacterInspector' );
};

/* Inheritance */

OO.inheritClass( ve.ui.SpecialCharacterInspector, ve.ui.InsertionInspector );

/* Static properties */

ve.ui.SpecialCharacterInspector.static.name = 'specialcharacter';

ve.ui.SpecialCharacterInspector.static.title =
	OO.ui.deferMsg( 'visualeditor-specialcharacterinspector-title' );

ve.ui.SpecialCharacterInspector.static.size = 'large';

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.SpecialCharacterInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.SpecialCharacterInspector.super.prototype.initialize.call( this );

	this.$spinner = this.$( '<div>' ).addClass( 've-ui-specialCharacterInspector-spinner' );
	this.form.$element.append( this.$spinner );
};

/**
 * Handle the inspector being setup.
 *
 * @method
 * @param {Object} [data] Inspector opening data
 */
ve.ui.SpecialCharacterInspector.prototype.getSetupProcess = function ( data ) {
	return ve.ui.SpecialCharacterInspector.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			// Preserve initial selection so we can collapse cursor position
			// after we're done adding
			this.initialSelection = this.getFragment().getRange();

			// Don't request the character list again if we already have it
			if ( !this.characters ) {
				this.$spinner.show();
				this.fetchCharList()
					.done( ve.bind( function () {
						this.buildButtonList();
					}, this ) )
					// TODO: show error message on fetchCharList().fail
					.always( ve.bind( function () {
						// TODO: generalize push/pop pending, like we do in Dialog
						this.$spinner.hide();
					}, this ) );
			}
		}, this );
};

/**
 * Fetch the special character list object
 *
 * Returns a promise which resolves when this.characters has been populated
 *
 * @returns {jQuery.Promise}
 */
ve.ui.SpecialCharacterInspector.prototype.fetchCharList = function () {
	var charsList,
		charsObj = {};

	// Get the character list
	charsList = ve.msg( 'visualeditor-specialcharinspector-characterlist-insert' );
	try {
		charsObj = $.parseJSON( charsList );
	} catch ( err ) {
		// There was no character list found, or the character list message is
		// invalid json string. Force a fallback to the minimal character list
		ve.log( 've.ui.SpecialCharacterInspector: Could not parse the Special Character list.');
		ve.log( err.message );
	} finally {
		this.characters = charsObj;
	}

	// This implementation always resolves instantly
	return $.Deferred().resolve().promise();
};

/**
 * Builds the button DOM list based on the character list
 */
ve.ui.SpecialCharacterInspector.prototype.buildButtonList = function () {
	var category, character, characters, $categoryButtons,
		$list = this.$( '<div>' ).addClass( 've-ui-specialCharacterInspector-list' );

	for ( category in this.characters ) {
		characters = this.characters[category];
		$categoryButtons = $( '<div>' ).addClass( 've-ui-specialCharacterInspector-list-group' );
		for ( character in characters ) {
			$categoryButtons.append(
				$( '<div>' )
					.addClass( 've-ui-specialCharacterInspector-list-character' )
					.data( 'character', characters[character] )
					.text( character )
			);
		}

		$list
			.append( this.$( '<h3>').text( category ) )
			.append( $categoryButtons );
	}

	$list.on( 'click', ve.bind( this.onListClick, this ) );

	this.form.$element.append( $list );
};

/**
 * Handle the click event on the list
 */
ve.ui.SpecialCharacterInspector.prototype.onListClick = function ( e ) {
	var character = $( e.target ).data( 'character' );

	if ( character !== undefined ) {
		this.getFragment().insertContent( character, false ).collapseRangeToEnd().select();
	}
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.SpecialCharacterInspector );
