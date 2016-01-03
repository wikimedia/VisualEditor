/*!
 * VisualEditor CommandHelpRegistry class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
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
 * @param {Function|string} details.label Label describing the command. String or deferred message function.
 * @param {string} [details.trigger] Symbolic name of trigger this for this command
 * @param {string} [details.shortcut] Keyboard shortcut if this is not a real trigger (e.g. copy/paste)
 * @param {string[]} [details.sequences] Symbolic names of sequences, if this is a sequence, not a trigger
 */
ve.ui.CommandHelpRegistry.prototype.register = function ( groupName, commandName, details ) {
	var existingCommand;

	existingCommand = this.registry[ commandName ];
	if ( existingCommand ) {
		// This is _almost_ just doing extend(existingCommand, details)
		// But some values need special handling, so we can't do that.
		if ( details.label ) {
			existingCommand.label = details.label;
		}
		if ( details.trigger ) {
			existingCommand.trigger = details.trigger;
		}
		if ( details.shortcuts ) {
			existingCommand.shortcuts = details.shortcuts;
		}
		if ( details.sequences ) {
			existingCommand.sequences = ( existingCommand.sequences || [] ).concat( details.sequences );
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
ve.ui.commandHelpRegistry.register( 'textStyle', 'bold', { trigger: 'bold', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-bold-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'italic', { trigger: 'italic', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-italic-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'link', { trigger: 'link', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-link-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'superscript', { trigger: 'superscript', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-superscript-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'subscript', { trigger: 'subscript', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-subscript-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'underline', { trigger: 'underline', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-underline-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'code', { trigger: 'code', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-code-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'strikethrough', { trigger: 'strikethrough', label: OO.ui.deferMsg( 'visualeditor-annotationbutton-strikethrough-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'textStyle', 'clear', { trigger: 'clear', label: OO.ui.deferMsg( 'visualeditor-clearbutton-tooltip' ) } );

// Clipboard
ve.ui.commandHelpRegistry.register( 'clipboard', 'cut', {
	shortcuts: [ {
		mac: 'cmd+x',
		pc: 'ctrl+x'
	} ],
	label: OO.ui.deferMsg( 'visualeditor-clipboard-cut' )
} );
ve.ui.commandHelpRegistry.register( 'clipboard', 'copy', {
	shortcuts: [ {
		mac: 'cmd+c',
		pc: 'ctrl+c'
	} ],
	label: OO.ui.deferMsg( 'visualeditor-clipboard-copy' )
} );
ve.ui.commandHelpRegistry.register( 'clipboard', 'paste', {
	shortcuts: [ {
		mac: 'cmd+v',
		pc: 'ctrl+v'
	} ],
	label: OO.ui.deferMsg( 'visualeditor-clipboard-paste' )
} );
ve.ui.commandHelpRegistry.register( 'clipboard', 'pasteSpecial', { trigger: 'pasteSpecial', label: OO.ui.deferMsg( 'visualeditor-clipboard-paste-special' ) } );

// Formatting
ve.ui.commandHelpRegistry.register( 'formatting', 'paragraph', { trigger: 'paragraph', label: OO.ui.deferMsg( 'visualeditor-formatdropdown-format-paragraph' ) } );
ve.ui.commandHelpRegistry.register( 'formatting', 'heading', { shortcuts: [ 'ctrl+1-6' ], label: OO.ui.deferMsg( 'visualeditor-formatdropdown-format-heading-label' ) } );
ve.ui.commandHelpRegistry.register( 'formatting', 'pre', { trigger: 'preformatted', label: OO.ui.deferMsg( 'visualeditor-formatdropdown-format-preformatted' ) } );
ve.ui.commandHelpRegistry.register( 'formatting', 'blockquote', { trigger: 'blockquote', label: OO.ui.deferMsg( 'visualeditor-formatdropdown-format-blockquote' ) } );
ve.ui.commandHelpRegistry.register( 'formatting', 'indentIn', { trigger: 'indent', label: OO.ui.deferMsg( 'visualeditor-indentationbutton-indent-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'formatting', 'indentOut', { trigger: 'outdent', label: OO.ui.deferMsg( 'visualeditor-indentationbutton-outdent-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'formatting', 'listBullet', { sequences: [ 'bulletStar' ], label: OO.ui.deferMsg( 'visualeditor-listbutton-bullet-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'formatting', 'listNumber', { sequences: [ 'numberDot' ], label: OO.ui.deferMsg( 'visualeditor-listbutton-number-tooltip' ) } );

// History
ve.ui.commandHelpRegistry.register( 'history', 'undo', { trigger: 'undo', label: OO.ui.deferMsg( 'visualeditor-historybutton-undo-tooltip' ) } );
ve.ui.commandHelpRegistry.register( 'history', 'redo', { trigger: 'redo', label: OO.ui.deferMsg( 'visualeditor-historybutton-redo-tooltip' ) } );

// Other
ve.ui.commandHelpRegistry.register( 'other', 'findAndReplace', { trigger: 'findAndReplace', label: OO.ui.deferMsg( 'visualeditor-find-and-replace-title' ) } );
ve.ui.commandHelpRegistry.register( 'other', 'findNext', { trigger: 'findNext', label: OO.ui.deferMsg( 'visualeditor-find-and-replace-next-button' ) } );
ve.ui.commandHelpRegistry.register( 'other', 'findPrevious', { trigger: 'findPrevious', label: OO.ui.deferMsg( 'visualeditor-find-and-replace-previous-button' ) } );
ve.ui.commandHelpRegistry.register( 'other', 'selectAll', { trigger: 'selectAll', label: OO.ui.deferMsg( 'visualeditor-content-select-all' ) } );
ve.ui.commandHelpRegistry.register( 'other', 'commandHelp', { trigger: 'commandHelp', label: OO.ui.deferMsg( 'visualeditor-dialog-command-help-title' ) } );
