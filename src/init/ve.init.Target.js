/*!
 * VisualEditor Initialization Target class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Generic Initialization target.
 *
 * @class
 * @abstract
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {Object} [toolbarConfig] Configuration options for the toolbar
 * @cfg {Object} [modes] Available editing modes. Defaults to static.modes
 * @cfg {Object} [defaultMode] Default mode for new surfaces. Must be in this.modes and defaults to first item.
 */
ve.init.Target = function VeInitTarget( config ) {
	var isIe = ve.init.platform.constructor.static.isInternetExplorer(),
		isEdge = ve.init.platform.constructor.static.isEdge();

	config = config || {};

	// Parent constructor
	ve.init.Target.super.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Register
	ve.init.target = this;

	// Properties
	this.surfaces = [];
	this.surface = null;
	this.toolbar = null;
	this.actionsToolbar = null;
	this.toolbarConfig = config.toolbarConfig || {};
	this.$scrollContainer = this.getScrollContainer();
	this.toolbarScrollOffset = 0;

	this.modes = config.modes || this.constructor.static.modes;
	this.setDefaultMode( config.defaultMode );

	this.setupTriggerListeners();

	// Initialization
	this.$element.addClass( 've-init-target' );

	if ( isIe ) {
		this.$element.addClass( 've-init-target-ie' );
	}

	// We don't have any Edge CSS bugs that aren't present in IE, so
	// use a combined class to simplify selectors.
	if ( isIe || isEdge ) {
		this.$element.addClass( 've-init-target-ie-or-edge' );
	}

	// Events
	this.onDocumentKeyDownHandler = this.onDocumentKeyDown.bind( this );
	this.onTargetKeyDownHandler = this.onTargetKeyDown.bind( this );
	this.onContainerScrollHandler = this.onContainerScroll.bind( this );
	this.bindHandlers();
};

/* Inheritance */

OO.inheritClass( ve.init.Target, OO.ui.Element );

OO.mixinClass( ve.init.Target, OO.EventEmitter );

/* Static Properties */

/**
 * Editing modes available in the target.
 *
 * Must contain at least one mode. Overridden if the #modes config option is used.
 *
 * @static
 * @property {string[]}
 * @inheritable
 */
ve.init.Target.static.modes = [ 'visual' ];

