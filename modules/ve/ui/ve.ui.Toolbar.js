/*!
 * VisualEditor UserInterface Toolbar class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface toolbar.
 *
 * @class
 * @extends ve.EventEmitter
 * @constructor
 * @param {jQuery} $container
 * @param {ve.Surface} surface
 * @param {Array} config
 */
ve.ui.Toolbar = function VeUiToolbar( $container, surface, config ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.surface = surface;
	this.$ = $container;
	this.$groups = $( '<div class="ve-ui-toolbarGroups"></div>' );
	this.config = config || {};

	// Events
	this.surface.getModel().on( 'contextChange', ve.bind( this.onContextChange, this ) );

	// Initialization
	this.$.prepend( this.$groups );
	this.setup();
};

/* Inheritance */

ve.inheritClass( ve.ui.Toolbar, ve.EventEmitter );

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
 * @emits "updateState" (nodes, full, partial)
 * @emits "clearState"
 */
ve.ui.Toolbar.prototype.onContextChange = function () {
	var i, len, leafNodes,
		fragment = this.surface.getModel().getFragment(),
		nodes = [];

	leafNodes = fragment.getLeafNodes();
	for ( i = 0, len = leafNodes.length; i < len; i++ ) {
		nodes.push( leafNodes[i].node );
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
