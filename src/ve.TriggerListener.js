/*!
 * VisualEditor UserInterface TriggerListener class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Trigger listener
 *
 * @class
 *
 * @constructor
 * @param {string[]} commands Commands to listen to triggers for
 * @param {ve.ui.CommandRegistry} commandRegistry Command registry to get commands from
 */
ve.TriggerListener = function VeTriggerListener( commands, commandRegistry ) {
	// Properties
	this.commands = commands;
	this.commandsByTrigger = {};
	this.triggers = {};

	this.commands.forEach( ( command ) => {
		const triggers = ve.ui.triggerRegistry.lookup( command );
		if ( triggers ) {
			triggers.forEach( ( trigger ) => {
				this.commandsByTrigger[ trigger.toString() ] = commandRegistry.lookup( command );
			} );
			this.triggers[ command ] = triggers;
		}
	} );
};

/* Inheritance */

OO.initClass( ve.TriggerListener );

/* Methods */

/**
 * Get list of commands.
 *
 * @return {string[]} Commands
 */
ve.TriggerListener.prototype.getCommands = function () {
	return this.commands;
};

/**
 * Get command associated with trigger string.
 *
 * @param {string} trigger
 * @return {ve.ui.Command|undefined}
 */
ve.TriggerListener.prototype.getCommandByTrigger = function ( trigger ) {
	return this.commandsByTrigger[ trigger ];
};

/**
 * Get triggers for a specified name.
 *
 * @param {string} name Trigger name
 * @return {ve.ui.Trigger[]|undefined}
 */
ve.TriggerListener.prototype.getTriggers = function ( name ) {
	return this.triggers[ name ];
};
