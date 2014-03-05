/*!
 * VisualEditor UserInterface CommandHelpDialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog listing all command keyboard shortcuts.
 *
 * @class
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.CommandHelpDialog = function VeUiCommandHelpDialog( windowSet, config ) {
	// Configuration initialization
	config = ve.extendObject( { 'footless': true }, config );

	// Parent constructor
	ve.ui.Dialog.call( this, windowSet, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.CommandHelpDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.CommandHelpDialog.static.name = 'commandHelp';

ve.ui.CommandHelpDialog.static.title =
	OO.ui.deferMsg( 'visualeditor-dialog-command-help-title' );

ve.ui.CommandHelpDialog.static.icon = 'help';

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.CommandHelpDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	var i, j, jLen, trigger, commands, $list,
		platform = ve.init.platform.getSystemPlatform(),
		platformKey = platform === 'mac' ? 'mac' : 'pc',
		commandGroups = this.constructor.static.getCommandGroups(),
		contentLayout = new OO.ui.PanelLayout( {
			'$': this.$,
			'scrollable': true,
			'padded': true
		} ),
		$container = this.$( '<div>' ).addClass( 've-ui-commandHelpDialog-container' );

	for ( i in commandGroups ) {
		commands = commandGroups[i].commands;
		$list = this.$( '<dl>' ).addClass( 've-ui-commandHelpDialog-list' );
		for ( j = 0, jLen = commands.length; j < jLen; j++ ) {
			if ( commands[j].name ) {
				trigger = ve.ui.triggerRegistry.lookup( commands[j].name );
			} else {
				trigger = new ve.ui.Trigger(
					ve.isPlainObject( commands[j].shortcut ) ? commands[j].shortcut[platformKey] : commands[j].shortcut,
					true
				);
			}
			$list.append(
				this.$( '<dt>' ).text( trigger.getMessage().replace( /\+/g, ' + ' ) ),
				this.$( '<dd>' ).text( ve.msg( commands[j].msg ) )
			);
		}
		$container.append(
			this.$( '<div>' )
				.addClass( 've-ui-commandHelpDialog-section' )
				.append(
					this.$( '<h3>' ).text( ve.msg( commandGroups[i].title ) ),
					$list
				)
		);
	}

	contentLayout.$element.append( $container );
	this.$body.append( contentLayout.$element );
};

/* Static methods */

/**
 * Get the list of commands, grouped by type
 *
 * @static
 * @returns {Object} Object containing command groups, consiste of a title message and array of commands
 */
ve.ui.CommandHelpDialog.static.getCommandGroups = function () {
	return {
		'textStyle': {
			'title': 'visualeditor-shortcuts-text-style',
			'commands': [
				{ 'name': 'bold', 'msg': 'visualeditor-annotationbutton-bold-tooltip' },
				{ 'name': 'italic', 'msg': 'visualeditor-annotationbutton-italic-tooltip' },
				{ 'name': 'link', 'msg': 'visualeditor-annotationbutton-link-tooltip' },
				{ 'name': 'subscript', 'msg': 'visualeditor-annotationbutton-subscript-tooltip' },
				{ 'name': 'superscript', 'msg': 'visualeditor-annotationbutton-superscript-tooltip' },
				{ 'name': 'underline', 'msg': 'visualeditor-annotationbutton-underline-tooltip' },
				{ 'name': 'clear', 'msg': 'visualeditor-clearbutton-tooltip' }
			]
		},
		'formatting': {
			'title': 'visualeditor-shortcuts-formatting',
			'commands': [
				{ 'name': 'paragraph', 'msg': 'visualeditor-formatdropdown-format-paragraph' },
				{
					'shortcut': {
						'mac': 'cmd+(1-6)',
						'pc': 'ctrl+(1-6)'
					},
					'msg': 'visualeditor-formatdropdown-format-heading-label'
				},
				{ 'name': 'preformatted', 'msg': 'visualeditor-formatdropdown-format-preformatted' },
				{ 'name': 'indent', 'msg': 'visualeditor-indentationbutton-indent-tooltip' },
				{ 'name': 'outdent', 'msg': 'visualeditor-indentationbutton-outdent-tooltip' }
			]
		},
		'history': {
			'title': 'visualeditor-shortcuts-history',
			'commands': [
				{ 'name': 'undo', 'msg': 'visualeditor-historybutton-undo-tooltip' },
				{ 'name': 'redo', 'msg': 'visualeditor-historybutton-redo-tooltip' }
			]
		},
		'clipboard': {
			'title': 'visualeditor-shortcuts-clipboard',
			'commands': [
				{
					'shortcut': {
						'mac': 'cmd+x',
						'pc': 'ctrl+x'
					},
					'msg': 'visualeditor-clipboard-cut'
				},
				{
					'shortcut': {
						'mac': 'cmd+c',
						'pc': 'ctrl+c'
					},
					'msg': 'visualeditor-clipboard-copy'
				},
				{
					'shortcut': {
						'mac': 'cmd+v',
						'pc': 'ctrl+v'
					},
					'msg': 'visualeditor-clipboard-paste'
				},
				{ 'name': 'pasteSpecial', 'msg': 'visualeditor-clipboard-paste-special' }
			]
		},
		'other': {
			'title': 'visualeditor-shortcuts-other',
			'commands': [
				{ 'name': 'commandHelp', 'msg': 'visualeditor-dialog-command-help-title' }
			]
		}
	};
};

/* Registration */

ve.ui.dialogFactory.register( ve.ui.CommandHelpDialog );
