/**
 * VisualEditor Surface class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.Surface object.
 *
 * A surface is a top-level object which contains both a surface model and a surface view.
 *
 * @class
 * @constructor
 * @param {String} parent Selector of element to attach to
 * @param {HTMLElement} dom HTML element of document to edit
 * @param {Object} options Configuration options
 */
ve.Surface = function VeSurface( parent, dom, options ) {
	// Properties
	this.$ = $( '<div class="ve-surface"></div>' );
	this.documentModel = new ve.dm.Document( ve.dm.converter.getDataFromDom( dom ) );
	this.options = ve.extendObject( true, ve.Surface.defaultOptions, options );
	this.model = new ve.dm.Surface( this.documentModel );
	this.view = new ve.ce.Surface( this.$, this.model, this );
	this.context = new ve.ui.Context( this );
	this.toolbars = {};
	this.commands = {};

	// DOM Changes
	$( parent ).append( this.$ );
	this.$.append(
		// Contain floating content
		$( '<div style="clear: both;"></div>' ),
		// Temporary paste buffer
		// TODO: make 'paste' in surface stateful and remove this attrib
		// TODO: Use a less generic id than "paste", or get rid of the ID alltogether
		$( '<div id="paste" class="paste" contenteditable="true"></div>' )
	);

	// Initialization
	this.setupToolbars();
	this.addCommands( this.options.commands );
	ve.instances.push( this );
	this.model.startHistoryTracking();
};

/* Static Members */

