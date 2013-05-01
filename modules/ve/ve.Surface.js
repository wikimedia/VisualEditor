/*!
 * VisualEditor Surface class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * A surface is a top-level object which contains both a surface model and a surface view.
 *
 *     @example
 *     new ve.Surface(
 *         new ve.init.sa.Target( $( '<div>' ).appendTo( document.body ) ),
 *         ve.createDocumentFromHTML( '<p>Hello world.</p>' )
 *     );
 *
 * @class
 *
 * @constructor
 * @param {ve.init.Target} target Integration target to add views to
 * @param {HTMLDocument} doc HTML document to edit
 * @param {Object} options Configuration options
 */
ve.Surface = function VeSurface( target, doc, options ) {
	// Properties
	this.$ = $( '<div>' );
	this.$overlay = $( '<div>' );
	this.target = target;
	this.documentModel = new ve.dm.Document( doc );
	this.options = ve.extendObject( true, ve.Surface.defaultOptions, options );
	this.model = new ve.dm.Surface( this.documentModel );
	this.view = new ve.ce.Surface( this.$, this.model, this );
	this.context = new ve.ui.Context( this );
	this.dialogs = new ve.ui.WindowSet( this, ve.ui.dialogFactory );
	this.toolbars = {};
	this.commands = {};
	this.enabled = true;

	// Initialization
	this.$.addClass( 've-surface' ).appendTo( this.target.$ );
	this.$overlay
		.addClass( 've-surface-overlay' )
		.append( this.context.$, this.dialogs.$ )
		.appendTo( $( 'body' ) );
	this.view.getDocument().getDocumentNode().setLive( true );
	this.setupToolbars();
	this.setupCommands();
	this.resetSelection();
	ve.instances.push( this );
	this.model.startHistoryTracking();

	// Events
	ve.triggerRegistry.connect( this, { 'register': 'onTriggerRegistryRegister' } );

	// Turn off native object editing. This must be tried after the surface has been added to DOM.
	try {
		document.execCommand( 'enableObjectResizing', false, false );
		document.execCommand( 'enableInlineTableEditing', false, false );
	} catch ( e ) { /* Silently ignore */ }
};

/* Static Properties */

