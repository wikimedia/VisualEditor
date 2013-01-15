/*!
 * VisualEditor UserInterface Tool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface tool.
 *
 * @abstract
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.Tool = function VeUiTool( toolbar ) {
	// Properties
	this.toolbar = toolbar;
	this.$ = $( '<div class="ve-ui-tool"></div>' );

	// Events
	this.toolbar.addListenerMethods(
		this, { 'updateState': 'onUpdateState', 'clearState': 'onClearState' }
	);

	// Intialization
	this.$.attr( 'title', ve.msg( this.constructor.static.titleMessage ) );
};

/* Static Properties */

/**
 * @static
 * @property
 * @inheritable
 */
ve.ui.Tool.static = {};

/**
 * Symbolic name of tool.
 *
 * @abstract
 * @static
 * @property
 * @type {string}
 */
ve.ui.Tool.static.name = '';

/**
 * Message key for tool title.
 *
 * @abstract
 * @static
 * @property
 * @type {string}
 */
ve.ui.Tool.static.titleMessage = '';

/* Methods */

/**
 * Handle the toolbar state being updated.
 *
 * This is an abstract method that must be overridden in a concrete subclass.
 *
 * @abstract
 * @method
 */
ve.ui.Tool.prototype.onUpdateState = function () {
	throw new Error(
		've.ui.Tool.onUpdateState not implemented in this subclass:' + this.constructor
	);
};

/**
 * Handle the toolbar state being cleared.
 *
 * This is an abstract method that must be overridden in a concrete subclass.
 *
 * @abstract
 * @method
 */
ve.ui.Tool.prototype.onClearState = function () {
	throw new Error(
		've.ui.Tool.onClearState not implemented in this subclass:' + this.constructor
	);
};
