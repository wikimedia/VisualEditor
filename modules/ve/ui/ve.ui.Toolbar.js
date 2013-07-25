/*!
 * VisualEditor UserInterface Toolbar class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface toolbar.
 *
 * @class
 * @extends ve.Element
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 * @cfg {boolean} [actions] Add an actions section opposite to the tools
 * @cfg {boolean} [shadow] Add a shadow below the toolbar
 */
ve.ui.Toolbar = function VeUiToolbar( surface, options ) {
	// Configuration initialization
	options = options || {};

	// Parent constructor
	ve.Element.call( this, options );

	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.surface = surface;
	this.$bar = this.$$( '<div>' );
	this.$tools = this.$$( '<div>' );
	this.$actions = this.$$( '<div>' );
	this.floating = false;
	this.floatable = false;
	this.initialized = false;
	this.$window = null;
	this.$surfaceView = null;
	this.elementOffset = null;
	this.windowEvents = {
		'resize': ve.bind( this.onWindowResize, this ),
		'scroll': ve.bind( this.onWindowScroll, this )
	};
	this.surfaceViewEvents = {
		'keyup': ve.bind( this.onSurfaceViewKeyUp, this )
	};

	// Events
	this.$
		.add( this.$bar ).add( this.$tools ).add( this.$actions )
		.on( 'mousedown', false );

	// Initialization
	this.$tools.addClass( 've-ui-toolbar-tools' );
	this.$bar.addClass( 've-ui-toolbar-bar' ).append( this.$tools );
	if ( options.actions ) {
		this.$actions.addClass( 've-ui-toolbar-actions' );
		this.$bar.append( this.$actions );
	}
	this.$bar.append( '<div style="clear:both"></div>' );
	if ( options.shadow ) {
		this.$bar.append( '<div class="ve-ui-toolbar-shadow"></div>' );
	}
	this.$.addClass( 've-ui-toolbar' ).append( this.$bar );

	// Events
	this.surface.getModel().connect( this, { 'contextChange': 'onContextChange' } );
};

/* Inheritance */

ve.inheritClass( ve.ui.Toolbar, ve.Element );

ve.mixinClass( ve.ui.Toolbar, ve.EventEmitter );

/* Events */

/**
 * @event updateState
 * @see ve.dm.SurfaceFragment#getAnnotations
 * @param {ve.dm.Node[]} nodes List of nodes covered by the current selection
 * @param {ve.dm.AnnotationSet} full Annotations that cover all of the current selection
 * @param {ve.dm.AnnotationSet} partial Annotations that cover some or all of the current selection
 */

/* Methods */

/**
 * Sets up handles and preloads required information for the toolbar to work.
 * This must be called immediately after it is attached to a visible document.
 */
ve.ui.Toolbar.prototype.initialize = function () {
	this.initialized = true;
	this.$window = $( this.getElementWindow() );
	this.$surfaceView = this.surface.getView().$;
	this.elementOffset = this.$.offset();
	this.elementOffset.right = this.$window.width() - this.$.outerWidth() - this.elementOffset.left;

	// Initial position. Could be invalidated by the first
	// call to onWindowScroll, but users of this event (e.g toolbarTracking)
	// need to also now the non-floating position.
	this.surface.emit( 'toolbarPosition', this.$bar, {
		'floating': false,
		'offset': this.elementOffset
	} );

	if ( this.floatable ) {
		this.$window.on( this.windowEvents );
		this.$surfaceView.on( this.surfaceViewEvents );
		// The page may start with a non-zero scroll position
		this.onWindowScroll();
	}
};

/**
 * Handle window resize events while toolbar floating is enabled.
 *
 * @returns {jQuery.Event} e Window resize event
 */
ve.ui.Toolbar.prototype.onWindowScroll = function () {
	var scrollTop = this.$window.scrollTop();

	if ( scrollTop > this.elementOffset.top ) {
		this.float();
	} else if ( this.floating ) {
		this.unfloat();
	}
};

/**
 * Handle window resize events while toolbar floating is enabled.
 *
 * Toolbar will stick to the top of the screen unless it would be over or under the last visible
 * branch node in the root of the document being edited, at which point it will stop just above it.
 *
 * @see ve.ui.Surface#event-toolbarPosition
 * @returns {jQuery.Event} e Window scroll event
 */
ve.ui.Toolbar.prototype.onWindowResize = function () {
	var update = {},
		offset = this.elementOffset;

	// Update right offset after resize (see #float)
	offset.right = this.$window.width() - this.$.outerWidth() - offset.left;
	update.offset = offset;

	if ( this.floating ) {
		update.css = { 'right': offset.right };
		this.$bar.css( update.css );
	}

	// If we're not floating, toolbar position didn't change.
	// But the dimensions did naturally change on resize, as did the right offset.
	// Which e.g. mw.ViewPageTarget's toolbarTracker needs.
	this.surface.emit( 'toolbarPosition', this.$bar, update );
};

