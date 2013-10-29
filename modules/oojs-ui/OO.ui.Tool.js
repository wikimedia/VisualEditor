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
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
OO.ui.Tool = function OoUiTool( toolGroup, config ) {
	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.IconedElement.call( this, this.$$( '<span>' ) );
	OO.ui.LabeledElement.call( this, this.$$( '<span>' ) );

	// Properties
	this.toolGroup = toolGroup;
	this.toolbar = this.toolGroup.getToolbar();
	this.active = false;
	this.$link = this.$$( '<a>' );

	// Events
	this.toolbar.connect( this, { 'updateState': 'onUpdateState' } );

	// Initialization
	this.$link
		.addClass( 'oo-ui-tool-link' )
		.append( this.$icon, this.$label );
	this.$
		.data( 'oo-ui-tool', this )
		.addClass(
			'oo-ui-tool ' + 'oo-ui-tool-name-' +
			this.constructor.static.name.replace( /^([^\/]+)\/([^\/]+).*$/, '$1-$2' )
		)
		.append( this.$link );
	this.setIcon( this.constructor.static.icon );
	this.updateLabel();
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

OO.ui.Tool.static.tagName = 'span';

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
 * Tool can be automatically added to tool groups.
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
 * Get the tool's symbolic name.
 *
 * @method
 * @returns {string} Symbolic name of tool
 */
OO.ui.Tool.prototype.getName = function () {
	return this.constructor.static.name;
};

/**
 * Update the label.
 *
 * @method
 */
OO.ui.Tool.prototype.updateLabel = function () {
	var titleMessage = this.constructor.static.titleMessage,
		labelTooltips = this.toolGroup.constructor.static.labelTooltips,
		accelTooltips = this.toolGroup.constructor.static.accelTooltips,
		title = titleMessage ? OO.ui.msg( titleMessage ) : '',
		accel = this.toolbar.getToolAccelerator( this.constructor.static.name ),
		tooltipParts = [];

	this.setLabel(
		this.$$( '<span>' )
			.addClass( 'oo-ui-tool-title' )
			.text( title )
			.add(
				this.$$( '<span>' )
					.addClass( 'oo-ui-tool-accel' )
					.text( accel )
			)
	);

	if ( labelTooltips && typeof title === 'string' && title.length ) {
		tooltipParts.push( title );
	}
	if ( accelTooltips && typeof accel === 'string' && accel.length ) {
		tooltipParts.push( accel );
	}
	if ( tooltipParts.length ) {
		this.$link.attr( 'title', tooltipParts.join( ' ' ) );
	} else {
		this.$link.removeAttr( 'title' );
	}
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
