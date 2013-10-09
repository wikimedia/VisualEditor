/*!
 * ObjectOriented UserInterface Tool class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic toolbar tool.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.IconedElement
 * @mixins OO.ui.LabeledElement
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.Tool = function OoUiTool( toolbar, config ) {
	var titleMessage = this.constructor.static.titleMessage;

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$$( '<span>' ) );
	OO.ui.LabeledElement.call( this, this.$$( '<span>' ) );

	// Properties
	this.toolbar = toolbar;
	this.active = false;

	// Events
	this.toolbar.connect( this, { 'updateState': 'onUpdateState' } );

	// Initialization
	this.$
		.data( 'oo-ui-tool', this )
		.addClass(
			'oo-ui-tool oo-ui-tool-' +
			this.constructor.static.name.replace( /^([^\/]+)\/([^\/]+).*$/, '$1-$2' )
		)
		.append( this.$icon, this.$label );
	this.setLabel( titleMessage ? OO.ui.msg( titleMessage ) : '' );
	this.setIcon( this.constructor.static.icon );
};

/* Inheritance */

OO.inheritClass( OO.ui.Tool, OO.ui.Widget );

OO.mixinClass( OO.ui.Tool, OO.ui.IconedElement );
OO.mixinClass( OO.ui.Tool, OO.ui.LabeledElement );

/* Events */

/**
 * @event select
 */

/* Static Properties */

OO.ui.Tool.static.tagName = 'a';

/**
 * Symbolic name of tool.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Tool.static.name = '';

/**
 * Tool group.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Tool.static.group = '';

/**
 * Symbolic name of icon.
 *
 * Value should be the unique portion of an icon CSS class name, such as 'up' for 'oo-ui-icon-up'.
 *
 * For i18n purposes, this property can be an object containing a `default` icon name property and
 * additional icon names keyed by language code.
 *
 * Example of i18n icon definition:
 *     { 'default': 'bold-a', 'en': 'bold-b', 'de': 'bold-f' }
 *
 * @abstract
 * @static
 * @property {string|Object}
 * @inheritable
 */
OO.ui.Tool.static.icon = '';

/**
 * Message key for tool title.
 *
 * Title is used as a tooltip when the tool is part of a bar tool group, or a label when the tool
 * is part of a list or menu tool group. If a trigger is associated with an action by the same name
 * as the tool, a description of its keyboard shortcut for the appropriate platform will be
 * appended to the title if the tool is part of a bar tool group.
 *
 * @abstract
 * @static
 * @property {string}
 * @inheritable
 */
OO.ui.Tool.static.titleMessage = '';

/**
 * Tool can be automatically added to toolgroups.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
OO.ui.Tool.static.autoAdd = true;

/**
 * Check if this tool is compatible with given data.
 *
 * @method
 * @static
 * @inheritable
 * @param {Mixed} data Data to check
 * @returns {boolean} Tool can be used with data
 */
OO.ui.Tool.static.isCompatibleWith = function () {
	return false;
};

/* Methods */

/**
 * Handle the toolbar state being updated.
 *
 * This is an abstract method that must be overridden in a concrete subclass.
 *
 * @abstract
 * @method
 */
OO.ui.Tool.prototype.onUpdateState = function () {
	throw new Error(
		'OO.ui.Tool.onUpdateState not implemented in this subclass:' + this.constructor
	);
};

/**
 * Handle the tool being selected.
 *
 * This is an abstract method that must be overridden in a concrete subclass.
 *
 * @abstract
 * @method
 */
OO.ui.Tool.prototype.onSelect = function () {
	throw new Error(
		'OO.ui.Tool.onSelect not implemented in this subclass:' + this.constructor
	);
};

/**
 * Check if the button is active.
 *
 * @method
 * @param {boolean} Button is active
 */
OO.ui.Tool.prototype.isActive = function () {
	return this.active;
};

/**
 * Make the button appear active or inactive.
 *
 * @method
 * @param {boolean} state Make button appear active
 */
OO.ui.Tool.prototype.setActive = function ( state ) {
	this.active = !!state;
	if ( this.active ) {
		this.$.addClass( 'oo-ui-tool-active' );
	} else {
		this.$.removeClass( 'oo-ui-tool-active' );
	}
};

/**
 * Sets the tool title attribute in the DOM.
 *
 * @method
 * @param {string} [title] Title text, omit to remove title
 * @chainable
 */
OO.ui.Tool.prototype.setTitle = function ( title ) {
	if ( typeof title === 'string' && title.length ) {
		this.$.attr( 'title', title );
	} else {
		this.$.removeAttr( 'title' );
	}
	return this;
};

/**
 * Destroy tool.
 *
 * @method
 */
OO.ui.Tool.prototype.destroy = function () {
	this.toolbar.disconnect( this );
	this.$.remove();
};