ve.Surface.defaultOptions = {
	'toolbars': {
		'top': {
			'tools': [
				{ 'name': 'history', 'items' : ['undo', 'redo'] },
				{ 'name': 'textStyle', 'items' : ['format'] },
				{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
				{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }
			]
		}
	},
	// Items can either be symbolic names or objects with trigger and action properties
	'commands': ['bold', 'italic', 'link', 'undo', 'redo']
};

/**
 * Common commands that can be invoked by their symbolic names.
 *
 * @static
 * @member
 */
ve.Surface.commands = {
	'bold': {
		'trigger': ['cmd+b', 'ctrl+b'],
		'action': ['annotation', 'toggle', 'textStyle/bold']
	},
	'italic': {
		'trigger': ['cmd+i', 'ctrl+i'],
		'action': ['annotation', 'toggle', 'textStyle/italic']
	},
	'link': {
		'trigger': ['cmd+k', 'ctrl+k'],
		'action': ['inspector', 'open', 'link']
	},
	'undo': {
		'trigger': ['cmd+z', 'ctrl+z'],
		'action': ['history', 'undo']
	},
	'redo': {
		'trigger': ['cmd+shift+z', 'ctrl+shift+z'],
		'action': ['history', 'redo']
	}
};

/* Static Methods */

/**
 * Adds a command that can be referenced by a symbolic name.
 *
 * @static
 * @method
 * @param {String} name Symbolic name of command
 * @param {String|String[]} trigger One or more canonical representations of keyboard triggers
 * @param {Array} action Array containing the action name, method and additional arguments
 */
ve.Surface.registerCommand = function ( name, trigger, action ) {
	ve.Surface.commands[name] = { 'trigger': trigger, 'action': action };
};

/* Methods */

/**
 * Gets a reference to the surface model.
 *
 * @method
 * @returns {ve.dm.Surface} Surface model
 */
ve.Surface.prototype.getModel = function () {
	return this.model;
};

/**
 * Gets a reference to the document model.
 *
 * @method
 * @returns {ve.dm.Document} Document model
 */
ve.Surface.prototype.getDocumentModel = function () {
	return this.documentModel;
};

/**
 * Gets a reference to the surface view.
 *
 * @method
 * @returns {ve.ce.Surface} Surface view
 */
ve.Surface.prototype.getView = function () {
	return this.view;
};

/**
 * Gets a reference to the context user interface.
 *
 * @method
 * @returns {ve.ui.Context} Context user interface
 */
ve.Surface.prototype.getContext = function () {
	return this.context;
};

/**
 * Executes an action or command.
 *
 * @method
 * @param {String|Command} action Name of action or command object
 * @param {String} [method] Name of method
 * @param {Mixed} [...] Additional arguments for action
 * @returns {Boolean} Action or command was executed
 */
ve.Surface.prototype.execute = function ( action, method ) {
	var trigger, obj;
	if ( action instanceof ve.Command ) {
		trigger = action.toString();
		if ( trigger in this.commands ) {
			this.execute.apply( this, this.commands[trigger] );
		}
	} else if ( typeof action === 'string' && typeof method === 'string' ) {
		// Validate method
		if ( ve.actionFactory.doesActionSupportMethod( action, method ) ) {
			// Create an action object and execute the method on it
			obj = ve.actionFactory.create( action, this );
			obj[method].apply( obj, Array.prototype.slice.call( arguments, 2 ) );
		}
	}
	return false;
};

/**
 * Adds a link between a keyboard trigger and an action.
 *
 * @method
 * @param {String|String[]} trigger One or more canonical representations of keyboard triggers
 * @param {Array} action Array containing the action name, method and additional arguments
 */
ve.Surface.prototype.addCommand = function ( triggers, action ) {
	var i, len, trigger;
	if ( !ve.isArray( triggers ) ) {
		triggers = [triggers];
	}
	for ( i = 0, len = triggers.length; i < len; i++ ) {
		// Normalize
		trigger = ( new ve.Command( triggers[i] ) ).toString();
		// Validate
		if ( trigger.length === 0 ) {
			throw new Error( 'Incomplete command: ' + triggers[i] );
		}
		this.commands[trigger] = action;
	}
};

/**
 * Adds multiple links between a keyboard triggers and an actions.
 *
 * Each object's trigger and action properties will be passed directly into
 * {ve.Surface.prototype.addCommand}.
 *
 * @method
 * @param {String[]|Object[]} commands Array of symbolic names of known commands, or objects that
 * each contain a trigger and action property
 */
ve.Surface.prototype.addCommands = function ( commands ) {
	var i, len;
	for ( i = 0, len = commands.length; i < len; i++ ) {
		if ( typeof commands[i] === 'string' ) {
			if ( !( commands[i] in ve.Surface.commands ) ) {
				throw new Error( 'Unknown command: ' + commands[i] );
			}
			this.addCommand(
				ve.Surface.commands[commands[i]].trigger,
				ve.Surface.commands[commands[i]].action
			);
		} else if ( ve.isPlainObject( commands[i] ) ) {
			this.addCommand( commands[i].trigger, commands[i].action );
		} else {
			throw new Error( 'Invalid command, must be name of known command or command object' );
		}
	}
};

/**
 * Initializes the toolbar.
 *
 * This method uses {this.options} for it's configuration.
 *
 * @method
 */
ve.Surface.prototype.setupToolbars = function () {
	var surface = this;

	// Build each toolbar
	$.each( this.options.toolbars, function ( name, config ) {
		if ( config !== null ) {
			if ( name === 'top' ) {
				surface.toolbars[name] = {
					'$wrapper': $( '<div class="ve-ui-toolbar-wrapper"></div>' ),
					'$': $( '<div class="ve-ui-toolbar"></div>' )
						.append(
							$( '<div class="ve-ui-actions"></div>' ),
							$( '<div style="clear:both"></div>' ),
							$( '<div class="ve-ui-toolbar-shadow"></div>' )
						)
				};
				surface.toolbars[name].$wrapper.append( surface.toolbars[name].$ );
				surface.$.before( surface.toolbars[name].$wrapper );

				if ( 'float' in config && config.float === true ) {
					// Float top toolbar
					surface.floatTopToolbar();
				}
			}
			surface.toolbars[name].instance = new ve.ui.Toolbar(
				surface.toolbars[name].$,
				surface,
				config.tools
			);
		}
	} );
};

/*
 * Overlays the toolbar to the top of the screen when it would normally be out of view.
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
