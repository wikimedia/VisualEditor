/*!
 * ObjectOriented UserInterface IconedElement class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Element containing an icon.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $icon Icon node, assigned to #$icon
 * @param {Object} [config] Configuration options
 * @cfg {Object|string} [icon=''] Symbolic icon name, or map of icon names keyed by language ID
 */
OO.ui.IconedElement = function OoUiIconedElement( $icon, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.$icon = $icon;
	this.icon = null;

	// Initialization
	this.$icon.addClass( 'oo-ui-iconedElement-icon' );
	this.setIcon( config.icon );
};

/* Methods */

/**
 * Set the icon.
 *
 * @method
 * @param {string} [value] Symbolic name of icon to use
 * @chainable
 */
OO.ui.IconedElement.prototype.setIcon = function ( value ) {
	var i, len, icon, lang,
		langs = OO.ui.getUserLanguages();

	if ( OO.isPlainObject( value ) ) {
		icon = value['default'];
		for ( i = 0, len = langs.length; i < len; i++ ) {
			lang = langs[i];
			if ( value[lang] ) {
				icon = value[lang];
				break;
			}
		}
	} else {
		icon = value;
	}

	if ( this.icon ) {
		this.$icon.removeClass( 'oo-ui-icon-' + this.icon );
	}
	if ( typeof icon === 'string' ) {
		icon = icon.trim();
		if ( icon.length ) {
			this.$icon.addClass( 'oo-ui-icon-' + icon );
			this.icon = icon;
		}
	}
	return this;
};
