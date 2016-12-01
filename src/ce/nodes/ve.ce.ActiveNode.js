/*!
 * VisualEditor ContentEditable ActiveNode class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Active nodes are editable sections that are nested inside
 * uneditable sections.
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.ce.ActiveNode = function VeCeActiveNode() {
	// Properties
	this.activeNodeSurface = null;
	this.isActiveNodeSetup = false;

	// Events
	this.connect( this, {
		setup: 'onActiveNodeSetup',
		teardown: 'onActiveNodeTeardown'
	} );

	// DOM changes
	this.$element
		.addClass( 've-ce-activeNode' )
		.prop( { contentEditable: 'true', spellcheck: true } );
};

/* Inheritance */

OO.initClass( ve.ce.ActiveNode );

/* Methods */

/**
 * Handle node setup
 */
ve.ce.ActiveNode.prototype.onActiveNodeSetup = function () {
	// Exit if already setup or not attached
	if ( this.isActiveNodeSetup || !this.root ) {
		return;
	}

	this.activeNodeSurface = this.getRoot().getSurface();

	// Events
	this.activeNodeSurface.getModel().connect( this, { select: 'onActiveNodeSurfaceModelSelect' } );

	this.isActiveNodeSetup = true;
};

/**
 * Handle node teardown
 */
ve.ce.ActiveNode.prototype.onActiveNodeTeardown = function () {
	// Events
	this.activeNodeSurface.getModel().disconnect( this );

	this.isActiveNodeSetup = false;
};

/**
 * Handle select events from the surface model.
 *
 * @param {ve.dm.Selection} selection Selection
 */
ve.ce.ActiveNode.prototype.onActiveNodeSurfaceModelSelect = function ( selection ) {
	var coveringRange = selection.getCoveringRange(),
		surface = this.activeNodeSurface,
		activeNode = this;

	if ( coveringRange && this.model.getRange().containsRange( new ve.Range( coveringRange.from ) ) ) {
		// Only set this as the active node if active node is empty, or not a
		// descendent of this node.
		if ( !surface.getActiveNode() || !surface.getActiveNode().traverseUpstream( function ( node ) { return node !== activeNode; } ) ) {
			surface.setActiveNode( this );
		}
		this.$element.addClass( 've-ce-activeNode-active' );
	} else {
		if ( surface.getActiveNode() === this ) {
			surface.setActiveNode( null );
		}
		if ( !selection.isNull() ) {
			this.$element.removeClass( 've-ce-activeNode-active' );
		}
	}
};
