/*!
 * ObjectOriented UserInterface FlaggableElement class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Element with named flags, used for styling, that can be added, removed and listed and checked.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string[]} [flags=[]] Styling flags, e.g. 'primary', 'destructive' or 'constructive'
 */
OO.ui.FlaggableElement = function OoUiFlaggableElement( config ) {
	// Config initialization
	config = config || {};

	// Properties
	this.flags = {};

	// Initialization
	this.setFlags( config.flags );
};

/* Methods */

/**
 * Check if a flag is set.
 *
 * @method
 * @param {string} flag Flag name to check
 * @returns {boolean} Has flag
 */
OO.ui.FlaggableElement.prototype.hasFlag = function ( flag ) {
	return flag in this.flags;
};

/**
 * Get the names of all flags.
 *
 * @method
 * @returns {string[]} flags Flag names
 */
OO.ui.FlaggableElement.prototype.getFlags = function () {
	return Object.keys( this.flags );
};

/**
 * Add one or more flags.
 *
 * @method
 * @param {string[]|Object.<string, boolean>} flags List of flags to add, or list of set/remove
 *  values, keyed by flag name
 * @chainable
 */
OO.ui.FlaggableElement.prototype.setFlags = function ( flags ) {
	var i, len, flag,
		classPrefix = 'oo-ui-flaggableElement-';

	if ( Array.isArray( flags ) ) {
		for ( i = 0, len = flags.length; i < len; i++ ) {
			flag = flags[i];
			// Set
			this.flags[flag] = true;
			this.$element.addClass( classPrefix + flag );
		}
	} else if ( OO.isPlainObject( flags ) ) {
		for ( flag in flags ) {
			if ( flags[flags] ) {
				// Set
				this.flags[flag] = true;
				this.$element.addClass( classPrefix + flag );
			} else {
				// Remove
				delete this.flags[flag];
				this.$element.removeClass( classPrefix + flag );
			}
		}
	}
	return this;
};
