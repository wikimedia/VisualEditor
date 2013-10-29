/*!
 * ObjectOriented UserInterface OutlineItemWidget class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an OO.ui.OutlineItemWidget object.
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Configuration options
 * @cfg {number} [level] Indentation level
 * @cfg {boolean} [moveable] Allow modification from outline controls
 */
OO.ui.OutlineItemWidget = function OoUiOutlineItemWidget( data, config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	OO.ui.OptionWidget.call( this, data, config );

	// Properties
	this.level = 0;
	this.moveable = !!config.moveable;

	// Initialization
	this.$.addClass( 'oo-ui-outlineItemWidget' );
	this.setLevel( config.level );
};

/* Inheritance */

OO.inheritClass( OO.ui.OutlineItemWidget, OO.ui.OptionWidget );

/* Static Properties */

OO.ui.OutlineItemWidget.static.highlightable = false;

OO.ui.OutlineItemWidget.static.scrollIntoViewOnSelect = true;

OO.ui.OutlineItemWidget.static.levelClass = 'oo-ui-outlineItemWidget-level-';

OO.ui.OutlineItemWidget.static.levels = 3;

/* Methods */

/**
 * Check if item is moveable.
 *
 * Moveablilty is used by outline controls.
 *
 * @returns {boolean} Item is moveable
 */
OO.ui.OutlineItemWidget.prototype.isMoveable = function () {
	return this.moveable;
};

/**
 * Get indentation level.
 *
 * @returns {number} Indentation level
 */
OO.ui.OutlineItemWidget.prototype.getLevel = function () {
	return this.level;
};

/**
 * Set indentation level.
 *
 * @method
 * @param {number} [level=0] Indentation level, in the range of [0,#maxLevel]
 * @chainable
 */
OO.ui.OutlineItemWidget.prototype.setLevel = function ( level ) {
	var levels = this.constructor.static.levels,
		levelClass = this.constructor.static.levelClass,
		i = levels;

	this.level = level ? Math.max( 0, Math.min( levels - 1, level ) ) : 0;
	while ( i-- ) {
		if ( this.level === i ) {
			this.$.addClass( levelClass + i );
		} else {
			this.$.removeClass( levelClass + i );
		}
	}

	return this;
};