ve.Surface.defaultOptions = {
	'toolbars': {
		'top': {
			'float': true,
			'tools': [
				{ 'name': 'history', 'items' : ['undo', 'redo'] },
				{ 'name': 'textStyle', 'items' : ['format'] },
				{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
				{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }
			]
		}
	},
	// Items can either be symbolic names or objects with trigger and action properties
	'commands': ['bold', 'italic', 'link', 'undo', 'redo', 'indent', 'outdent']
};

/* Methods */

/**
 * Handle trigger registry register events.
 *
 * @method
 * @param {string} name Symbolic name of trigger
 * @param {ve.Trigger} trigger Trigger
 */
ve.Surface.prototype.onTriggerRegistryRegister = function ( name, trigger ) {
	this.addTriggers( [trigger], ve.commandRegistry.lookup( name ) );
};

/**
 * Get the surface model.
 *
 * @method
 * @returns {ve.dm.Surface} Surface model
 */
ve.Surface.prototype.getModel = function () {
	return this.model;
};

/**
 * Get the document model.
 *
 * @method
 * @returns {ve.dm.Document} Document model
 */
ve.Surface.prototype.getDocumentModel = function () {
	return this.documentModel;
};

/**
 * Get the surface view.
 *
 * @method
 * @returns {ve.ce.Surface} Surface view
 */
ve.Surface.prototype.getView = function () {
	return this.view;
};

/**
 * Get the context menu.
 *
 * @method
 * @returns {ve.ui.Context} Context user interface
 */
ve.Surface.prototype.getContext = function () {
	return this.context;
};

/**
 * Destroy the surface, releasing all memory and removing all DOM elements.
 *
 * @method
 * @returns {ve.ui.Context} Context user interface
 */
ve.Surface.prototype.destroy = function () {
	ve.instances.splice( ve.instances.indexOf( this ), 1 );
	this.$.remove();
	this.view.destroy();
	this.context.destroy();
};

/**
 * Disable editing.
 *
 * @method
 */
ve.Surface.prototype.disable = function () {
	this.view.disable();
	this.model.disable();
	this.enabled = false;
};

/**
 * Enable editing.
 *
 * @method
 */
ve.Surface.prototype.enable = function () {
	this.enabled = true;
	this.view.enable();
	this.model.enable();
};

/**
 * Check if editing is enabled.
 *
 * @method
 * @returns {boolean} Editing is enabled
 */
ve.Surface.prototype.isEnabled = function () {
	return this.enabled;
};

/**
 * Fix up the initial selection.
 *
 * Reselect the selection and force a poll. This forces the selection to be something reasonable.
 * In Firefox, the initial selection is (0,0), which causes problems (bug 42277).
 *
 * @method
 */
ve.Surface.prototype.resetSelection = function () {
	this.model.getFragment().select();
	this.view.surfaceObserver.poll();
};

/**
 * Execute an action or command.
 *
 * @method
 * @param {string|ve.Trigger} action Name of action or command object
 * @param {string} [method] Name of method
 * @param {Mixed...} [args] Additional arguments for action
 * @returns {boolean} Action or command was executed
 */
ve.Surface.prototype.execute = function ( action, method ) {
	if ( !this.enabled ) {
		return;
	}
	var trigger, obj, ret;
	if ( action instanceof ve.Trigger ) {
		trigger = action.toString();
		if ( trigger in this.commands ) {
			return this.execute.apply( this, this.commands[trigger] );
		}
	} else if ( typeof action === 'string' && typeof method === 'string' ) {
		// Validate method
		if ( ve.actionFactory.doesActionSupportMethod( action, method ) ) {
			// Create an action object and execute the method on it
			obj = ve.actionFactory.create( action, this );
			ret = obj[method].apply( obj, Array.prototype.slice.call( arguments, 2 ) );
			return ret === undefined || !!ret;
		}
	}
	return false;
};

/**
 * Add all commands from initialization options.
 *
 * Commands must be registered through {ve.commandRegsitry} prior to constructing the surface.
 * Setup Triggers registered through {ve.triggerRegistry} prior to constructing the surface.
 * Add listener method to {ve.triggerRegistry} to lazy load triggers.
 *
 * @method
 * @param {string[]} commands Array of symbolic names of registered commands
 */
ve.Surface.prototype.setupCommands = function () {
	var i, len, command,
		commands = this.options.commands;

	for ( i = 0, len = commands.length; i < len; i++ ) {
		command = ve.commandRegistry.lookup( commands[i] );
		if ( !command ) {
			throw new Error( 'No command registered by that name: ' + commands[i] );
		}
		this.addTriggers( [ve.triggerRegistry.lookup( commands[i] )], command );
	}
};

/**
 * Add triggers to surface.
 *
 * @method
 * @param {ve.Trigger[]} triggers Triggers to associate with command
 * @param {Object} command Command to trigger
 */
ve.Surface.prototype.addTriggers = function ( triggers, command ) {
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

/**
 * Initialize the toolbar.
 *
 * This method uses {this.options} for its configuration.
 *
 * @method
 */
ve.Surface.prototype.setupToolbars = function () {
	var name, config, toolbar,
		toolbars = this.options.toolbars;

	for ( name in toolbars ) {
		config = toolbars[name];
		if ( ve.isPlainObject( config ) ) {
			this.toolbars[name] = toolbar = { '$': $( '<div class="ve-ui-toolbar"></div>' ) };
			if ( name === 'top' ) {
				// Add extra sections to the toolbar
				toolbar.$.append(
					'<div class="ve-ui-actions"></div>' +
					'<div style="clear:both"></div>' +
					'<div class="ve-ui-toolbar-shadow"></div>'
				);
				// Wrap toolbar for floating
				toolbar.$wrapper = $( '<div class="ve-ui-toolbar-wrapper"></div>' )
					.append( this.toolbars[name].$ );
				// Add toolbar to surface
				this.$.before( toolbar.$wrapper );
				if ( 'float' in config && config.float === true ) {
					// Float top toolbar
					this.floatTopToolbar();
				}
			}
			toolbar.instance = new ve.ui.Toolbar( toolbar.$, this, config.tools );
		}
	}
};

/*
 * Move the toolbar to the top of the screen if it would normally be out of view.
 *
 * TODO: Determine if this would be better in ui.toolbar vs here.
 * TODO: This needs to be refactored so that it only works on the main editor top tool bar.
 *
 * @method
 */
ve.Surface.prototype.floatTopToolbar = function () {
	if ( !this.toolbars.top ) {
		return;
	}
	var $wrapper = this.toolbars.top.$wrapper,
		$toolbar = this.toolbars.top.$,
		$window = $( window );

	$window.on( {
		'resize': function () {
			if ( $wrapper.hasClass( 've-ui-toolbar-wrapper-floating' ) ) {
				var toolbarsOffset = $wrapper.offset(),
					left = toolbarsOffset.left,
					right = $window.width() - $wrapper.outerWidth() - left;
				$toolbar.css( {
					'left': left,
					'right': right
				} );
			}
		},
		'scroll': function () {
			var left, right,
				toolbarsOffset = $wrapper.offset(),
				$editorDocument = $wrapper.parent().find('.ve-surface .ve-ce-documentNode'),
				$lastBranch = $editorDocument.children( '.ve-ce-branchNode:last' );

			if ( $window.scrollTop() > toolbarsOffset.top ) {
				left = toolbarsOffset.left;
				right = $window.width() - $wrapper.outerWidth() - left;
				// If not floating, set float
				if ( !$wrapper.hasClass( 've-ui-toolbar-wrapper-floating' ) ) {
					$wrapper
						.css( 'height', $wrapper.height() )
						.addClass( 've-ui-toolbar-wrapper-floating' );
					$toolbar.css( {
						'left': left,
						'right': right
					} );
				} else {
					// Toolbar is floated
					if (
						// There's at least one branch
						$lastBranch.length &&
						// Toolbar is at or below the top of last node in the document
						$window.scrollTop() + $toolbar.height() >= $lastBranch.offset().top
					) {
						if ( !$wrapper.hasClass( 've-ui-toolbar-wrapper-bottom' ) ) {
							$wrapper
								.removeClass( 've-ui-toolbar-wrapper-floating' )
								.addClass( 've-ui-toolbar-wrapper-bottom' );
							$toolbar.css({
								'top': $window.scrollTop() + 'px',
								'left': left,
								'right': right
							});
						}
					} else { // Unattach toolbar
						if ( $wrapper.hasClass( 've-ui-toolbar-wrapper-bottom' ) ) {
							$wrapper
								.removeClass( 've-ui-toolbar-wrapper-bottom' )
								.addClass( 've-ui-toolbar-wrapper-floating' );
							$toolbar.css( {
								'top': 0,
								'left': left,
								'right': right
							} );
						}
					}
				}
			} else { // Return toolbar to top position
				if (
					$wrapper.hasClass( 've-ui-toolbar-wrapper-floating' ) ||
					$wrapper.hasClass( 've-ui-toolbar-wrapper-bottom' )
				) {
					$wrapper.css( 'height', 'auto' )
						.removeClass( 've-ui-toolbar-wrapper-floating' )
						.removeClass( 've-ui-toolbar-wrapper-bottom' );
					$toolbar.css( {
						'top': 0,
						'left': 0,
						'right': 0
					} );
				}
			}
		}
	} );
};
