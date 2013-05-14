/*!
 * VisualEditor Surface class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * A surface is a top-level object which contains both a surface model and a surface view.
 *
 * @class
 *
 * @constructor
 * @param {ve.init.Target} target Integration target to add views to
 * @param {HTMLDocument} doc HTML document to edit
 * @param {Object} [options] Configuration options
 * @cfg {Object[]} [toolbar] List of toolbar group objects with name and items properties, items
 *   being an array of symbolic tool names
 * @cfg {String[]|Object[]} [commands] List of symbolic names of commands in the command registry -
 *   Commands must be registered through {ve.commandRegistry} prior to constructing a surface that
 *   uses them
 * @cfg {jQuery} [$toolbarWrapper=$('<div>')] Element to append toolbar to
 */
ve.Surface = function VeSurface( target, doc, options ) {
	// Options
	options = ve.extendObject( true, ve.Surface.defaultOptions, options );

	// Properties
	this.$ = $( '<div>' );
	this.$overlay = $( '<div>' );
	this.$toolbar = $( '<div>' );
	this.$toolbarWrapper = options.$toolbarWrapper || $( '<div>' );
	this.target = target;
	this.documentModel = new ve.dm.Document( doc );
	this.model = new ve.dm.Surface( this.documentModel );
	this.view = new ve.ce.Surface( this.$, this.model, this );
	this.context = new ve.ui.Context( this );
	this.dialogs = new ve.ui.WindowSet( this, ve.ui.dialogFactory );
	this.toolbar = new ve.ui.Toolbar( this.$toolbar, this, options.toolbar );
	this.commands = {};
	this.enabled = true;

	// Initialization
	this.$
		.addClass( 've-surface' )
		.appendTo( this.target.$ );
	this.$overlay
		.addClass( 've-surface-overlay' )
		.append( this.context.$, this.dialogs.$ )
		.appendTo( $( 'body' ) );
	this.$toolbar
		.addClass( 've-ui-toolbar' )
		.append(
			'<div class="ve-ui-actions"></div>' +
			'<div style="clear:both"></div>' +
			'<div class="ve-ui-toolbar-shadow"></div>'
		);
	this.$toolbarWrapper
		.addClass( 've-ui-toolbar-wrapper' )
		.append( this.$toolbar );
	if ( !options.$toolbarWrapper ) {
		this.$.before( this.$toolbarWrapper );
	}
	this.view.getDocument().getDocumentNode().setLive( true );
	this.addCommands( options.commands );
	// Initialize selection
	// By re-asserting the current selection and forcing a poll we force selection to be something
	// reasonable - otherwise in Firefox, the initial selection is (0,0), causing bug 42277
	this.model.getFragment().select();
	this.view.surfaceObserver.poll();
	this.model.startHistoryTracking();
	// Make instance globally accessible for debugging
	ve.instances.push( this );

	// Events
	ve.triggerRegistry.connect( this, { 'register': 'onTriggerRegistryRegister' } );
};

/* Static Properties */

ve.Surface.defaultOptions = {
	'toolbar': [
		{ 'name': 'history', 'items' : ['undo', 'redo'] },
		{ 'name': 'textStyle', 'items' : ['format'] },
		{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
		{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }
	],
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
 * Check if editing is enabled.
 *
 * @method
 * @returns {boolean} Editing is enabled
 */
ve.Surface.prototype.isEnabled = function () {
	return this.enabled;
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
 * @method
 * @param {string[]|Object[]} commands List of symbolic names of commands in the command registry
 */
ve.Surface.prototype.addCommands = function ( commands ) {
	var i, len, command;

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
