/**
 * VisualEditor user interface Tool class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Tool object.
 *
 * @class
 * @abstract
 * @constructor
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
ve.ui.Tool = function VeUiTool( toolbar, name, title ) {
	// Properties
	this.toolbar = toolbar;
	this.name = name;
	this.title = title;
	this.$ = $( '<div class="ve-ui-tool"></div>' ).attr( 'title', this.title );

	// Events
	this.toolbar.addListenerMethods( this, {
		'updateState': 'onUpdateState',
		'clearState': 'onClearState'
	} );
};

/* Static Members */

ve.ui.Tool.tools = {};

/* Methods */

ve.ui.Tool.prototype.onUpdateState = function () {
	throw new Error( 'Tool.onUpdateState not implemented in this subclass:' + this.constructor );
};

ve.ui.Tool.prototype.onClearState = function () {
	this.$.removeClass( 've-ui-toolbarButtonTool-down' );
};
