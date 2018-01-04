/*!
 * VisualEditor UserInterface TargetWidget class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Creates an ve.ui.TargetWidget object.
 *
 * User must call #initialize after the widget has been attached
 * to the DOM, and also after the document is changed with #setDocument.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {ve.dm.Document} [doc] Initial document model
 * @cfg {Object[]} [tools] Toolbar configuration
 * @cfg {string[]|null} [includeCommands] List of commands to include, null for all registered commands
 * @cfg {string[]} [excludeCommands] List of commands to exclude
 * @cfg {Object} [importRules] Import rules
 * @cfg {boolean} [multiline] Multi-line surface
 * @cfg {string} [placeholder] Placeholder text to display when the surface is empty
 * @cfg {string} [inDialog] The name of the dialog this surface widget is in
 */
ve.ui.TargetWidget = function VeUiTargetWidget( config ) {
	// Config initialization
	config = config || {};

	// Parent constructor
	ve.ui.TargetWidget.super.call( this, config );

	// Properties
	this.commandRegistry = config.commandRegistry || ve.init.target.getSurface().commandRegistry;
	this.sequenceRegistry = config.sequenceRegistry || ve.init.target.getSurface().sequenceRegistry;
	this.dataTransferHandlerFactory = config.dataTransferHandlerFactory || ve.init.target.getSurface().dataTransferHandlerFactory;
	// TODO: Override document/targetTriggerListener
	this.tools = config.tools;
	this.includeCommands = config.includeCommands;
	this.excludeCommands = config.excludeCommands;
	this.multiline = config.multiline !== false;
	this.placeholder = config.placeholder;
	this.importRules = config.importRules;
	this.inDialog = config.inDialog;
	// TODO: Support source widgets
	this.mode = 'visual';

	this.surface = null;
	this.toolbar = null;
	// TODO: Use a TargetToolbar when trigger listeners are set here
	this.$surfaceContainer = $( '<div>' ).addClass( 've-ui-targetWidget-surface' );
	this.$toolbarContainer = $( '<div>' ).addClass( 've-ui-targetWidget-toolbar' );

	if ( config.doc ) {
		this.setDocument( config.doc );
	}

	// Initialization
	this.$element.addClass( 've-ui-targetWidget' )
		.append( this.$toolbarContainer, this.$surfaceContainer );
};

/* Inheritance */

OO.inheritClass( ve.ui.TargetWidget, OO.ui.Widget );

/* Methods */

/**
 * The target's surface has been changed.
 *
 * @event change
 */

/**
 * A document has been attached to the target, and a toolbar and surface created.
 *
 * @event setup
 */

/**
 * Set the document to edit
 *
 * @param {ve.dm.Document} doc Document
 */
ve.ui.TargetWidget.prototype.setDocument = function ( doc ) {
	// Destroy the previous surface
	if ( this.surface ) {
		this.surface.destroy();
	}
	// Toolbars can be re-used
	if ( !this.toolbar ) {
		this.toolbar = new ve.ui.Toolbar();
		this.$toolbarContainer.append( this.toolbar.$element );
	}
	this.surface = ve.init.target.createSurface( doc, {
		mode: this.mode,
		inTargetWidget: true,
		commandRegistry: this.commandRegistry,
		sequenceRegistry: this.sequenceRegistry,
		dataTransferHandlerFactory: this.dataTransferHandlerFactory,
		includeCommands: this.includeCommands,
		excludeCommands: this.excludeCommands,
		importRules: this.importRules,
		multiline: this.multiline,
		placeholder: this.placeholder,
		inDialog: this.inDialog
	} );

	// Events
	this.getSurface().getModel().connect( this, { history: 'onSurfaceModelHistory' } );

	// DOM changes
	this.$surfaceContainer.append( this.surface.$element );
	this.toolbar.$bar.append( this.surface.getToolbarDialogs().$element );

	// Setup toolbar with new surface
	if ( this.tools ) {
		this.toolbar.setup( this.tools, this.surface );
	}

	this.emit( 'setup' );
};

/**
 * Handle history events from the surface model.
 *
 * @fires change
 */
ve.ui.TargetWidget.prototype.onSurfaceModelHistory = function () {
	// Rethrow this event so users don't have to re-bind to
	// surface model 'history' when the surface is changed in #setDocument
	this.emit( 'change' );
};

/**
 * Check if the surface has been modified.
 *
 * @return {boolean} The surface has been modified
 */
ve.ui.TargetWidget.prototype.hasBeenModified = function () {
	return !!this.getSurface() && this.getSurface().getModel().hasBeenModified();
};

/**
 * Get surface.
 *
 * @method
 * @return {ve.ui.Surface|null} Surface
 */
ve.ui.TargetWidget.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Get toolbar.
 *
 * @method
 * @return {OO.ui.Toolbar} Toolbar
 */
ve.ui.TargetWidget.prototype.getToolbar = function () {
	return this.toolbar;
};

/**
 * Get content data.
 *
 * @method
 * @return {ve.dm.ElementLinearData} Content data
 */
ve.ui.TargetWidget.prototype.getContent = function () {
	return this.surface.getModel().getDocument().getData();
};

/**
 * Initialize surface and toolbar.
 *
 * Widget must be attached to DOM before initializing.
 *
 * @method
 */
ve.ui.TargetWidget.prototype.initialize = function () {
	if ( this.surface ) {
		this.toolbar.initialize();
		this.surface.initialize();
	}
};

/**
 * Destroy surface and toolbar.
 *
 * @method
 */
ve.ui.TargetWidget.prototype.clear = function () {
	if ( this.surface ) {
		this.surface.destroy();
		this.surface = null;
	}
	if ( this.toolbar ) {
		this.toolbar.destroy();
		this.toolbar = null;
	}
};

/**
 * Focus the surface.
 */
ve.ui.TargetWidget.prototype.focus = function () {
	if ( this.surface ) {
		this.surface.getView().focus();
	}
};
