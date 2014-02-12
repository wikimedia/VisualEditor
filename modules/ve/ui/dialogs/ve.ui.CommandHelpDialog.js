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

	var i, iLen, j, jLen, shortcut, commands,
		$list,
		commandGroups = [
			{
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
			{
				'title': 'visualeditor-shortcuts-formatting',
				'commands': [
					{ 'name': 'paragraph', 'msg': 'visualeditor-formatdropdown-format-paragraph' },
					{ 'shortcut': 'CTRL+(1-6)', 'msg': 'visualeditor-formatdropdown-format-heading-label' },
					{ 'name': 'preformatted', 'msg': 'visualeditor-formatdropdown-format-preformatted' },
					{ 'name': 'indent', 'msg': 'visualeditor-indentationbutton-indent-tooltip' },
					{ 'name': 'outdent', 'msg': 'visualeditor-indentationbutton-outdent-tooltip' }
				]
			},
			{
				'title': 'visualeditor-shortcuts-history',
				'commands': [
					{ 'name': 'undo', 'msg': 'visualeditor-historybutton-undo-tooltip' },
					{ 'name': 'redo', 'msg': 'visualeditor-historybutton-redo-tooltip' }
				]
			},
			{
				'title': 'visualeditor-shortcuts-clipboard',
				'commands': [
					{ 'shortcut': 'CTRL+X', 'msg': 'visualeditor-clipboard-cut' },
					{ 'shortcut': 'CTRL+C', 'msg': 'visualeditor-clipboard-copy' },
					{ 'shortcut': 'CTRL+V', 'msg': 'visualeditor-clipboard-paste' },
					{ 'name': 'pasteSpecial', 'msg': 'visualeditor-clipboard-paste-special' }
				]
			},
			{
				'title': 'visualeditor-shortcuts-other',
				'commands': [
					{ 'name': 'commandHelp', 'msg': 'visualeditor-dialog-command-help-title' }
				]
			},
		],
		$container = this.$( '<div>' ).addClass( 've-ui-commandHelpDialog-container' ),
		triggers = this.surface.getTriggers();

	for ( i = 0, iLen = commandGroups.length; i < iLen; i++ ) {
		commands = commandGroups[i].commands;
		$list = this.$( '<dl>' ).addClass( 've-ui-commandHelpDialog-list' );
		for ( j = 0, jLen = commands.length; j < jLen; j++ ) {
			shortcut = commands[j].shortcut ? commands[j].shortcut : triggers[commands[j].name].getMessage();
			$list.append(
				this.$( '<dt>' ).text( shortcut.replace( /\+/g, ' + ' ) ),
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

	this.$body.append( $container );
};

/* Registration */

ve.ui.dialogFactory.register( ve.ui.CommandHelpDialog );
