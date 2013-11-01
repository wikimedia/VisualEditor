/*!
 * ObjectOriented UserInterface ToolGroup class.
 *
 * @copyright 2011-2013 OOJS Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Collection of tools.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixins OO.ui.GroupElement
 *
 * Tools can be specified in the following ways:
 *  - A specific tool: `{ 'name': 'tool-name' }` or `'tool-name'`
 *  - All tools in a group: `{ 'group': 'group-name' }`
 *  - All tools: `'*'`
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 * @cfg {Array|string} [include=[]] List of tools to include
 * @cfg {Array|string} [exclude=[]] List of tools to exclude
 * @cfg {Array|string} [promote=[]] List of tools to promote to the beginning
 * @cfg {Array|string} [demote=[]] List of tools to demote to the end
 */
OO.ui.ToolGroup = function OoUiToolGroup( toolbar, config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Widget.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, this.$$( '<div>' ) );

	// Properties
	this.toolbar = toolbar;
	this.tools = {};
	this.pressed = null;
	this.include = config.include || [];
	this.exclude = config.exclude || [];
	this.promote = config.promote || [];
	this.demote = config.demote || [];
	this.onCapturedMouseUpHandler = OO.ui.bind( this.onCapturedMouseUp, this );

	// Events
	this.$.on( {
		'mousedown': OO.ui.bind( this.onMouseDown, this ),
		'mouseup': OO.ui.bind( this.onMouseUp, this ),
		'mouseover': OO.ui.bind( this.onMouseOver, this ),
		'mouseout': OO.ui.bind( this.onMouseOut, this )
	} );
	this.toolbar.getToolFactory().connect( this, { 'register': 'onToolFactoryRegister' } );

	// Initialization
	this.$group.addClass( 'oo-ui-toolGroup-tools' );
	this.$
		.addClass( 'oo-ui-toolGroup' )
		.append( this.$group );
	this.populate();
};

/* Inheritance */

OO.inheritClass( OO.ui.ToolGroup, OO.ui.Widget );

OO.mixinClass( OO.ui.ToolGroup, OO.ui.GroupElement );

/* Events */

/**
 * @event update
 */

/* Static Properties */

/**
 * Show labels in tooltips.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
OO.ui.ToolGroup.static.labelTooltips = false;

/**
 * Show acceleration labels in tooltips.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
OO.ui.ToolGroup.static.accelTooltips = false;

/* Methods */

/**
 * Handle mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
OO.ui.ToolGroup.prototype.onMouseDown = function ( e ) {
	if ( !this.disabled && e.which === 1 ) {
		this.pressed = this.getTargetTool( e );
		if ( this.pressed ) {
			this.pressed.setActive( true );
			this.getElementDocument().addEventListener(
				'mouseup', this.onCapturedMouseUpHandler, true
			);
			return false;
		}
	}
};

/**
 * Handle captured mouse up events.
 *
 * @method
 * @param {Event} e Mouse up event
 */
OO.ui.ToolGroup.prototype.onCapturedMouseUp = function ( e ) {
	this.getElementDocument().removeEventListener( 'mouseup', this.onCapturedMouseUpHandler, true );
	// onMouseUp may be called a second time, depending on where the mouse is when the button is
	// released, but since `this.pressed` will no longer be true, the second call will be ignored.
	this.onMouseUp( e );
};

/**
 * Handle mouse up events.
 *
 * @method
 * @param {jQuery.Event} e Mouse up event
 */
OO.ui.ToolGroup.prototype.onMouseUp = function ( e ) {
	var tool = this.getTargetTool( e );

	if ( !this.disabled && e.which === 1 && this.pressed && this.pressed === tool ) {
		this.pressed.onSelect();
	}

	this.pressed = null;
	return false;
};

/**
 * Handle mouse over events.
 *
 * @method
 * @param {jQuery.Event} e Mouse over event
 */
OO.ui.ToolGroup.prototype.onMouseOver = function ( e ) {
	var tool = this.getTargetTool( e );

	if ( this.pressed && this.pressed === tool ) {
		this.pressed.setActive( true );
	}
};

/**
 * Handle mouse out events.
 *
 * @method
 * @param {jQuery.Event} e Mouse out event
 */
OO.ui.ToolGroup.prototype.onMouseOut = function ( e ) {
	var tool = this.getTargetTool( e );

	if ( this.pressed && this.pressed === tool ) {
		this.pressed.setActive( false );
	}
};

/**
 * Get the closest tool to a jQuery.Event.
 *
 * Only tool links are considered, which prevents other elements in the tool such as popups from
 * triggering tool group interactions.
 *
 * @method
 * @private
 * @param {jQuery.Event} e
 * @returns {OO.ui.Tool|null} Tool, `null` if none was found
 */
OO.ui.ToolGroup.prototype.getTargetTool = function ( e ) {
	var $item = $( e.target ).closest( '.oo-ui-tool-link' );
	if ( $item.length ) {
		return $item.parent().data( 'oo-ui-tool' );
	}
	return null;
};

/**
 * Handle tool registry register events.
 *
 * If a tool is registered after the group is created, we must repopulate the list to account for:
 * - a tool being added that may be included
 * - a tool already included being overridden
 *
 * @param {string} name Symbolic name of tool
 */
OO.ui.ToolGroup.prototype.onToolFactoryRegister = function () {
	this.populate();
};

/**
 * Get the toolbar this group is in.
 *
 * @return {OO.ui.Toolbar} Toolbar of group
 */
OO.ui.ToolGroup.prototype.getToolbar = function () {
	return this.toolbar;
};

/**
 * Add and remove tools based on configuration.
 *
 * @method
 */
OO.ui.ToolGroup.prototype.populate = function () {
	var i, len, name, tool,
		names = {},
		add = [],
		remove = [],
		list = this.toolbar.getToolFactory().getTools(
			this.include, this.exclude, this.promote, this.demote
		);

	// Build a list of needed tools
	for ( i = 0, len = list.length; i < len; i++ ) {
		name = list[i];
		if ( this.toolbar.isToolAvailable( name ) ) {
			tool = this.tools[name];
			if ( !tool ) {
				// Auto-initialize tools on first use
				this.tools[name] = tool =
					this.toolbar.getToolFactory().create( name, this );
				tool.updateLabel();
			}
			this.toolbar.reserveTool( tool );
			add.push( tool );
			names[name] = true;
		}
	}
	// Remove tools that are no longer needed
	for ( name in this.tools ) {
		if ( !names[name] ) {
			this.tools[name].destroy();
			this.toolbar.releaseTool( this.tools[name] );
			remove.push( this.tools[name] );
			delete this.tools[name];
		}
	}
	if ( remove.length ) {
		this.removeItems( remove );
	}
	// Update emptiness state
	if ( add.length ) {
		this.$.removeClass( 'oo-ui-toolGroup-empty' );
	} else {
		this.$.addClass( 'oo-ui-toolGroup-empty' );
	}
	// Re-add tools (moving existing ones to new locations)
	this.addItems( add );
};

/**
 * Destroy tool group.
 *
 * @method
 */
OO.ui.ToolGroup.prototype.destroy = function () {
	var name;

	this.clearItems();
	this.toolbar.getToolFactory().disconnect( this );
	for ( name in this.tools ) {
		this.toolbar.releaseTool( this.tools[name] );
		this.tools[name].disconnect( this ).destroy();
		delete this.tools[name];
	}
	this.$.remove();
};
