/*!
 * VisualEditor ContentEditable MWBlockImageNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki image node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.MWBlockImageNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWBlockImageNode = function VeCeMWBlockImageNode( model, config ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, config );

	// Properties
	this.$image = $( '<img>' ).attr( 'src', this.model.getAttribute( 'src' ) );

	// Initialization
	// At this moment this.$ has children added to it (thanks to ve.ce.BranchNode.onSplice).
	// In this particular case there is only one child - <figcaption>
	this.$image.prependTo( this.$ );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWBlockImageNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.MWBlockImageNode.static.name = 'MWblockimage';

ve.ce.MWBlockImageNode.static.tagName = 'figure';

/* Methods */

ve.ce.MWBlockImageNode.prototype.setupSlugs = function () {
	// Intentionally empty - as we don't want/need slugs inside figure tag
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWBlockImageNode );
