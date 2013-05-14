/*!
 * VisualEditor UserInterface Surface class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * A surface is a top-level object which contains both a surface model and a surface view.
 *
 * @class
 * @extends ve.Element
 *
 * @constructor
 * @param {ve.Editor} editor Editor
 * @param {ve.dm.Document} doc Document to edit
 * @param {Object} [config] Config options
 */
ve.ui.Surface = function VeUiSurface( editor, doc, options ) {
	// Parent constructor
	ve.Element.call( this, options );

	// Properties
	this.editor = editor;
	this.model = new ve.dm.Surface( new ve.dm.Document( doc ) );
	this.view = new ve.ce.Surface( this.model, this );
	this.context = new ve.ui.Context( this );
	this.dialogs = new ve.ui.WindowSet( this, ve.ui.dialogFactory );
	this.enabled = true;

	// Initialization
	this.$.addClass( 've-ui-surface' );
	this.$.append( this.view.$ );
	this.editor.$overlay.append( this.dialogs.$, this.context.$ );

	// Make instance globally accessible for debugging
	ve.instances.push( this );
};

/* Inheritance */

ve.inheritClass( ve.ui.Surface, ve.Element );

/* Methods */

ve.ui.Surface.prototype.initialize = function () {
	this.view.initialize();
	// By re-asserting the current selection and forcing a poll we force selection to be something
	// reasonable - otherwise in Firefox, the initial selection is (0,0), causing bug 42277
	this.model.getFragment().select();
	this.view.surfaceObserver.poll();
	this.model.startHistoryTracking();
};

/**
 * Check if editing is enabled.
 *
 * @method
 * @returns {boolean} Editing is enabled
 */
ve.ui.Surface.prototype.isEnabled = function () {
	return this.enabled;
};

/**
 * Get the surface model.
 *
 * @method
 * @returns {ve.dm.Surface} Surface model
 */
ve.ui.Surface.prototype.getModel = function () {
	return this.model;
};

/**
 * Get the surface view.
 *
 * @method
 * @returns {ve.ce.Surface} Surface view
 */
ve.ui.Surface.prototype.getView = function () {
	return this.view;
};

/**
 * Get the context menu.
 *
 * @method
 * @returns {ve.ui.Context} Context user interface
 */
ve.ui.Surface.prototype.getContext = function () {
	return this.context;
};

/**
 * Get the surface view.
 *
 * @method
 * @returns {ve.ce.Surface} Surface view
 */
ve.ui.Surface.prototype.getEditor = function () {
	return this.editor;
};

/**
 * Get dialogs window set.
 *
 * @method
 * @returns {ve.ui.WindowSet} Dialogs window set
 */
ve.ui.Surface.prototype.getDialogs = function () {
	return this.dialogs;
};

/**
 * Destroy the surface, releasing all memory and removing all DOM elements.
 *
 * @method
 * @returns {ve.ui.Context} Context user interface
 */
ve.ui.Surface.prototype.destroy = function () {
	ve.instances.splice( ve.instances.indexOf( this ), 1 );
	this.$.remove();
	this.view.destroy();
};

/**
 * Disable editing.
 *
 * @method
 */
ve.ui.Surface.prototype.disable = function () {
	this.view.disable();
	this.model.disable();
	this.enabled = false;
};

/**
 * Enable editing.
 *
 * @method
 */
ve.ui.Surface.prototype.enable = function () {
	this.enabled = true;
	this.view.enable();
	this.model.enable();
};

/**
 * Execute an action or command.
 *
 * @method
 * @param {ve.ui.Trigger|string} action Trigger or symbolic name of action
 * @param {string} [method] Action method name
 * @param {Mixed...} [args] Additional arguments for action
 * @returns {boolean} Action or command was executed
 */
ve.ui.Surface.prototype.execute = function ( action, method ) {
	if ( !this.enabled ) {
		return;
	}

	var trigger, obj, ret,
		commands = this.editor.getCommands();

	if ( action instanceof ve.ui.Trigger ) {
		trigger = action.toString();
		if ( trigger in commands ) {
			return this.execute.apply( this, commands[trigger] );
		}
	} else if ( typeof action === 'string' && typeof method === 'string' ) {
		// Validate method
		if ( ve.ui.actionFactory.doesActionSupportMethod( action, method ) ) {
			// Create an action object and execute the method on it
			obj = ve.ui.actionFactory.create( action, this );
			ret = obj[method].apply( obj, Array.prototype.slice.call( arguments, 2 ) );
			return ret === undefined || !!ret;
		}
	}
	return false;
};
