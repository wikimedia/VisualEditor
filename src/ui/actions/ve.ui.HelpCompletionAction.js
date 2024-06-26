/*!
 * VisualEditor UserInterface ve.ui.HelpCompletionAction class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * HelpCompletionAction action.
 *
 * Controls autocompletion of anything from the help panel
 *
 * @class
 * @extends ve.ui.CompletionAction
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 * @param {string} [source]
 */
ve.ui.HelpCompletionAction = function ( surface ) {
	// Parent constructor
	ve.ui.HelpCompletionAction.super.apply( this, arguments );

	this.toolbar = surface.target.getToolbar();
	this.tools = this.toolbar.tools;
	this.toolNames = Object.keys( this.tools ).filter( ( toolName ) => {
		const tool = this.tools[ toolName ];
		return tool &&
			// No point in going in circles
			!( tool instanceof ve.ui.HelpCompletionTool ) &&
			// Ignore tool groups
			!( tool instanceof OO.ui.ToolGroupTool ) &&
			!( tool instanceof OO.ui.PopupTool );
	} );
	// Push the "format" group to the bottom because it's rarely-needed
	this.toolNames.sort( ( a, b ) => {
		const aGroup = this.tools[ a ].constructor.static.group;
		const bGroup = this.tools[ b ].constructor.static.group;
		if ( aGroup === bGroup ) {
			// preserve order
			return 0;
		}
		if ( aGroup === 'format' ) {
			return 1;
		}
		if ( bGroup === 'format' ) {
			return -1;
		}
		// preserve order
		return 0;
	} );
};

/* Inheritance */

OO.inheritClass( ve.ui.HelpCompletionAction, ve.ui.CompletionAction );

/* Static Properties */

ve.ui.HelpCompletionAction.static.name = 'HelpCompletion';

ve.ui.HelpCompletionAction.static.alwaysIncludeInput = false;

ve.ui.HelpCompletionAction.static.defaultLimit = 99;

/**
 * Definitions of the groups that tools can fall into
 *
 * Tools in a group whose name doesn't appear here will be placed
 * in "other" gruop.
 * The `title` field is used to place a label above the tools
 * in the widget.
 * `mergeWith` references a different group to add these
 * tools to.
 * `weight` can be used to move groups up or down the list.
 * Higher values will appear at the top. The default is 0.
 */
ve.ui.HelpCompletionAction.static.toolGroups = {
	textStyle: {
		title: OO.ui.deferMsg( 'visualeditor-shortcuts-text-style' )
	},
	meta: {
		mergeWith: 'insert'
	},
	object: {
		mergeWith: 'insert'
	},
	format: {
		title: OO.ui.deferMsg( 'visualeditor-shortcuts-formatting' ),
		weight: -2
	},
	dialog: {
		title: OO.ui.deferMsg( 'visualeditor-shortcuts-dialog' )
	},
	other: {
		title: OO.ui.deferMsg( 'visualeditor-shortcuts-other' ),
		weight: -1
	},
	history: {
		title: OO.ui.deferMsg( 'visualeditor-shortcuts-history' ),
		weight: -3
	},
	structure: {
		title: OO.ui.deferMsg( 'visualeditor-toolbar-structure' )
	},
	insert: {
		title: OO.ui.deferMsg( 'visualeditor-shortcuts-insert' ),
		weight: 1
	}
};

/* Methods */

ve.ui.HelpCompletionAction.prototype.open = function ( isolateInput ) {
	if ( !isolateInput ) {
		// Remove undo/redo when inputting in the surface, don't just
		// show them as disabled (they are still available in the toolbar)
		// TODO: One would need to completely ignore the history
		// stack since before the action was triggered to use
		// undo/redo from here. Might not be worth the effort.
		this.toolNames = this.toolNames.filter( ( toolName ) => {
			const tool = this.tools[ toolName ];
			return !( tool instanceof ve.ui.HistoryTool );
		} );
	}

	return ve.ui.HelpCompletionAction.super.prototype.open.apply( this, arguments );
};

ve.ui.HelpCompletionAction.prototype.getToolIndex = function ( toolName ) {
	const tool = this.tools[ toolName ];
	const toolGroups = this.constructor.static.toolGroups;
	const group = this.getGroupForTool( tool );
	return OO.ui.resolveMsg( toolGroups[ group ].title ) + ' ' + tool.getTitle();
};

ve.ui.HelpCompletionAction.prototype.getSuggestions = function ( input ) {
	return ve.createDeferred().resolve( this.filterSuggestionsForInput(
		this.toolNames,
		input
	) );
};

