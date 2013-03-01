/*!
 * VisualEditor ContentEditable MWHeadingNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MW heading node.
 *
 * @class
 * @extends ve.ce.HeadingNode
 * @constructor
 * @param {ve.dm.MWHeadingNode} model Model to observe
 */
ve.ce.MWHeadingNode = function VeCeMWHeadingNode( model ) {
	// Parent constructor
	ve.ce.HeadingNode.call( this, model );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWHeadingNode, ve.ce.HeadingNode );

/* Static Properties */

// TODO: Make this static
ve.ce.MWHeadingNode.domWrapperElementTypes = ve.ce.HeadingNode.domWrapperElementTypes;

ve.ce.MWHeadingNode.static.name = 'MWheading';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWHeadingNode );
