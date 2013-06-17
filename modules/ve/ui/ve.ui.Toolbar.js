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
	this.$window = null;
	this.windowEvents = {
		'resize': ve.bind( this.onWindowResize, this ),
		'scroll': ve.bind( this.onWindowScroll, this )
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
 * Handle window resize events while toolbar floating is enabled.
 *
 * @returns {jQuery.Event} e Window resize event
 */
ve.ui.Toolbar.prototype.onWindowScroll = function () {
	var scrollTop = this.$window.scrollTop(),
		toolbarOffset = this.$.offset(),
		$lastBranch = this.surface.$.find( '.ve-ce-documentNode > .ve-ce-branchNode:visible:last' ),
		lastBranchOffset = $lastBranch.offset(),
		belowLastBranch = $lastBranch.length &&
			scrollTop + this.$bar.height() >= lastBranchOffset.top;

	if ( scrollTop > toolbarOffset.top ) {
		this.setPosition(
			belowLastBranch ? lastBranchOffset.top - this.$.outerHeight() : 0,
			toolbarOffset.left,
			this.$window.width() - this.$.outerWidth() - toolbarOffset.left
		);
	} else if ( this.floating ) {
		this.resetPosition();
	}
};

/**
 * Handle window scroll events while toolbar floating is enabled.
 *
 * Toolbar will stick to the top of the screen unless it would be over or under the last visible
 * branch node in the root of the document being edited, at which point it will stop just above it.
 *
 * @returns {jQuery.Event} e Window scroll event
 */
ve.ui.Toolbar.prototype.onWindowResize = function () {
	var offset = this.$.offset();

	if ( this.floating ) {
		this.$bar.css( {
			'left': offset.left,
			'right': this.$window.width() - this.$.outerWidth() - offset.left
		} );
	}
};

/**
 * Gets the surface the toolbar controls.
 *
 * @method
 * @returns {ve.ui.Surface} Surface being controlled
 */
ve.ui.Toolbar.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Handle context changes on the surface.
 *
 * @method
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
 *
 * @method
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
			} catch(e) {}
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
 *
 * @method
 */
ve.ui.Toolbar.prototype.destroy = function () {
	this.disableFloating();
	this.surface.getModel().disconnect( this, { 'contextChange': 'onContextChange' } );
	this.$.remove();
};

/**
 * Float the toolbar.
 *
 * @method
 * @param {number} top Top position, in pixels
 * @param {number} left Left position, in pixels
 * @param {number} right Right position, in pixels
 */
ve.ui.Toolbar.prototype.setPosition = function ( top, left, right ) {
	// When switching from default position, manually set the height of the wrapper
	if ( !this.floating ) {
		this.$
			.css( 'height', this.$.height() )
			.addClass( 've-ui-toolbar-floating' );
		this.floating = true;
	}
	this.$bar.css( { 'top': top, 'left': left, 'right': right } );
	if ( top > 0 ) {
		this.$.addClass( 've-ui-toolbar-bottom' );
	} else {
		this.$.removeClass( 've-ui-toolbar-bottom' );
	}
};

/**
 * Reset the toolbar to it's default position.
 *
 * @method
 */
ve.ui.Toolbar.prototype.resetPosition = function () {
	this.$
		.css( 'height', 'auto' )
		.removeClass( 've-ui-toolbar-floating ve-ui-toolbar-bottom' );
	this.$bar.css( { 'top': 0, 'left': 0, 'right': 0 } );
	this.floating = false;
};

/**
 * Add automatic floating behavior to the toolbar.
 *
 * Toolbar floating is not enabled by default, call this on setup to enable it.
 *
 * @method
 */
ve.ui.Toolbar.prototype.enableFloating = function () {
	this.$window = $( this.getElementWindow() );
	this.$window.on( this.windowEvents );
};

/**
 * Remove automatic floating behavior to the toolbar.
 *
 * @method
 */
ve.ui.Toolbar.prototype.disableFloating = function () {
	if ( this.$window ) {
		this.$window.off( this.windowEvents );
		this.$window = null;
	}
	if ( this.floating ) {
		this.resetPosition();
	}
};
