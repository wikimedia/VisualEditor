/*!
 * VisualEditor UserInterface CommandHelpDialog class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Dialog for listing all command keyboard shortcuts.
 *
 * @class
 * @extends OO.ui.ProcessDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.CommandHelpDialog = function VeUiCommandHelpDialog( config ) {
	// Parent constructor
	ve.ui.CommandHelpDialog.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.CommandHelpDialog, OO.ui.ProcessDialog );

/* Static Properties */

ve.ui.CommandHelpDialog.static.name = 'commandHelp';

ve.ui.CommandHelpDialog.static.size = 'larger';

ve.ui.CommandHelpDialog.static.title =
	OO.ui.deferMsg( 'visualeditor-dialog-command-help-title' );

ve.ui.CommandHelpDialog.static.actions = [
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-done' ),
		flags: 'safe'
	}
];

ve.ui.CommandHelpDialog.static.commandGroups = {
	textStyle: {
		title: 'visualeditor-shortcuts-text-style',
		commands: {
			bold: { trigger: 'bold', msg: 'visualeditor-annotationbutton-bold-tooltip' },
			italic: { trigger: 'italic', msg: 'visualeditor-annotationbutton-italic-tooltip' },
			link: { trigger: 'link', msg: 'visualeditor-annotationbutton-link-tooltip' },
			superscript: { trigger: 'superscript', msg: 'visualeditor-annotationbutton-superscript-tooltip' },
			subscript: { trigger: 'subscript', msg: 'visualeditor-annotationbutton-subscript-tooltip' },
			underline: { trigger: 'underline', msg: 'visualeditor-annotationbutton-underline-tooltip' },
			code: { trigger: 'code', msg: 'visualeditor-annotationbutton-code-tooltip' },
			strikethrough: { trigger: 'strikethrough', msg: 'visualeditor-annotationbutton-strikethrough-tooltip' },
			clear: { trigger: 'clear', msg: 'visualeditor-clearbutton-tooltip' }
		},
		promote: [ 'bold', 'italic', 'link' ],
		demote: [ 'clear' ]
	},
	clipboard: {
		title: 'visualeditor-shortcuts-clipboard',
		commands: {
			cut: {
				shortcuts: [ {
					mac: 'cmd+x',
					pc: 'ctrl+x'
				} ],
				msg: 'visualeditor-clipboard-cut'
			},
			copy: {
				shortcuts: [ {
					mac: 'cmd+c',
					pc: 'ctrl+c'
				} ],
				msg: 'visualeditor-clipboard-copy'
			},
			paste: {
				shortcuts: [ {
					mac: 'cmd+v',
					pc: 'ctrl+v'
				} ],
				msg: 'visualeditor-clipboard-paste'
			},
			pasteSpecial: { trigger: 'pasteSpecial', msg: 'visualeditor-clipboard-paste-special' }
		},
		promote: [],
		demote: []
	},
	formatting: {
		title: 'visualeditor-shortcuts-formatting',
		commands: {
			paragraph: { trigger: 'paragraph', msg: 'visualeditor-formatdropdown-format-paragraph' },
			heading: { shortcuts: [ 'ctrl+1-6' ], msg: 'visualeditor-formatdropdown-format-heading-label' },
			pre: { trigger: 'preformatted', msg: 'visualeditor-formatdropdown-format-preformatted' },
			blockquote: { trigger: 'blockquote', msg: 'visualeditor-formatdropdown-format-blockquote' },
			indentIn: { trigger: 'indent', msg: 'visualeditor-indentationbutton-indent-tooltip' },
			indentOut: { trigger: 'outdent', msg: 'visualeditor-indentationbutton-outdent-tooltip' },
			listBullet: { sequence: [ 'bulletStar' ], msg: 'visualeditor-listbutton-bullet-tooltip' },
			listNumber: { sequence: [ 'numberDot' ], msg: 'visualeditor-listbutton-number-tooltip' }
		},
		promote: [ 'paragraph', 'pre', 'blockquote' ],
		demote: []
	},
	history: {
		title: 'visualeditor-shortcuts-history',
		commands: {
			undo: { trigger: 'undo', msg: 'visualeditor-historybutton-undo-tooltip' },
			redo: { trigger: 'redo', msg: 'visualeditor-historybutton-redo-tooltip' }
		},
		promote: [ 'undo', 'redo' ],
		demote: []
	},
	other: {
		title: 'visualeditor-shortcuts-other',
		commands: {
			findAndReplace: { trigger: 'findAndReplace', msg: 'visualeditor-find-and-replace-title' },
			findNext: { trigger: 'findNext', msg: 'visualeditor-find-and-replace-next-button' },
			findPrevious: { trigger: 'findPrevious', msg: 'visualeditor-find-and-replace-previous-button' },
			selectAll: { trigger: 'selectAll', msg: 'visualeditor-content-select-all' },
			commandHelp: { trigger: 'commandHelp', msg: 'visualeditor-dialog-command-help-title' }
		},
		promote: [ 'findAndReplace', 'findNext', 'findPrevious' ],
		demote: [ 'commandHelp' ]
	}
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.CommandHelpDialog.prototype.getBodyHeight = function () {
	return Math.round( this.contentLayout.$element[ 0 ].scrollHeight );
};

/**
 * @inheritdoc
 */
ve.ui.CommandHelpDialog.prototype.initialize = function () {
	var i, j, jLen, k, kLen, triggerList, commands, shortcut, platform, platformKey,
		$list, $shortcut, commandGroups, sequence;

	// Parent method
	ve.ui.CommandHelpDialog.super.prototype.initialize.call( this );

	platform = ve.getSystemPlatform();
	platformKey = platform === 'mac' ? 'mac' : 'pc';
	commandGroups = ve.ui.CommandHelpDialog.static.commandGroups;

	this.contentLayout = new OO.ui.PanelLayout( {
		scrollable: true,
		padded: true,
		expanded: false
	} );
	this.$container = $( '<div>' ).addClass( 've-ui-commandHelpDialog-container' );

	for ( i in commandGroups ) {
		commands = ve.ui.CommandHelpDialog.static.sortedCommandsFromGroup( commandGroups[ i ] );
		$list = $( '<dl>' ).addClass( 've-ui-commandHelpDialog-list' );
		for ( j = 0, jLen = commands.length; j < jLen; j++ ) {
			if ( commands[ j ].trigger ) {
				triggerList = ve.ui.triggerRegistry.lookup( commands[ j ].trigger );
			} else {
				triggerList = [];
				if ( commands[ j ].shortcuts ) {
					for ( k = 0, kLen = commands[ j ].shortcuts.length; k < kLen; k++ ) {
						shortcut = commands[ j ].shortcuts[ k ];
						triggerList.push(
							new ve.ui.Trigger(
								ve.isPlainObject( shortcut ) ? shortcut[ platformKey ] : shortcut,
								true
							)
						);
					}
				}
			}
			$shortcut = $( '<dt>' );
			for ( k = 0, kLen = triggerList.length; k < kLen; k++ ) {
				$shortcut.append( $( '<kbd>' ).append(
					triggerList[ k ].getMessage( true ).map( ve.ui.CommandHelpDialog.static.buildKeyNode )
				).find( 'kbd + kbd' ).before( '+' ).end() );
			}
			if ( commands[ j ].sequence ) {
				for ( k = 0, kLen = commands[ j ].sequence.length; k < kLen; k++ ) {
					sequence = ve.ui.sequenceRegistry.lookup( commands[ j ].sequence[ k ] );
					if ( sequence ) {
						$shortcut.append( $( '<kbd class="ve-ui-commandHelpDialog-sequence">' )
							.attr( 'data-label', ve.msg( 'visualeditor-shortcuts-sequence-notice' ) )
							.append(
								sequence.getMessage( true ).map( ve.ui.CommandHelpDialog.static.buildKeyNode )
							)
						);
					}
				}
			}
			$list.append(
				$shortcut,
				$( '<dd>' ).text( ve.msg( commands[ j ].msg ) )
			);
		}
		this.$container.append(
			$( '<div>' )
				.addClass( 've-ui-commandHelpDialog-section' )
				.append(
					$( '<h3>' ).text( ve.msg( commandGroups[ i ].title ) ),
					$list
				)
		);
	}

	this.contentLayout.$element.append( this.$container );
	this.$body.append( this.contentLayout.$element );
};

/* Static methods */

/**
 * Wrap a key (as provided by a Trigger) in a node, for display
 *
 * @static
 * @return {jQuery} A kbd wrapping the key text
 */
ve.ui.CommandHelpDialog.static.buildKeyNode = function ( key ) {
	if ( key === ' ' ) {
		// Might need to expand this if other keys show up, but currently things like
		// the tab-character only come from Triggers and are pre-localized there into
		// "tab" anyway.
		key = 'space';
	}
	return $( '<kbd>' ).attr( 'data-key', key ).text( key );
};

/**
 * Register a command for display in the dialog
 *
 * @static
 * @param {string} category The dialog-category in which to display this
 * @param {string} commandName The key for the command; never displayed, but used in sorting
 * @param {Object} details The details about the command, used in display
 */
ve.ui.CommandHelpDialog.static.registerCommand = function ( category, commandName, details ) {
	var group = ve.ui.CommandHelpDialog.static.commandGroups[ category ];
	if ( !group.commands[ commandName ] ) {
		group.commands[ commandName ] = details;
		return;
	}
	if ( details.trigger ) {
		group.commands[ commandName ].trigger = details.trigger;
	}
	if ( details.shortcuts ) {
		group.commands[ commandName ].shortcuts = details.shortcuts;
	}
	if ( details.sequence ) {
		group.commands[ commandName ].sequence = ( group.commands[ commandName ].sequence || [] ).concat( details.sequence );
	}
	if ( details.promote ) {
		group.promote.push( commandName );
	} else if ( details.demote ) {
		group.demote.push( commandName );
	}
};

/**
 * Extract a properly sorted list of commands from a command-group
 *
 * @static
 * @param {Object} group Group of related commands
 * @return {string[]} List of commands
 */
ve.ui.CommandHelpDialog.static.sortedCommandsFromGroup = function ( group ) {
	var i,
		keys = Object.keys( group.commands ),
		used = {},
		auto = [],
		promoted = [],
		demoted = [];
	keys.sort();
	for ( i = 0; i < group.promote.length; i++ ) {
		promoted.push( group.commands[ group.promote[ i ] ] );
		used[ group.promote[ i ] ] = true;
	}
	for ( i = 0; i < group.demote.length; i++ ) {
		if ( used[ group.demote[ i ] ] ) {
			continue;
		}
		demoted.push( group.commands[ group.demote[ i ] ] );
		used[ group.demote[ i ] ] = true;
	}
	for ( i = 0; i < keys.length; i++ ) {
		if ( used[ keys[ i ] ] ) {
			continue;
		}
		auto.push( group.commands[ keys[ i ] ] );
	}
	return promoted.concat( auto, demoted );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.CommandHelpDialog );