ve.init.Target.static.toolbarGroups = [
	// History
	{ include: [ 'undo', 'redo' ] },
	// Format
	{
		header: OO.ui.deferMsg( 'visualeditor-toolbar-paragraph-format' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-format-tooltip' ),
		type: 'menu',
		include: [ { group: 'format' } ],
		promote: [ 'paragraph' ],
		demote: [ 'preformatted', 'blockquote' ]
	},
	// Text style
	{
		header: OO.ui.deferMsg( 'visualeditor-toolbar-text-style' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-style-tooltip' ),
		include: [ 'bold', 'italic', 'moreTextStyle' ]
	},
	// Link
	{ include: [ 'link' ] },
	// Structure
	{
		header: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
		type: 'list',
		icon: 'listBullet',
		include: [ { group: 'structure' } ],
		demote: [ 'outdent', 'indent' ]
	},
	// Insert
	{
		header: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		type: 'list',
		icon: 'add',
		label: '',
		include: '*'
	},
	// Special character toolbar
	{ include: [ 'specialCharacter' ] }
];

ve.init.Target.static.actionGroups = [];

/**
 * List of commands which can be triggered anywhere from within the document
 *
 * @type {string[]} List of command names
 */
ve.init.Target.static.documentCommands = [ 'commandHelp' ];

/**
 * List of commands which can be triggered from within the target element
 *
 * @type {string[]} List of command names
 */
ve.init.Target.static.targetCommands = [ 'findAndReplace', 'findNext', 'findPrevious' ];

/**
 * List of commands to include in the target
 *
 * Null means all commands in the registry are used (excluding excludeCommands)
 *
 * @type {string[]|null} List of command names
 */
ve.init.Target.static.includeCommands = null;

/**
 * List of commands to exclude from the target entirely
 *
 * @type {string[]} List of command names
 */
ve.init.Target.static.excludeCommands = [];

/**
 * Surface import rules
 *
 * One set for external (non-VE) paste sources and one for all paste sources.
 *
 * Most rules are handled in ve.dm.ElementLinearData#sanitize, but htmlBlacklist
 * is handled in ve.ce.Surface#afterPaste.
 *
 * @type {Object}
 */
ve.init.Target.static.importRules = {
	external: {
		blacklist: [
			// Annotations
			'textStyle/span', 'textStyle/font',
			// Nodes
			'alienInline', 'alienBlock', 'alienTableCell', 'comment', 'div'
		],
		// Selectors to filter. Runs before model type blacklist above.
		htmlBlacklist: {
			// remove: [ 'selectorToRemove' ]
			unwrap: [ 'fieldset', 'legend' ]
		},
		nodeSanitization: true
	},
	all: null
};

/* Static methods */

/**
 * Parse document string into an HTML document
 *
 * @param {string} documentString Document. Note that this must really be a whole document
 *   with a single root tag.
 * @param {string} mode Editing mode
 * @return {HTMLDocument} HTML document
 */
ve.init.Target.static.parseDocument = function ( documentString, mode ) {
	var doc;
	if ( mode === 'source' ) {
		// Parse as plain text in source mode
		doc = ve.createDocumentFromHtml( '' );

		documentString.split( '\n' ).forEach( function ( line ) {
			var p = doc.createElement( 'p' );
			p.appendChild( doc.createTextNode( line ) );
			doc.body.appendChild( p );
		} );
	} else {
		doc = ve.createDocumentFromHtml( documentString );
	}
	return doc;
};

// Deprecated alias
ve.init.Target.prototype.parseDocument = function () {
	return this.constructor.static.parseDocument.apply( this.constructor.static, arguments );
};

/* Methods */

/**
 * Set default editing mode for new surfaces
 *
 * @param {string} defaultMode Editing mode, see static.modes
 */
ve.init.Target.prototype.setDefaultMode = function ( defaultMode ) {
	// Mode is not available
	if ( !this.isModeAvailable( defaultMode ) ) {
		if ( !this.defaultMode ) {
			// Use default mode if nothing has been set
			defaultMode = this.modes[ 0 ];
		} else {
			// Fail if we already have a valid mode
			return;
		}
	}
	if ( defaultMode !== this.defaultMode ) {
		// The follow classes are used here:
		// * ve-init-target-visual
		// * ve-init-target-[modename]
		if ( this.defaultMode ) {
			this.$element.removeClass( 've-init-target-' + this.defaultMode );
		}
		this.$element.addClass( 've-init-target-' + defaultMode );
		this.defaultMode = defaultMode;
	}
};

/**
 * Get default editing mode for new surfaces
 *
 * @return {string} Editing mode
 */
ve.init.Target.prototype.getDefaultMode = function () {
	return this.defaultMode;
};

/**
 * Check if a specific editing mode is available
 *
 * @param {string} mode Editing mode
 * @return {boolean} Editing mode is available
 */
ve.init.Target.prototype.isModeAvailable = function ( mode ) {
	return this.modes.indexOf( mode ) !== -1;
};

/**
 * Bind event handlers to target and document
 */
ve.init.Target.prototype.bindHandlers = function () {
	$( this.getElementDocument() ).on( 'keydown', this.onDocumentKeyDownHandler );
	this.$element.on( 'keydown', this.onTargetKeyDownHandler );
	this.$scrollContainer.on( 'scroll', this.onContainerScrollHandler );
};

/**
 * Unbind event handlers on target and document
 */
ve.init.Target.prototype.unbindHandlers = function () {
	$( this.getElementDocument() ).off( 'keydown', this.onDocumentKeyDownHandler );
	this.$element.off( 'keydown', this.onTargetKeyDownHandler );
	this.$scrollContainer.off( 'scroll', this.onContainerScrollHandler );
};

/**
 * Teardown the target, removing all surfaces, toolbars and handlers
 *
 * @return {jQuery.Promise} Promise which resolves when the target has been torn down
 */
ve.init.Target.prototype.teardown = function () {
	this.unbindHandlers();
	// Wait for the toolbar to teardown before clearing surfaces,
	// as it may want to transition away
	return this.teardownToolbar().then( this.clearSurfaces.bind( this ) );
};

/**
 * Destroy the target
 */
ve.init.Target.prototype.destroy = function () {
	var target = this;
	this.teardown().then( function () {
		target.$element.remove();
		ve.init.target = null;
	} );
};

/**
 * Set up trigger listeners
 */
ve.init.Target.prototype.setupTriggerListeners = function () {
	var surfaceOrSurfaceConfig = this.getSurface() || this.getSurfaceConfig();
	this.documentTriggerListener = new ve.TriggerListener( this.constructor.static.documentCommands, surfaceOrSurfaceConfig.commandRegistry );
	this.targetTriggerListener = new ve.TriggerListener( this.constructor.static.targetCommands, surfaceOrSurfaceConfig.commandRegistry );
};

/**
 * Get the target's scroll container
 *
 * @return {jQuery} The target's scroll container
 */
ve.init.Target.prototype.getScrollContainer = function () {
	return $( this.getElementWindow() );
};

/**
 * Handle scroll container scroll events
 */
ve.init.Target.prototype.onContainerScroll = function () {
	var scrollTop,
		toolbar = this.getToolbar();

	if ( toolbar.isFloatable() ) {
		scrollTop = this.$scrollContainer.scrollTop();

		if ( scrollTop + this.toolbarScrollOffset > toolbar.getElementOffset().top ) {
			toolbar.float();
		} else {
			toolbar.unfloat();
		}
	}
};

/**
 * Handle key down events on the document
 *
 * @param {jQuery.Event} e Key down event
 */
ve.init.Target.prototype.onDocumentKeyDown = function ( e ) {
	var command, surface, trigger = new ve.ui.Trigger( e );
	if ( trigger.isComplete() ) {
		command = this.documentTriggerListener.getCommandByTrigger( trigger.toString() );
		surface = this.getSurface();
		if ( surface && command && command.execute( surface ) ) {
			e.preventDefault();
		}
	}
};

/**
 * Handle key down events on the target
 *
 * @param {jQuery.Event} e Key down event
 */
ve.init.Target.prototype.onTargetKeyDown = function ( e ) {
	var command, surface, trigger = new ve.ui.Trigger( e );
	if ( trigger.isComplete() ) {
		command = this.targetTriggerListener.getCommandByTrigger( trigger.toString() );
		surface = this.getSurface();
		if ( surface && command && command.execute( surface ) ) {
			e.preventDefault();
		}
	}
};

/**
 * Handle toolbar resize events
 */
ve.init.Target.prototype.onToolbarResize = function () {
	this.getSurface().setToolbarHeight( this.getToolbar().getHeight() + this.toolbarScrollOffset );
};

/**
 * Create a target widget.
 *
 * @method
 * @param {Object} [config] Configuration options
 * @return {ve.ui.TargetWidget}
 */
ve.init.Target.prototype.createTargetWidget = function ( config ) {
	return new ve.ui.TargetWidget( config );
};

/**
 * Create a surface.
 *
 * @method
 * @param {ve.dm.Document} dmDoc Document model
 * @param {Object} [config] Configuration options
 * @return {ve.ui.Surface}
 */
ve.init.Target.prototype.createSurface = function ( dmDoc, config ) {
	return new ve.ui.Surface( dmDoc, this.getSurfaceConfig( config ) );
};

/**
 * Get surface configuration options
 *
 * @param {Object} config Configuration option overrides
 * @return {Object} Surface configuration options
 */
ve.init.Target.prototype.getSurfaceConfig = function ( config ) {
	return ve.extendObject( {
		$scrollContainer: this.$scrollContainer,
		commandRegistry: ve.ui.commandRegistry,
		sequenceRegistry: ve.ui.sequenceRegistry,
		dataTransferHandlerFactory: ve.ui.dataTransferHandlerFactory,
		includeCommands: this.constructor.static.includeCommands,
		excludeCommands: OO.simpleArrayUnion(
			this.constructor.static.excludeCommands,
			this.constructor.static.documentCommands,
			this.constructor.static.targetCommands
		),
		importRules: this.constructor.static.importRules
	}, config );
};

/**
 * Add a surface to the target
 *
 * @param {ve.dm.Document} dmDoc Document model
 * @param {Object} [config] Configuration options
 * @return {ve.ui.Surface}
 */
ve.init.Target.prototype.addSurface = function ( dmDoc, config ) {
	var surface = this.createSurface( dmDoc, ve.extendObject( { mode: this.getDefaultMode() }, config ) );
	this.surfaces.push( surface );
	surface.getView().connect( this, {
		focus: this.onSurfaceViewFocus.bind( this, surface )
	} );
	return surface;
};

/**
 * Destroy and remove all surfaces from the target
 */
ve.init.Target.prototype.clearSurfaces = function () {
	// We're about to destroy this.surface, so unset it for sanity
	// Otherwise, getSurface() could return a destroyed surface
	this.surface = null;
	while ( this.surfaces.length ) {
		this.surfaces.pop().destroy();
	}
};

/**
 * Handle focus events from a surface's view
 *
 * @param {ve.ui.Surface} surface Surface firing the event
 */
ve.init.Target.prototype.onSurfaceViewFocus = function ( surface ) {
	this.setSurface( surface );
};

/**
 * Set the target's active surface
 *
 * @param {ve.ui.Surface} surface Surface
 */
ve.init.Target.prototype.setSurface = function ( surface ) {
	if ( this.surfaces.indexOf( surface ) === -1 ) {
		throw new Error( 'Active surface must have been added first' );
	}
	if ( surface !== this.surface ) {
		this.surface = surface;
		this.setupToolbar( surface );
	}
};

/**
 * Get the target's active surface, if it exists
 *
 * @return {ve.ui.Surface|null} Surface
 */
ve.init.Target.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Get the target's toolbar
 *
 * @return {ve.ui.TargetToolbar} Toolbar
 */
ve.init.Target.prototype.getToolbar = function () {
	if ( !this.toolbar ) {
		this.toolbar = new ve.ui.PositionedTargetToolbar( this, this.toolbarConfig );
	}
	return this.toolbar;
};

/**
 * Get the actions toolbar
 *
 * @return {ve.ui.TargetToolbar} Actions toolbar
 */
ve.init.Target.prototype.getActions = function () {
	if ( !this.actionsToolbar ) {
		this.actionsToolbar = new ve.ui.TargetToolbar( this, { position: this.toolbarConfig.position } );
	}
	return this.actionsToolbar;
};

/**
 * Set up the toolbar, attaching it to a surface.
 *
 * @param {ve.ui.Surface} surface Surface
 */
ve.init.Target.prototype.setupToolbar = function ( surface ) {
	var toolbar = this.getToolbar(),
		actions = this.getActions(),
		rAF = window.requestAnimationFrame || setTimeout;

	toolbar.connect( this, { resize: 'onToolbarResize' } );

	toolbar.setup( this.constructor.static.toolbarGroups, surface );
	actions.setup( this.constructor.static.actionGroups, surface );
	this.attachToolbar();
	toolbar.$actions.append( actions.$element );
	rAF( this.onContainerScrollHandler );
};

/**
 * Teardown the toolbar
 *
 * @return {jQuery.Promise} Promise which resolves when the toolbar has been torn down
 */
ve.init.Target.prototype.teardownToolbar = function () {
	if ( this.toolbar ) {
		this.toolbar.destroy();
		this.toolbar = null;
	}
	if ( this.actionsToolbar ) {
		this.actionsToolbar.destroy();
		this.actionsToolbar = null;
	}
	return $.Deferred().resolve().promise();
};

/**
 * Attach the toolbar to the DOM
 */
ve.init.Target.prototype.attachToolbar = function () {
	var toolbar = this.getToolbar();
	toolbar.$element.insertBefore( toolbar.getSurface().$element );
	toolbar.initialize();
	this.getActions().initialize();
};
