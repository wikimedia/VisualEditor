/*!
 * VisualEditor Editor class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * VisualEditor.
 *
 * @class
 *
 * @constructor
 */
ve.Editor = function VeEditor() {
	// Properties
	this.$overlay = $( '<div>' );
	this.commands = {};
	this.enabled = true;

	// Initialization
	this.$overlay
		.addClass( 've-editor-overlay' )
		.appendTo( $( 'body' ) );
};

/* Methods */

/**
 * Check if editing is enabled.
 *
 * @method
 * @returns {boolean} Editing is enabled
 */
ve.Editor.prototype.isEnabled = function () {
	return this.enabled;
};

/**
 * Get the context menu.
 *
 * @method
 * @returns {ve.ui.Context} Context user interface
 */
ve.Editor.prototype.getCommands = function () {
	return this.commands;
};

/**
 * Destroy the editor.
 *
 * @method
 */
ve.Editor.prototype.destroy = function () {
	this.$overlay.remove();
};

/**
 * Add all commands from initialization options.
 *
 * @method
 * @param {string[]|Object[]} commands List of symbolic names of commands in the command registry
 */
ve.Editor.prototype.addCommands = function ( commands ) {
	var i, len, command;

	for ( i = 0, len = commands.length; i < len; i++ ) {
		command = ve.ui.commandRegistry.lookup( commands[i] );
		if ( !command ) {
			throw new Error( 'No command registered by that name: ' + commands[i] );
		}
		this.addTriggers( [ve.ui.triggerRegistry.lookup( commands[i] )], command );
	}
};

/**
 * Add triggers to surface.
 *
 * @method
 * @param {ve.ui.Trigger[]} triggers Triggers to associate with command
 * @param {Object} command Command to trigger
 */
ve.Editor.prototype.addTriggers = function ( triggers, command ) {
	var i, len, trigger;

	for ( i = 0, len = triggers.length; i < len; i++ ) {
		// Normalize
		trigger = triggers[i].toString();
		// Validate
		if ( trigger.length === 0 ) {
			throw new Error( 'Incomplete trigger: ' + triggers[i] );
		}
		this.commands[trigger] = command.action;
	}
};
