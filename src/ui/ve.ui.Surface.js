/*!
 * VisualEditor UserInterface Surface class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * A surface is a top-level object which contains both a surface model and a surface view.
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {HTMLDocument|Array|ve.dm.ElementLinearData|ve.dm.Document} dataOrDoc Document data to edit
 * @param {Object} [config] Configuration options
 * @cfg {string} [mode] Editing mode
 * @cfg {jQuery} [$scrollContainer] The scroll container of the surface
 * @cfg {ve.ui.CommandRegistry} [commandRegistry] Command registry to use
 * @cfg {ve.ui.SequenceRegistry} [sequenceRegistry] Sequence registry to use
 * @cfg {ve.ui.DataTransferHandlerFactory} [dataTransferHandlerFactory] Data transfer handler factory to use
 * @cfg {string[]|null} [includeCommands] List of commands to include, null for all registered commands
 * @cfg {string[]} [excludeCommands] List of commands to exclude
 * @cfg {Object} [importRules] Import rules
 * @cfg {boolean} [multiline=true] Multi-line surface
 * @cfg {string} [placeholder] Placeholder text to display when the surface is empty
 * @cfg {string} [inDialog] The name of the dialog this surface is in
 */
ve.ui.Surface = function VeUiSurface( dataOrDoc, config ) {
	var documentModel;

	config = config || {};

	// Parent constructor
	ve.ui.Surface.super.call( this, config );

	// Properties
	this.$scrollContainer = config.$scrollContainer || $( this.getElementWindow() );
	this.inDialog = config.inDialog || '';
	this.mode = config.mode;

	// The following classes are used here:
	// * ve-ui-overlay-global-mobile
	// * ve-ui-overlay-global-desktop
	this.globalOverlay = new ve.ui.Overlay( { classes: [ 've-ui-overlay-global', 've-ui-overlay-global-' + ( OO.ui.isMobile() ? 'mobile' : 'desktop' ) ] } );
	this.localOverlay = new ve.ui.Overlay( { classes: [ 've-ui-overlay-local' ] } );
	this.$selections = $( '<div>' );
	this.$blockers = $( '<div>' );
	this.$controls = $( '<div>' );
	this.$menus = $( '<div>' );
	this.$placeholder = $( '<div>' ).addClass( 've-ui-surface-placeholder' );
	this.commandRegistry = config.commandRegistry || ve.ui.commandRegistry;
	this.sequenceRegistry = config.sequenceRegistry || ve.ui.sequenceRegistry;
	this.dataTransferHandlerFactory = config.dataTransferHandlerFactory || ve.ui.dataTransferHandlerFactory;
	this.commands = OO.simpleArrayDifference(
		config.includeCommands || this.commandRegistry.getNames(), config.excludeCommands || []
	);
	this.triggerListener = new ve.TriggerListener( this.commands, this.commandRegistry );
	if ( dataOrDoc instanceof ve.dm.Document ) {
		// ve.dm.Document
		documentModel = dataOrDoc;
	} else if ( dataOrDoc instanceof ve.dm.ElementLinearData || Array.isArray( dataOrDoc ) ) {
		// LinearData or raw linear data
		documentModel = new ve.dm.Document( dataOrDoc );
	} else {
		// HTMLDocument
		documentModel = ve.dm.converter.getModelFromDom( dataOrDoc );
	}
	this.model = this.createModel( documentModel );
	this.view = this.createView( this.model );
	this.dialogs = this.createDialogWindowManager();
	this.importRules = config.importRules || {};
	this.multiline = config.multiline !== false;
	this.context = this.createContext();
	this.progresses = [];
	this.showProgressDebounced = ve.debounce( this.showProgress.bind( this ) );
	this.filibuster = null;
	this.debugBar = null;
	this.placeholder = null;
	this.placeholderVisible = false;
	this.setPlaceholder( config.placeholder );
	this.scrollPosition = null;

	this.toolbarHeight = 0;
	this.toolbarDialogs = new ve.ui.ToolbarDialogWindowManager( this, {
		factory: ve.ui.windowFactory,
		modal: false
	} );

	// Events
	this.getModel().connect( this, { select: 'scrollCursorIntoView' } );
	this.getModel().getDocument().connect( this, { transact: 'onDocumentTransact' } );
	this.dialogs.connect( this, { opening: 'onWindowOpening' } );
	this.context.getInspectors().connect( this, { opening: 'onWindowOpening' } );
	this.getView().connect( this, { position: 'onViewPosition' } );

	// Initialization
	this.$menus.append( this.context.$element );
	this.$element
		// The following classes are used here:
		// * ve-ui-surface-visual
		// * ve-ui-surface-source
		.addClass( 've-ui-surface ve-ui-surface-' + this.mode )
		.append( this.view.$element );
	this.view.$element.after( this.localOverlay.$element );
	this.localOverlay.$element.append( this.$selections, this.$blockers, this.$controls, this.$menus );
	this.globalOverlay.$element.append( this.dialogs.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.Surface, OO.ui.Widget );

/* Events */

/**
 * When a surface is destroyed.
 *
 * @event destroy
 */

/**
 * The surface was scrolled programmatically
 *
 * @event scroll
 */

/**
 * The surface has been submitted by user action, e.g. Ctrl+Enter
 *
 * @event submit
 */

/* Static Properties */

/**
 * The surface is for use on mobile devices
 *
 * @static
 * @inheritable
 * @property {boolean}
 */
ve.ui.Surface.static.isMobile = false;

/* Methods */

/* eslint-disable valid-jsdoc */

/**
 * Destroy the surface, releasing all memory and removing all DOM elements.
 *
 * @method
 * @chainable
 * @fires destroy
 */
ve.ui.Surface.prototype.destroy = function () {
	// Stop periodic history tracking in model
	this.model.stopHistoryTracking();

	// Destroy the ce.Surface, the ui.Context and window managers
	this.context.destroy();
	this.dialogs.destroy();
	this.toolbarDialogs.destroy();
	this.view.destroy();
	if ( this.debugBar ) {
		this.debugBar.destroy();
	}

	// Disconnect events
	this.dialogs.disconnect( this );
	this.context.getInspectors().disconnect( this );

	this.toggleMobileGlobalOverlay( false );

	// Remove DOM elements
	this.$element.remove();
	this.globalOverlay.$element.remove();

	// Let others know we have been destroyed
	this.emit( 'destroy' );

	return this;
};

/**
 * Initialize surface.
 *
 * This must be called after the surface has been attached to the DOM.
 *
 * @chainable
 */
ve.ui.Surface.prototype.initialize = function () {
	// Attach globalOverlay to the global <body>, not the local frame's <body>
	$( 'body' ).append( this.globalOverlay.$element );

	if ( ve.debug ) {
		this.setupDebugBar();
	}

	// The following classes can be used here:
	// * ve-ui-surface-dir-ltr
	// * ve-ui-surface-dir-rtl
	this.$element.addClass( 've-ui-surface-dir-' + this.getDir() );

	this.getView().initialize();
	this.getModel().initialize();
	return this;
};

/**
 * Get the DOM representation of the surface's current state.
 *
 * @return {HTMLDocument|string} HTML document (visual mode) or text (source mode)
 */
ve.ui.Surface.prototype.getDom = function () {
	return this.getModel().getDom();
};

/**
 * Get the HTML representation of the surface's current state.
 *
 * @return {string} HTML
 */
ve.ui.Surface.prototype.getHtml = function () {
	return this.getModel().getHtml();
};

/**
 * Get the surface's editing mode
 *
 * @return {string} Editing mode
 */
ve.ui.Surface.prototype.getMode = function () {
	return this.mode;
};

/**
 * Create a context.
 *
 * @method
 * @return {ve.ui.Context} Context
 */
ve.ui.Surface.prototype.createContext = function () {
	return OO.ui.isMobile() ? new ve.ui.MobileContext( this ) : new ve.ui.DesktopContext( this );
};

/**
 * Create a dialog window manager.
 *
 * @method
 * @return {ve.ui.WindowManager} Dialog window manager
 */
ve.ui.Surface.prototype.createDialogWindowManager = function () {
	return OO.ui.isMobile() ?
		new ve.ui.MobileWindowManager( this, {
			factory: ve.ui.windowFactory,
			overlay: this.globalOverlay
		} ) :
		new ve.ui.SurfaceWindowManager( this, { factory: ve.ui.windowFactory } );
};

/**
 * Create a surface model
 *
 * @param {ve.dm.Document} doc Document model
 * @return {ve.dm.Surface} Surface model
 */
ve.ui.Surface.prototype.createModel = function ( doc ) {
	return new ve.dm.Surface( doc, { sourceMode: this.getMode() === 'source' } );
};

/**
 * Create a surface view
 *
 * @param {ve.dm.Surface} model Surface model
 * @return {ve.ce.Surface} Surface view
 */
ve.ui.Surface.prototype.createView = function ( model ) {
	return new ve.ce.Surface( model, this );
};

/**
 * Check if the surface is for use on mobile devices
 *
 * @return {boolean} The surface is for use on mobile devices
 */
ve.ui.Surface.prototype.isMobile = function () {
	return this.constructor.static.isMobile;
};

/**
 * Set up the debug bar and insert it into the DOM.
 */
ve.ui.Surface.prototype.setupDebugBar = function () {
	this.debugBar = new ve.ui.DebugBar( this );
	this.$element.append( this.debugBar.$element );
};

/**
 * Get the bounding rectangle of the surface, relative to the viewport.
 *
 * @return {Object|null} Object with top, bottom, left, right, width and height properties.
 *  Null if the surface is not attached.
 */
ve.ui.Surface.prototype.getBoundingClientRect = function () {
	// We would use getBoundingClientRect(), but in iOS7 that's relative to the
	// document rather than to the viewport
	return this.$element[ 0 ].getClientRects()[ 0 ] || null;
};

/**
 * Get vertical measurements of the visible area of the surface viewport
 *
 * @return {Object|null} Object with top, left, bottom, and height properties. Null if the surface is not attached.
 */
ve.ui.Surface.prototype.getViewportDimensions = function () {
	var top, bottom,
		rect = this.getBoundingClientRect();

	if ( !rect ) {
		return null;
	}

	top = Math.max( this.toolbarHeight - rect.top, 0 );
	bottom = $( this.getElementWindow() ).height() - rect.top;

	return {
		top: top,
		left: rect.left,
		bottom: bottom,
		height: bottom - top
	};
};

/**
 * Check if editing is enabled.
 *
 * @deprecated Use #isDisabled
 * @method
 * @return {boolean} Editing is enabled
 */
ve.ui.Surface.prototype.isEnabled = function () {
	return !this.isDisabled();
};

/**
 * Get the surface model.
 *
 * @method
 * @return {ve.dm.Surface} Surface model
 */
ve.ui.Surface.prototype.getModel = function () {
	return this.model;
};

/**
 * Get the surface view.
 *
 * @method
 * @return {ve.ce.Surface} Surface view
 */
ve.ui.Surface.prototype.getView = function () {
	return this.view;
};

/**
 * Get the context menu.
 *
 * @method
 * @return {ve.ui.Context} Context user interface
 */
ve.ui.Surface.prototype.getContext = function () {
	return this.context;
};

/**
 * Get dialogs window set.
 *
 * @method
 * @return {ve.ui.WindowManager} Dialogs window set
 */
ve.ui.Surface.prototype.getDialogs = function () {
	return this.dialogs;
};

/**
 * Get toolbar dialogs window set.
 *
 * @return {ve.ui.WindowManager} Toolbar dialogs window set
 */
ve.ui.Surface.prototype.getToolbarDialogs = function () {
	return this.toolbarDialogs;
};

/**
 * Get the local overlay.
 *
 * Local overlays are attached to the same frame as the surface.
 *
 * @method
 * @return {ve.ui.Overlay} Local overlay
 */
ve.ui.Surface.prototype.getLocalOverlay = function () {
	return this.localOverlay;
};

/**
 * Get the global overlay.
 *
 * Global overlays are attached to the top-most frame.
 *
 * @method
 * @return {ve.ui.Overlay} Global overlay
 */
ve.ui.Surface.prototype.getGlobalOverlay = function () {
	return this.globalOverlay;
};

/**
 * @inheritdoc
 */
ve.ui.Surface.prototype.setDisabled = function ( disabled ) {
	if ( disabled !== this.disabled && this.disabled !== null ) {
		if ( disabled ) {
			this.view.disable();
			this.model.disable();
		} else {
			this.view.enable();
			this.model.enable();
		}
	}
	// Parent method
	return ve.ui.Surface.super.prototype.setDisabled.call( this, disabled );
};

/**
 * Disable editing.
 *
 * @deprecated Use #setDisabled
 * @method
 * @chainable
 */
ve.ui.Surface.prototype.disable = function () {
	return this.setDisabled( true );
};

/**
 * Enable editing.
 *
 * @deprecated Use #setDisabled
 * @method
 * @chainable
 */
ve.ui.Surface.prototype.enable = function () {
	return this.setDisabled( false );
};

/**
 * Give focus to the surface
 */
ve.ui.Surface.prototype.focus = function () {
	this.getView().focus();
};

/* eslint-enable valid-jsdoc */

/**
 * Handle transact events from the document model
 *
 * @param {ve.dm.Transaction} Transaction
 */
ve.ui.Surface.prototype.onDocumentTransact = function () {
	if ( this.placeholder ) {
		this.updatePlaceholder();
	}
};

/**
 * Scroll the cursor into view
 *
 * Called in response to selection events.
 *
 * This is required when the cursor disappears under the floating toolbar.
 */
ve.ui.Surface.prototype.scrollCursorIntoView = function () {
	var view, clientRect, surfaceRect, cursorTop, cursorBottom, scrollTo, bottomBound, topBound;

	view = this.getView();

	if ( !view.nativeSelection.focusNode || OO.ui.contains( view.$pasteTarget[ 0 ], view.nativeSelection.focusNode, true ) ) {
		return;
	}

	if ( this.getView().dragging ) {
		// Allow native scroll behavior while dragging, as the start/end
		// points are unreliable until we're finished. Without this, trying to
		// drag a selection larger than a single screen will sometimes lock
		// the viewport in place, as it tries to keep the wrong end of the
		// selection on-screen.
		return;
	}

	// We only care about the focus end of the selection, the anchor never
	// moves and should be allowed off screen. Thus, we collapse the selection
	// to the anchor point (collapseToTo) before measuring.
	clientRect = this.getView().getSelection( this.getModel().getSelection().collapseToTo() ).getSelectionBoundingRect();
	if ( !clientRect ) {
		return;
	}

	// We want viewport-relative coordinates, so we need to translate it
	surfaceRect = this.getBoundingClientRect();
	clientRect = ve.translateRect( clientRect, surfaceRect.left, surfaceRect.top );

	// TODO: this has some long-standing assumptions that we're going to be in
	// the context we expect. If we get VE in a scrollable div or suchlike,
	// we'd no longer be able to make these assumptions about top/bottom of
	// window.
	topBound = this.toolbarHeight; // top of the window + height of the toolbar
	bottomBound = window.innerHeight; // bottom of the window

	cursorTop = clientRect.top - 5;
	cursorBottom = clientRect.bottom + 5;

	if ( cursorTop < topBound ) {
		scrollTo = this.$scrollContainer.scrollTop() + ( cursorTop - topBound );
		this.scrollTo( scrollTo );
	} else if ( cursorBottom > bottomBound ) {
		scrollTo = this.$scrollContainer.scrollTop() + ( cursorBottom - bottomBound );
		this.scrollTo( scrollTo );
	}
};

/**
 * Scroll the scroll container to a specific offset
 *
 * @param {number} offset Scroll offset
 * @fires scroll
 */
ve.ui.Surface.prototype.scrollTo = function ( offset ) {
	this.$scrollContainer.scrollTop( offset );
	this.emit( 'scroll' );
};

/**
 * Handle an dialog opening event.
 *
 * @param {OO.ui.Window} win Window that's being opened
 * @param {jQuery.Promise} opening Promise resolved when window is opened; when the promise is
 *   resolved the first argument will be a promise which will be resolved when the window begins
 *   closing, the second argument will be the opening data
 * @param {Object} data Window opening data
 */
ve.ui.Surface.prototype.onWindowOpening = function ( win, opening ) {
	var surface = this;

	if ( OO.ui.isMobile() ) {
		opening
			.progress( function ( data ) {
				if ( data.state === 'setup' ) {
					surface.toggleMobileGlobalOverlay( true );
				}
			} )
			.always( function ( opened ) {
				opened.always( function ( closed ) {
					closed.always( function () {
						surface.toggleMobileGlobalOverlay( false );
					} );
				} );
			} );
	}
};

/**
 * Show or hide mobile global overlay.
 *
 * @param {boolean} show Show the global overlay.
 */
ve.ui.Surface.prototype.toggleMobileGlobalOverlay = function ( show ) {
	var $body = $( 'body' );

	if ( !OO.ui.isMobile() ) {
		return;
	}

	// Store current position before we set overflow: hidden on body
	if ( show ) {
		this.scrollPosition = $body.scrollTop();
	}

	$( 'html, body' ).toggleClass( 've-ui-overlay-global-mobile-enabled', show );
	this.globalOverlay.$element.toggleClass( 've-ui-overlay-global-mobile-visible', show );

	// Restore previous position after we remove overflow: hidden on body
	if ( !show ) {
		$body.scrollTop( this.scrollPosition );
	}
};

/**
 * Set placeholder text
 *
 * @param {string} [placeholder] Placeholder text, clears placeholder if not set
 */
ve.ui.Surface.prototype.setPlaceholder = function ( placeholder ) {
	this.placeholder = placeholder;
	if ( this.placeholder ) {
		this.$placeholder.prependTo( this.$element );
		this.updatePlaceholder();
	} else {
		this.$placeholder.detach();
		this.placeholderVisible = false;
		this.getView().$element.css( 'min-height', '' );
	}
};

/**
 * Update placeholder rendering
 */
ve.ui.Surface.prototype.updatePlaceholder = function () {
	var firstNode, $wrapper,
		hasContent = this.getModel().getDocument().data.hasContent();

	this.$placeholder.toggleClass( 'oo-ui-element-hidden', hasContent );
	this.placeholderVisible = !hasContent;
	if ( !hasContent ) {
		// Use a clone of the first node in the document so the placeholder
		// styling matches the text the users sees when they start typing
		firstNode = this.getView().documentView.documentNode.getNodeFromOffset( 1 );
		if ( firstNode ) {
			$wrapper = firstNode.$element.clone();
			if ( ve.debug ) {
				// In debug mode a background colour from the render animation may be present
				$wrapper.removeAttr( 'style' );
			}
		} else {
			$wrapper = $( '<p>' );
		}
		this.$placeholder.empty().append( $wrapper.text( this.placeholder ) );
	} else {
		this.getView().$element.css( 'min-height', '' );
	}
};

/**
 * Handle position events from the view
 */
ve.ui.Surface.prototype.onViewPosition = function () {
	if ( this.placeholderVisible ) {
		this.getView().$element.css( 'min-height', this.$placeholder.outerHeight() );
	}
};

/**
 * Get list of commands available on this surface.
 *
 * @return {string[]} Commands
 */
ve.ui.Surface.prototype.getCommands = function () {
	return this.commands;
};

/**
 * Execute an action or command.
 *
 * @method
 * @param {ve.ui.Trigger|string} triggerOrAction Trigger or symbolic name of action
 * @param {string} [method] Action method name
 * @param {...Mixed} [args] Additional arguments for action
 * @return {boolean} Action or command was executed
 */
ve.ui.Surface.prototype.execute = function ( triggerOrAction, method ) {
	var command, obj, ret;

	if ( this.isDisabled() ) {
		return;
	}

	if ( triggerOrAction instanceof ve.ui.Trigger ) {
		command = this.triggerListener.getCommandByTrigger( triggerOrAction.toString() );
		if ( command ) {
			// Have command call execute with action arguments
			return command.execute( this );
		}
	} else if ( typeof triggerOrAction === 'string' && typeof method === 'string' ) {
		// Validate method
		if ( ve.ui.actionFactory.doesActionSupportMethod( triggerOrAction, method ) ) {
			// Create an action object and execute the method on it
			obj = ve.ui.actionFactory.create( triggerOrAction, this );
			ret = obj[ method ].apply( obj, Array.prototype.slice.call( arguments, 2 ) );
			return ret === undefined || !!ret;
		}
	}
	return false;
};

/**
 * Execute a command by name
 *
 * @param {string} commandName Command name
 * @return {boolean} The command was executed
 */
ve.ui.Surface.prototype.executeCommand = function ( commandName ) {
	var command = this.commandRegistry.lookup( commandName );
	if ( command ) {
		return command.execute( this );
	}
	return false;
};

/**
 * Set the current height of the toolbar.
 *
 * Used for scroll-into-view calculations.
 *
 * @param {number} toolbarHeight Toolbar height
 */
ve.ui.Surface.prototype.setToolbarHeight = function ( toolbarHeight ) {
	this.toolbarHeight = toolbarHeight;
};

/**
 * Create a progress bar in the progress dialog
 *
 * @param {jQuery.Promise} progressCompletePromise Promise which resolves when the progress action is complete
 * @param {jQuery|string|Function} label Progress bar label
 * @param {boolean} nonCancellable Progress item can't be cancelled
 * @return {jQuery.Promise} Promise which resolves with a progress bar widget and a promise which fails if cancelled
 */
ve.ui.Surface.prototype.createProgress = function ( progressCompletePromise, label, nonCancellable ) {
	var progressBarDeferred = $.Deferred();

	this.progresses.push( {
		label: label,
		cancellable: !nonCancellable,
		progressCompletePromise: progressCompletePromise,
		progressBarDeferred: progressBarDeferred
	} );

	this.showProgressDebounced();

	return progressBarDeferred.promise();
};

ve.ui.Surface.prototype.showProgress = function () {
	var progresses = this.progresses;

	this.dialogs.openWindow( 'progress', { progresses: progresses, $returnFocusTo: null } );
	this.progresses = [];
};

/**
 * Get sanitization rules for rich paste
 *
 * @return {Object} Import rules
 */
ve.ui.Surface.prototype.getImportRules = function () {
	return this.importRules;
};

/**
 * Check if the surface is multi-line
 *
 * @return {boolean} Surface is multi-line
 */
ve.ui.Surface.prototype.isMultiline = function () {
	return this.multiline;
};

/**
 * Surface 'dir' property (GUI/User-Level Direction)
 *
 * @return {string} 'ltr' or 'rtl'
 */
ve.ui.Surface.prototype.getDir = function () {
	return this.$element.css( 'direction' );
};

ve.ui.Surface.prototype.initFilibuster = function () {
	var surface = this;
	this.filibuster = new ve.Filibuster()
		.wrapClass( ve.EventSequencer )
		.wrapNamespace( ve.dm, 've.dm', [
			// Blacklist
			ve.dm.LinearSelection.prototype.getDescription,
			ve.dm.TableSelection.prototype.getDescription,
			ve.dm.NullSelection.prototype.getDescription
		] )
		.wrapNamespace( ve.ce, 've.ce' )
		.wrapNamespace( ve.ui, 've.ui', [
			// Blacklist
			ve.ui.Surface.prototype.startFilibuster,
			ve.ui.Surface.prototype.stopFilibuster
		] )
		.setObserver( 'dm doc', function () {
			return JSON.stringify( ve.Filibuster.static.clonePlain(
				surface.model.documentModel.data.data
			) );
		} )
		.setObserver( 'dm selection', function () {
			var selection = surface.model.selection;
			if ( !selection ) {
				return 'null';
			}
			return selection.getDescription();
		} )
		.setObserver( 'DOM doc', function () {
			return ve.serializeNodeDebug( surface.view.$element[ 0 ] );
		} )
		.setObserver( 'DOM selection', function () {
			var nativeRange,
				nativeSelection = surface.view.nativeSelection;
			if ( nativeSelection.rangeCount === 0 ) {
				return 'null';
			}
			nativeRange = nativeSelection.getRangeAt( 0 );
			return JSON.stringify( {
				startContainer: ve.serializeNodeDebug( nativeRange.startContainer ),
				startOffset: nativeRange.startOffset,
				endContainer: (
					nativeRange.startContainer === nativeRange.endContainer ?
						'(=startContainer)' :
						ve.serializeNodeDebug( nativeRange.endContainer )
				),
				endOffset: nativeRange.endOffset
			} );
		} );
};

ve.ui.Surface.prototype.startFilibuster = function () {
	if ( !this.filibuster ) {
		this.initFilibuster();
	} else {
		this.filibuster.clearLogs();
	}
	this.filibuster.start();
};

ve.ui.Surface.prototype.stopFilibuster = function () {
	this.filibuster.stop();
};

/**
 * Get the name of the dialog this surface is in
 *
 * @return {string} The name of the dialog this surface is in
 */
ve.ui.Surface.prototype.getInDialog = function () {
	return this.inDialog;
};