/**
 * Method to scroll to the cursor position while toolbar is floating on keyup only if
 * the cursor is obscured by the toolbar.
 */
ve.ui.Toolbar.prototype.onSurfaceViewKeyUp = function () {
	var cursorPos = this.surface.view.getSelectionRect(),
		barHeight = this.$bar.height(),
		scrollTo = this.$bar.offset().top - barHeight + ( cursorPos.end.y - cursorPos.start.y ),
		obscured = cursorPos.start.y - this.$window.scrollTop() < barHeight;

	// If toolbar is floating and cursor is obscured, scroll cursor into view
	if ( obscured && this.floating ) {
		$( 'html, body' ).animate( { scrollTop: scrollTo }, 0 );
	}
};

/**
 * Gets the surface the toolbar controls.
 *
 * @returns {ve.ui.Surface} Surface being controlled
 */
ve.ui.Toolbar.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Handle context changes on the surface.
 *
 * @emits updateState
 */
ve.ui.Toolbar.prototype.onContextChange = function () {
	var i, len, leafNodes,
		fragment = this.surface.getModel().getFragment( null, false ),
		nodes = [];

	leafNodes = fragment.getLeafNodes();
	for ( i = 0, len = leafNodes.length; i < len; i++ ) {
		if ( len === 1 || !leafNodes[i].range || leafNodes[i].range.getLength() ) {
			nodes.push( leafNodes[i].node );
		}
	}
	this.emit( 'updateState', nodes, fragment.getAnnotations(), fragment.getAnnotations( true ) );
};

/**
 * Initialize all tools and groups.
 */
ve.ui.Toolbar.prototype.addTools = function ( tools ) {
	var i, j, group, $group, tool;

	for ( i = 0; i < tools.length; i++ ) {
		group = tools[i];
		// Create group
		$group = this.$$( '<div class="ve-ui-toolbar-group"></div>' )
			.on( 'mousedown', false );
		if ( group.label ) {
			$group.append(
				this.$$( '<div class="ve-ui-toolbar-label"></div>' ).html( group.label )
			);
		}
		// Add tools
		for ( j = 0; j < group.items.length; j++ ) {
			tool = false;
			try {
				tool = ve.ui.toolFactory.create( group.items[j], this );
			} catch( e ) {}
			if ( tool ) {
				$group.append( tool.$ );
			}
		}
		// Append group
		this.$tools.append( $group );
	}
};

/**
 * Destroys toolbar, removing event handlers and DOM elements.
 *
 * Call this whenever you are done using a toolbar.
 */
ve.ui.Toolbar.prototype.destroy = function () {
	this.disableFloatable();
	this.surface.getModel().disconnect( this, { 'contextChange': 'onContextChange' } );
	this.$.remove();
};

/**
 * Float the toolbar.
 *
 * @see ve.ui.Surface#event-toolbarPosition
 */
ve.ui.Toolbar.prototype.float = function () {
	var update;
	if ( !this.floating ) {
		// When switching into floating mode, set the height of the wrapper and
		// move the bar to the same offset as the in-flow element
		update = {
			'css': { 'left': this.elementOffset.left, 'right': this.elementOffset.right },
			'floating': true
		};
		this.$
			.css( 'height', this.$.height() )
			.addClass( 've-ui-toolbar-floating' );
		this.$bar.css( update.css );
		this.floating = true;

		this.surface.emit( 'toolbarPosition', this.$bar, update );
	}
};

/**
 * Reset the toolbar to it's default non-floating position.
 *
 * @see ve.ui.Surface#event-toolbarPosition
 */
ve.ui.Toolbar.prototype.unfloat = function () {
	if ( this.floating ) {
		this.$
			.css( 'height', '' )
			.removeClass( 've-ui-toolbar-floating' );
		this.$bar.css( { 'left': '', 'right': '' } );
		this.floating = false;

		this.surface.emit( 'toolbarPosition', this.$bar, { 'floating': false } );
	}
};

/**
 * Set automatic floating behavior to the toolbar.
 *
 * Toolbar floating is not enabled by default, call this on setup to enable it.
 * This will not make it float, but it will start listening for events that
 * will result in it potentially being floated and defloated accordingly.
 */
ve.ui.Toolbar.prototype.enableFloatable = function () {
	this.floatable = true;

	if ( this.initialized ) {
		this.$window.on( this.windowEvents );
		this.$surfaceView.on( this.surfaceViewEvents );
	}
};

/**
 * Remove automatic floating behavior to the toolbar.
 */
ve.ui.Toolbar.prototype.disableFloatable = function () {
	if ( this.$window ) {
		this.$window.off( this.windowEvents );
	}

	if ( this.$surfaceView ) {
		this.$surfaceView.off( this.surfaceViewEvents );
	}

	if ( this.floating ) {
		this.unfloat();
	}

	this.floatable = false;
};
