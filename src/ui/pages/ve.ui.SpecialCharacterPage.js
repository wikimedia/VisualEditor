/*!
 * VisualEditor user interface SpecialCharacterPage class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

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
ve.ui.SpecialCharacterPage = function VeUiSpecialCharacterPage( name, config ) {
	// Parent constructor
	OO.ui.PageLayout.call( this, name, config );

	this.label = config.label;
	this.icon = config.icon;

	var character,
		characters = config.characters,
		$characters = this.$( '<div>' ).addClass( 've-ui-specialCharacterPage-characters' );

	for ( character in characters ) {
		$characters.append(
			this.$( '<div>' )
				.addClass( 've-ui-specialCharacterPage-character' )
				.data( 'character', characters[character] )
				.text( character )
		);
	}

	this.$element
		.addClass( 've-ui-specialCharacterPage')
		.append( this.$( '<h3>' ).text( name ), $characters );
};

/* Inheritance */

OO.inheritClass( ve.ui.SpecialCharacterPage, OO.ui.PageLayout );

/* Methods */

ve.ui.SpecialCharacterPage.prototype.setupOutlineItem = function ( outlineItem ) {
	ve.ui.SpecialCharacterPage.super.prototype.setupOutlineItem.call( this, outlineItem );
	this.outlineItem.setLabel( this.label );
};
