/*!
 * VisualEditor UserInterface Tool classes.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * UserInterface tool.
 *
 * @class
 * @abstract
 * @extends OO.ui.Tool
 *
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.Tool = function VeUiTool( toolGroup, config ) {
	// Parent constructor
	OO.ui.Tool.call( this, toolGroup, config );

	// Disable initially
	this.setDisabled( true );
};

/* Inheritance */

OO.inheritClass( ve.ui.Tool, OO.ui.Tool );

/* Static Properties */

/**
 * Command to execute when tool is selected.
 *
 * @static
 * @property {string|null}
 * @inheritable
 */
ve.ui.Tool.static.commandName = null;

/**
 * Deactivate tool after it's been selected.
 *
 * Use this for tools which don't display as active when relevant content is selected, such as
 * insertion-only tools.
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
ve.ui.Tool.static.deactivateOnSelect = true;

/**
 * If this tool is used to create a ve.ui.ToolContextItem, should that item be embeddable
 *
 * @static
 * @property {boolean}
 * @inheritable
 */
ve.ui.Tool.static.makesEmbeddableContextItem = true;

/**
 * Get the symbolic command name for this tool.
 *
 * @static
 * @return {string|null}
 */
ve.ui.Tool.static.getCommandName = function () {
	return this.commandName;
};

/**
 * Get the command for this tool in a given surface context
 *
 * @static
 * @param {ve.ui.Surface} surface Surface
 * @return {ve.ui.Command|null|undefined} Undefined means command not found, null means no command set
 */
ve.ui.Tool.static.getCommand = function ( surface ) {
	var commandName = this.getCommandName();
	if ( commandName === null ) {
		return null;
	}
	return surface.commandRegistry.lookup( commandName );
};

/* Methods */

/**
 * Handle the toolbar state being updated.
 *
 * @method
 * @param {ve.dm.SurfaceFragment|null} fragment Surface fragment
 * @param {Object|null} direction Context direction with 'inline' & 'block' properties
 */
ve.ui.Tool.prototype.onUpdateState = function ( fragment ) {
	var command = this.getCommand();
	if ( command !== null ) {
		this.setDisabled( !command || !fragment || !command.isExecutable( fragment ) );
	}
};

/**
 * @inheritdoc
 */
ve.ui.Tool.prototype.onSelect = function () {
	var command = this.getCommand(),
		surface = this.toolbar.getSurface();
	if ( command instanceof ve.ui.Command ) {
		if ( surface.context.inspector ) {
			surface.context.inspector.close().done( function () {
				command.execute( surface );
			} );
		} else {
			command.execute( surface );
		}
	}
	if ( this.constructor.static.deactivateOnSelect ) {
		// Even if the promise route was taken above, it's fine to call setActive here; it
		// just disables the button, stopping double-clicks and making it feel more responsive
		// if the promise is slow.
		this.setActive( false );
	}
};

/**
 * Get the command for this tool.
 *
 * @return {ve.ui.Command|null|undefined} Undefined means command not found, null means no command set
 */
ve.ui.Tool.prototype.getCommand = function () {
	return this.constructor.static.getCommand( this.toolbar.getSurface() );
};
