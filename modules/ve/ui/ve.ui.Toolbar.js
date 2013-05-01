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
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {jQuery} $container
 * @param {ve.Surface} surface
 * @param {Array} config
 */
ve.ui.Toolbar = function VeUiToolbar( $container, surface, config ) {
	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.surface = surface;
	this.$ = $container;
	this.$groups = $( '<div>' );
	this.config = config || {};

	// Events
	this.surface.getModel().connect( this, { 'contextChange': 'onContextChange' } );

	// Initialization
	this.$groups.addClass( 've-ui-toolbarGroups' );
	this.$.prepend( this.$groups );
	this.setup();
};

/* Inheritance */

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
 * Gets the surface the toolbar controls.
 *
 * @method
 * @returns {ve.Surface} Surface being controlled
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
ve.ui.Toolbar.prototype.setup = function () {
	var i, j, group, $group, tool;
	for ( i = 0; i < this.config.length; i++ ) {
		group = this.config[i];
		// Create group
		$group = $( '<div class="ve-ui-toolbarGroup"></div>' )
			.addClass( 've-ui-toolbarGroup-' + group.name );
		if ( group.label ) {
			$group.append( $( '<div class="ve-ui-toolbarLabel"></div>' ).html( group.label ) );
		}
		// Add tools
		for ( j = 0; j < group.items.length; j++ ) {
			tool = ve.ui.toolFactory.create( group.items[j], this );
			if ( !tool ) {
				throw new Error( 'Unknown tool: ' + group.items[j] );
			}
			$group.append( tool.$ );
		}
		// Append group
		this.$groups.append( $group );
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
	this.surface.getModel().disconnect( this, { 'contextChange': 'onContextChange' } );
	this.$.remove();
};
