/*!
 * VisualEditor ContentEditable SectionNode class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable section node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.SectionNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.SectionNode = function VeCeSectionNode() {
	// Parent constructor
	ve.ce.SectionNode.super.apply( this, arguments );

	// Properties
	this.surface = null;

	// Events
	this.model.connect( this, { update: 'onUpdate' } );

	this.$element
		.addClass( 've-ce-sectionNode' )
		.prop( 'contentEditable', 'true' );
};

/* Inheritance */

OO.inheritClass( ve.ce.SectionNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.SectionNode.static.name = 'section';

/* Methods */

/**
 * @inheritdoc
 */
ve.ce.SectionNode.prototype.onSetup = function () {
	// Parent method
	ve.ce.SectionNode.super.prototype.onSetup.call( this );

	// Exit if already setup or not attached
	if ( this.isSetup || !this.root ) {
		return;
	}
	this.surface = this.getRoot().getSurface();

	// Events
	this.surface.getModel().connect( this, { select: 'onSurfaceModelSelect' } );
};

/**
 * @inheritdoc
 */
ve.ce.SectionNode.prototype.onTeardown = function () {
	// Parent method
	ve.ce.SectionNode.super.prototype.onTeardown.call( this );

	// Events
	this.surface.getModel().disconnect( this );
};

/**
 * Handle select events from the surface model.
 *
 * @param {ve.dm.Selection} selection Selection
 */
ve.ce.SectionNode.prototype.onSurfaceModelSelect = function ( selection ) {
	var coveringRange = selection.getCoveringRange(),
		sectionNode = this;

	if ( coveringRange && this.model.getRange().containsRange( new ve.Range( coveringRange.start ) ) ) {
		// Only set this as the active node if active node is empty, or not a
		// descendent of this node.
		if ( !this.surface.getActiveNode() || !this.surface.getActiveNode().traverseUpstream( function ( node ) { return node !== sectionNode; } ) ) {
			this.surface.setActiveNode( this );
		}
		this.$element.addClass( 've-ce-sectionNode-active' );
	} else {
		if ( this.surface.getActiveNode() === this ) {
			this.surface.setActiveNode( null );
		}
		if ( !selection.isNull() ) {
			this.$element.removeClass( 've-ce-sectionNode-active' );
		}
	}
};

/**
 * Get the HTML tag name.
 *
 * Tag name is selected based on the model's style attribute.
 *
 * @return {string} HTML tag name
 */
ve.ce.SectionNode.prototype.getTagName = function () {
	var style = this.model.getAttribute( 'style' );

	if ( this.model.constructor.static.matchTagNames.indexOf( style ) === -1 ) {
		throw new Error( 'Invalid style' );
	}
	return style;
};

/**
 * Handle model update events.
 *
 * If the style changed since last update the DOM wrapper will be replaced with an appropriate one.
 *
 * @method
 */
ve.ce.SectionNode.prototype.onUpdate = function () {
	this.updateTagName();
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.SectionNode );
