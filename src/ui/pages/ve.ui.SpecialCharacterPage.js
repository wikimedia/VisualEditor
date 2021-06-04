/*!
 * VisualEditor user interface SpecialCharacterPage class.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Special character toolbar dialog.
 *
 * @class
 * @extends OO.ui.PageLayout
 *
 * @constructor
 * @param {string} name Unique symbolic name of page
 * @param {Object} [config] Configuration options
 * @cfg {string} [label]
 * @cfg {Object} [characters] Character set
 * @cfg {Object} [attributes] Extra attributes, currently `lang` and `dir`
 * @cfg {boolean} [source] Source mode only set
 */
ve.ui.SpecialCharacterPage = function VeUiSpecialCharacterPage( name, config ) {

	// Parent constructor
	ve.ui.SpecialCharacterPage.super.apply( this, arguments );

	this.label = config.label;

	var characters = config.characters;
	var $characters = $( '<div>' ).addClass( 've-ui-specialCharacterPage-characters' );
	var charactersNode = $characters[ 0 ];
	var source = config.source;

	// The body of this loop is executed a few thousand times when opening
	// ve.ui.SpecialCharacterDialog, avoid jQuery wrappers.
	for ( var character in characters ) {
		if ( !source && characters[ character ].source ) {
			continue;
		}
		var characterNode = document.createElement( 'div' );
		characterNode.className = 've-ui-specialCharacterPage-character';
		if ( characters[ character ].titleMsg ) {
			// eslint-disable-next-line mediawiki/msg-doc
			characterNode.setAttribute( 'title', ve.msg( characters[ character ].titleMsg ) );
		}
		if ( characters[ character ].source ) {
			characterNode.classList.add( 've-ui-specialCharacterPage-character-source' );
		}
		characterNode.textContent = character;
		$.data( characterNode, 'character', characters[ character ] );
		charactersNode.appendChild( characterNode );
	}

	if ( config.attributes ) {
		$characters.attr( 'lang', config.attributes.lang );
		$characters.attr( 'dir', config.attributes.dir );
	}

	this.$element
		.addClass( 've-ui-specialCharacterPage' )
		.append( $( '<h3>' ).text( this.label ), $characters );
};

/* Inheritance */

OO.inheritClass( ve.ui.SpecialCharacterPage, OO.ui.PageLayout );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterPage.prototype.setupOutlineItem = function () {
	// Parent method
	ve.ui.SpecialCharacterPage.super.prototype.setupOutlineItem.apply( this, arguments );

	this.outlineItem.setLabel( this.label );
};
