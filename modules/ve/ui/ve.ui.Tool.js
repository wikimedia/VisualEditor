/*!
 * VisualEditor UserInterface Tool class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
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
	var tool = this;
	// Properties
	this.toolbar = toolbar;
	this.$ = $( '<div class="ve-ui-tool"></div>' );

	// Events
	this.toolbar.addListenerMethods(
		this, { 'updateState': 'onUpdateState', 'clearState': 'onClearState' }
	);
	ve.triggerRegistry.on( 'register', function ( name ) {
		if ( name === tool.constructor.static.name ) {
			tool.setTitle();
		}
	} );

	// Initialization
	this.setTitle();
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
 * Sets the tool title attribute in the dom.
 *
 * Combines trigger i18n with tooltip message if trigger exists.
 * Otherwise defaults to titleMessage value.
 *
 * @abstract
 * @method
 */
ve.ui.Tool.prototype.setTitle = function () {
	var trigger = ve.triggerRegistry.lookup( this.constructor.static.name ),
		labelMessage = ve.msg( this.constructor.static.titleMessage );
	if ( trigger ) {
		labelMessage += ' [' + trigger.getMessage() + ']';
	}
	this.$.attr( 'title', labelMessage );
};

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
