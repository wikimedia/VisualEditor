/*!
 * VisualEditor ContentEditable HeadingNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable heading node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.HeadingNode} model Model to observe
 */
ve.ce.HeadingNode = function VeCeHeadingNode( model ) {
	// Parent constructor
	ve.ce.ContentBranchNode.call(
		this, model, ve.ce.BranchNode.getDomWrapper( model, 'level' )
	);

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );
};

/* Inheritance */

ve.inheritClass( ve.ce.HeadingNode, ve.ce.ContentBranchNode );

/* Static Properties */

ve.ce.HeadingNode.static.name = 'heading';

/* Static Properties */

ve.ce.HeadingNode.static.canBeSplit = true;

/**
 * Mapping of heading level values and DOM wrapper element types.
 *
 * @static
 * @property
 */
ve.ce.HeadingNode.domWrapperElementTypes = {
	'1': 'h1',
	'2': 'h2',
	'3': 'h3',
	'4': 'h4',
	'5': 'h5',
	'6': 'h6'
};

/* Methods */

/**
 * Handle model update events.
 *
 * If the level changed since last update the DOM wrapper will be replaced with an appropriate one.
 *
 * @method
 */
ve.ce.HeadingNode.prototype.onUpdate = function () {
	this.updateDomWrapper( 'level' );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.HeadingNode );
