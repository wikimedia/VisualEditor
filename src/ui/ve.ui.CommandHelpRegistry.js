/*!
 * VisualEditor CommandHelpRegistry class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Command help registry.
 *
 * @class
 * @extends OO.Registry
 * @constructor
 */
ve.ui.CommandHelpRegistry = function VeUiCommandHelpRegistry() {
	// Parent constructor
	OO.Registry.call( this );
};

/* Inheritance */

OO.inheritClass( ve.ui.CommandHelpRegistry, OO.Registry );

/* Methods */

/**
 * Register a command for display in the dialog.
 *
 * @static
 * @param {string} groupName Dialog-category in which to display this
 * @param {string} commandName Name of the command
 * @param {Object} details Details about the command
 */
ve.ui.CommandHelpRegistry.prototype.register = function ( groupName, commandName, details ) {
	var existingCommand;

	existingCommand = this.registry[ commandName ];
	if ( existingCommand ) {
		// This is _almost_ just doing extend(existingCommand, details)
		// But some values need special handling, so we can't do that.
		if ( details.msg ) {
			existingCommand.msg = details.msg;
		}
		if ( details.trigger ) {
			existingCommand.trigger = details.trigger;
		}
		if ( details.shortcuts ) {
			existingCommand.shortcuts = details.shortcuts;
		}
		if ( details.sequence ) {
			existingCommand.sequence = ( existingCommand.sequence || [] ).concat( details.sequence );
		}
		details = existingCommand;
	}

	details.group = groupName;

	OO.Registry.prototype.register.call( this, commandName, details );
};

/**
 * Get data for a given group of commands.
 *
 * @param {string} groupName Group name
 * @return {Object} Commands associated with the group
 */
ve.ui.CommandHelpRegistry.prototype.lookupByGroup = function ( groupName ) {
	var commandName, matches = {};
	for ( commandName in this.registry ) {
		if ( groupName === this.registry[ commandName ].group ) {
			matches[ commandName ] = this.registry[ commandName ];
		}
	}
	return matches;
};

/* Initialization */

ve.ui.commandHelpRegistry = new ve.ui.CommandHelpRegistry();

/* Registrations */

// Text styles
ve.ui.commandHelpRegistry.register( 'textStyle', 'bold', { trigger: 'bold', msg: 'visualeditor-annotationbutton-bold-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'italic', { trigger: 'italic', msg: 'visualeditor-annotationbutton-italic-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'link', { trigger: 'link', msg: 'visualeditor-annotationbutton-link-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'superscript', { trigger: 'superscript', msg: 'visualeditor-annotationbutton-superscript-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'subscript', { trigger: 'subscript', msg: 'visualeditor-annotationbutton-subscript-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'underline', { trigger: 'underline', msg: 'visualeditor-annotationbutton-underline-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'code', { trigger: 'code', msg: 'visualeditor-annotationbutton-code-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'strikethrough', { trigger: 'strikethrough', msg: 'visualeditor-annotationbutton-strikethrough-tooltip' } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'clear', { trigger: 'clear', msg: 'visualeditor-clearbutton-tooltip' } );

// Clipboard
ve.ui.commandHelpRegistry.register( 'clipboard', 'cut', {
	shortcuts: [ {
		mac: 'cmd+x',
		pc: 'ctrl+x'
	} ],
	msg: 'visualeditor-clipboard-cut'
} );
ve.ui.commandHelpRegistry.register( 'clipboard', 'copy', {
	shortcuts: [ {
		mac: 'cmd+c',
		pc: 'ctrl+c'
	} ],
	msg: 'visualeditor-clipboard-copy'
} );
ve.ui.commandHelpRegistry.register( 'clipboard', 'paste', {
	shortcuts: [ {
		mac: 'cmd+v',
		pc: 'ctrl+v'
	} ],
	msg: 'visualeditor-clipboard-paste'
} );
ve.ui.commandHelpRegistry.register( 'clipboard', 'pasteSpecial', { trigger: 'pasteSpecial', msg: 'visualeditor-clipboard-paste-special' } );

// Formatting
ve.ui.commandHelpRegistry.register( 'formatting', 'paragraph', { trigger: 'paragraph', msg: 'visualeditor-formatdropdown-format-paragraph' } );
ve.ui.commandHelpRegistry.register( 'formatting', 'heading', { shortcuts: [ 'ctrl+1-6' ], msg: 'visualeditor-formatdropdown-format-heading-label' } );
ve.ui.commandHelpRegistry.register( 'formatting', 'pre', { trigger: 'preformatted', msg: 'visualeditor-formatdropdown-format-preformatted' } );
ve.ui.commandHelpRegistry.register( 'formatting', 'blockquote', { trigger: 'blockquote', msg: 'visualeditor-formatdropdown-format-blockquote' } );
ve.ui.commandHelpRegistry.register( 'formatting', 'indentIn', { trigger: 'indent', msg: 'visualeditor-indentationbutton-indent-tooltip' } );
ve.ui.commandHelpRegistry.register( 'formatting', 'indentOut', { trigger: 'outdent', msg: 'visualeditor-indentationbutton-outdent-tooltip' } );
ve.ui.commandHelpRegistry.register( 'formatting', 'listBullet', { sequence: [ 'bulletStar' ], msg: 'visualeditor-listbutton-bullet-tooltip' } );
ve.ui.commandHelpRegistry.register( 'formatting', 'listNumber', { sequence: [ 'numberDot' ], msg: 'visualeditor-listbutton-number-tooltip' } );

// History
ve.ui.commandHelpRegistry.register( 'history', 'undo', { trigger: 'undo', msg: 'visualeditor-historybutton-undo-tooltip' } );
ve.ui.commandHelpRegistry.register( 'history', 'redo', { trigger: 'redo', msg: 'visualeditor-historybutton-redo-tooltip' } );

// Other
ve.ui.commandHelpRegistry.register( 'other', 'findAndReplace', { trigger: 'findAndReplace', msg: 'visualeditor-find-and-replace-title' } );
ve.ui.commandHelpRegistry.register( 'other', 'findNext', { trigger: 'findNext', msg: 'visualeditor-find-and-replace-next-button' } );
ve.ui.commandHelpRegistry.register( 'other', 'findPrevious', { trigger: 'findPrevious', msg: 'visualeditor-find-and-replace-previous-button' } );
ve.ui.commandHelpRegistry.register( 'other', 'selectAll', { trigger: 'selectAll', msg: 'visualeditor-content-select-all' } );
ve.ui.commandHelpRegistry.register( 'other', 'commandHelp', { trigger: 'commandHelp', msg: 'visualeditor-dialog-command-help-title' } );