ve.ui.HelpCompletionAction.prototype.compareSuggestionToInput = function ( suggestion, normalizedInput ) {
	const normalizedSuggestion = this.getToolIndex( suggestion ).toLowerCase();

	// Allow character skipping in input, so for example "head2" matches "heading 2" and
	// "blist" matches "bullet list"
	let matchedIndex = 0;
	for ( let i = 0, l = normalizedInput.length; i < l; i++ ) {
		matchedIndex = normalizedSuggestion.indexOf( normalizedInput[ i ], matchedIndex );
		if ( matchedIndex === -1 ) {
			return {
				isMatch: false,
				isExact: false
			};
		}
		matchedIndex++;
	}

	return {
		isMatch: true,
		// isExact is only used when 'alwaysIncludeInput' is set
		isExact: false
	};
};

ve.ui.HelpCompletionAction.prototype.getMenuItemForSuggestion = function ( toolName ) {
	const tool = this.tools[ toolName ];
	return new OO.ui.MenuOptionWidget( {
		data: tool,
		label: tool.getTitle(),
		// HACK: an invalid icon name will render as a spacer for alignment
		icon: tool.getIcon() || tool.constructor.static.fallbackIcon || '_',
		disabled: tool.isDisabled()
	} );
};

/**
 * Get the group associated with a tool, resolving any mergeWith redirects
 *
 * @param {ve.ui.Tool} tool Tool
 * @return {string} Group name
 */
ve.ui.HelpCompletionAction.prototype.getGroupForTool = function ( tool ) {
	const toolGroups = this.constructor.static.toolGroups;
	let group = tool.constructor.static.group;
	if ( toolGroups[ group ] ) {
		if ( toolGroups[ group ].mergeWith ) {
			group = toolGroups[ group ].mergeWith;
		}
	} else {
		group = 'other';
	}
	return group;
};

ve.ui.HelpCompletionAction.prototype.updateMenuItems = function ( menuItems ) {
	const menuItemsByGroup = {};
	const toolGroups = this.constructor.static.toolGroups;
	menuItems.forEach( ( menuItem ) => {
		const tool = menuItem.getData();
		const group = this.getGroupForTool( tool );
		menuItemsByGroup[ group ] = menuItemsByGroup[ group ] || [];
		menuItemsByGroup[ group ].push( menuItem );
	} );
	const newMenuItems = [];
	const groups = Object.keys( menuItemsByGroup );
	groups.sort( ( a, b ) => {
		const weightA = toolGroups[ a ].weight || 0;
		const weightB = toolGroups[ b ].weight || 0;
		return weightB - weightA;
	} );
	groups.forEach( ( group ) => {
		newMenuItems.push(
			new OO.ui.MenuSectionOptionWidget( {
				label: toolGroups[ group ].title
			} )
		);
		ve.batchPush( newMenuItems, menuItemsByGroup[ group ] );
	} );
	return newMenuItems;
};

ve.ui.HelpCompletionAction.prototype.chooseItem = function ( item, range ) {
	// We're completely ignoring the idea that we should be "inserting" anything...
	// Instead, we run the command that was chosen.

	const fragment = this.surface.getModel().getLinearFragment( range, true );
	fragment.removeContent();
	fragment.collapseToEnd();

	const tool = item.getData();
	// Wait for completion widget to close, as the selected tool may
	// trigger another completion widget.
	setTimeout( () => {
		tool.onSelect();
	} );

	return true;
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.HelpCompletionAction );

ve.ui.commandRegistry.register( new ve.ui.Command(
	'openHelpCompletions', ve.ui.HelpCompletionAction.static.name, 'open',
	{ supportedSelections: [ 'linear' ] }
) );
ve.ui.commandRegistry.register( new ve.ui.Command(
	'openHelpCompletionsTrigger', ve.ui.HelpCompletionAction.static.name, 'open',
	{ supportedSelections: [ 'linear', 'table' ], args: [ true ] }
) );

ve.ui.sequenceRegistry.register( new ve.ui.Sequence( 'autocompleteHelpCommands', 'openHelpCompletions', '\\', 0 ) );

ve.ui.triggerRegistry.register(
	'openHelpCompletionsTrigger', {
		// Firefox already uses [ctrl/cmd]+shift+p
		mac: [
			new ve.ui.Trigger( 'cmd+shift+p' ),
			new ve.ui.Trigger( 'cmd+alt+shift+p' )
		],
		pc: [
			new ve.ui.Trigger( 'ctrl+shift+p' ),
			new ve.ui.Trigger( 'ctrl+alt+shift+p' )
		]
	}
);

ve.ui.commandHelpRegistry.register( 'other', 'openHelpCompletions', {
	trigger: 'openHelpCompletionsTrigger',
	sequences: [ 'autocompleteHelpCommands' ],
	label: OO.ui.deferMsg( 'visualeditor-toolbar-search-help-label' )
} );
